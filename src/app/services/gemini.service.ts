import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

export interface message {
  role: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

// ✅ Fixed: matches actual Gemini API response shape
interface GeminiResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{ text?: string }>;
      role?: string;
    };
  }>;
  error?: { message: string };
}

@Injectable({
  providedIn: 'root'
})
export class GeminiService {
  private history: Array<{ role: 'user' | 'ai'; content: string }> = [];

  private readonly modelCandidates = [
  'gemini-flash-latest',
  'gemini-1.5-flash-latest',
  'gemini-1.0-pro'
];
  private readonly endpointBase =
    'https://generativelanguage.googleapis.com/v1beta/models/';

  async sendMessage(userMessage: string): Promise<string> {
    this.history.push({ role: 'user', content: userMessage });

    const payload = this.buildRequestPayload();

    try {
      const result = await this.sendRequestWithFallback(payload);
      const aiText = this.parseResponse(result);
      const cleanedText = aiText?.trim() || 'Sorry, I could not generate a response.';
      this.history.push({ role: 'ai', content: cleanedText });
      return cleanedText;
    } catch (error) {
      console.error('Error sending message:', error);
      const fallback = this.getMockResponse(userMessage);
      this.history.push({ role: 'ai', content: fallback });
      return fallback;
    }
  }

  private buildRequestPayload(): unknown {
    const contents = this.history.map((entry) => ({
      role: entry.role === 'user' ? 'user' : 'model',
      parts: [{ text: entry.content }]
    }));

    return { contents };
  }

  private parseResponse(result: GeminiResponse): string {
    return result.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
  }

  private async sendRequestWithFallback(payload: unknown): Promise<GeminiResponse> {
  return await this.fetchModelResponse(payload);
}

  private async fetchModelResponse(payload: unknown): Promise<GeminiResponse> {
  const response = await fetch('/api/chat', { 
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  const result = (await response.json()) as GeminiResponse;

  if (!response.ok) {
    const error = new Error(result.error?.message || `HTTP ${response.status}`);
    (error as any).retryable = response.status === 503 || response.status === 429;
    throw error;
  }

  return result;
}

  private isRetryableError(error: unknown): boolean {
    return !!(error && typeof error === 'object' && 'retryable' in error && (error as any).retryable);
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private getMockResponse(userMessage: string): string {
    const normalized = userMessage.toLowerCase();
    if (/^(hi|hello|hey)\b/.test(normalized)) return 'Hi there! How can I help you today?';
    if (/ai|artificial intelligence|machine learning/.test(normalized))
      return 'AI works by learning patterns from data and using them to make predictions or generate responses.';
    return 'This is a mock response while the Gemini API is unavailable.';
  }
}
