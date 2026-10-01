import type { AIProvider, AICompleteOpts } from './provider';

const API_URL = 'https://api.anthropic.com/v1/messages';
const API_VERSION = '2023-06-01';

/**
 * Anthropic provider built on fetch to avoid pulling in the SDK.
 * The Messages API takes `system` out-of-band and has no `response_format`,
 * so JSON mode is requested by instruction instead.
 */
export class AnthropicProvider implements AIProvider {
    private apiKey: string;

    constructor() {
        const key = process.env.ANTHROPIC_API_KEY;
        if (!key) throw new Error('ANTHROPIC_API_KEY is not set');
        this.apiKey = key;
    }

    async complete(opts: AICompleteOpts): Promise<string> {
        const system = [
            opts.system,
            opts.json ? 'Respond with a single valid JSON object and nothing else. No prose, no code fences.' : '',
        ]
            .filter(Boolean)
            .join('\n\n');

        const res = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'content-type': 'application/json',
                'x-api-key': this.apiKey,
                'anthropic-version': API_VERSION,
            },
            body: JSON.stringify({
                model: process.env.ANTHROPIC_MODEL || 'claude-3-5-haiku-latest',
                max_tokens: opts.maxTokens ?? 700,
                temperature: opts.temperature ?? 0.4,
                ...(system ? { system } : {}),
                messages: opts.messages.filter((m) => m.role !== 'system'),
            }),
        });

        if (!res.ok) {
            const body = await res.text().catch(() => '');
            throw new Error(`Anthropic API ${res.status}: ${body.slice(0, 300)}`);
        }

        const data = (await res.json()) as { content?: { type: string; text?: string }[] };
        return (data.content ?? [])
            .filter((c) => c.type === 'text' && typeof c.text === 'string')
            .map((c) => c.text as string)
            .join('');
    }
}
