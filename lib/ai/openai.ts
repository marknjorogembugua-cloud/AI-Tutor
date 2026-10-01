import OpenAI from 'openai';
import type { AIProvider, AICompleteOpts } from './provider';

export class OpenAIProvider implements AIProvider {
    private client: OpenAI;
    constructor() {
        this.client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });
    }
    async complete(opts: AICompleteOpts): Promise<string> {
        const messages = [
            ...(opts.system ? [{ role: 'system' as const, content: opts.system }] : []),
            ...opts.messages,
        ];
        const res = await this.client.chat.completions.create({
            model: 'gpt-4o-mini',
            messages,
            temperature: opts.temperature ?? 0.4,
            max_tokens: opts.maxTokens ?? 700,
            response_format: opts.json ? { type: 'json_object' } : undefined,
        });
        return res.choices[0]?.message?.content ?? '';
    }
}