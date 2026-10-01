export interface AIMessage { role: 'system' | 'user' | 'assistant'; content: string; }

export interface AICompleteOpts {
    system?: string;
    messages: AIMessage[];
    json?: boolean;
    temperature?: number;
    maxTokens?: number;
}

export interface AIProvider {
    complete(opts: AICompleteOpts): Promise<string>;
}

let cached: AIProvider | null = null;

export function getAI(): AIProvider {
    if (cached) return cached;
    const which = process.env.AI_PROVIDER || 'openai';
    if (which === 'openai') {
        const { OpenAIProvider } = require('./openai');
        cached = new OpenAIProvider();
    } else if (which === 'anthropic') {
        const { AnthropicProvider } = require('./anthropic');
        cached = new AnthropicProvider();
    } else {
        throw new Error(`Unknown AI_PROVIDER: ${which}`);
    }
    return cached!;
}

export function safeJSON<T>(raw: string): T {
    // Tolerate code fences and stray text around JSON
    const cleaned = raw.replace(/```json|```/g, '').trim();
    const first = cleaned.indexOf('{');
    const firstArr = cleaned.indexOf('[');
    const start = firstArr === -1 ? first : (first === -1 ? firstArr : Math.min(first, firstArr));
    const end = Math.max(cleaned.lastIndexOf('}'), cleaned.lastIndexOf(']'));
    const slice = start >= 0 && end > start ? cleaned.slice(start, end + 1) : cleaned;
    return JSON.parse(slice) as T;
}