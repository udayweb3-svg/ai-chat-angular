import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { message } from './gemini.service';

export interface ChatSession {
  id: string;
  title: string;
  messages: message[];
  createdAt: Date;
  updatedAt: Date;
}

@Injectable({
  providedIn: 'root'
})
export class ChatHistoryService {
  private readonly storageKey = 'chat_sessions';
  private readonly maxSessions = 20;
  private sessionsSubject = new BehaviorSubject<ChatSession[]>([]);
  private currentSessionSubject = new BehaviorSubject<ChatSession | null>(null);

  sessions$ = this.sessionsSubject.asObservable();
  currentSession$ = this.currentSessionSubject.asObservable();

  constructor() {
    this.loadSessionsFromStorage();
  }

  private loadSessionsFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const sessions = JSON.parse(stored) as ChatSession[];
        // Convert date strings back to Date objects
        const parsedSessions = sessions.map(s => ({
          ...s,
          createdAt: new Date(s.createdAt),
          updatedAt: new Date(s.updatedAt)
        }));
        this.sessionsSubject.next(parsedSessions);
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
      this.sessionsSubject.next([]);
    }
  }

  createSession(title?: string): ChatSession {
    const id = this.generateId();
    const now = new Date();
    const session: ChatSession = {
      id,
      title: title || `Chat ${new Date().toLocaleDateString()}`,
      messages: [],
      createdAt: now,
      updatedAt: now
    };

    const sessions = this.sessionsSubject.value;
    const updated = [session, ...sessions].slice(0, this.maxSessions);
    this.sessionsSubject.next(updated);
    this.saveToStorage();
    this.setCurrentSession(session);
    return session;
  }

  setCurrentSession(session: ChatSession): void {
    this.currentSessionSubject.next(session);
  }

  getCurrentSession(): ChatSession | null {
    return this.currentSessionSubject.value;
  }

  addMessageToSession(sessionId: string, message: message): void {
    const sessions = this.sessionsSubject.value;
    const sessionIndex = sessions.findIndex(s => s.id === sessionId);
    
    if (sessionIndex !== -1) {
      const updatedSession = { ...sessions[sessionIndex] };
      updatedSession.messages.push(message);
      updatedSession.updatedAt = new Date();
      
      // Update title based on first user message if default title
      if (updatedSession.title.startsWith('Chat ') && message.role === 'user') {
        const preview = message.content.substring(0, 30);
        updatedSession.title = preview.length < message.content.length 
          ? preview + '...' 
          : preview;
      }

      const updated = [...sessions];
      updated[sessionIndex] = updatedSession;
      this.sessionsSubject.next(updated);
      this.saveToStorage();
      
      // Update current session if it's the same
      if (this.currentSessionSubject.value?.id === sessionId) {
        this.currentSessionSubject.next(updatedSession);
      }
    }
  }

  deleteSession(sessionId: string): void {
    const sessions = this.sessionsSubject.value.filter(s => s.id !== sessionId);
    this.sessionsSubject.next(sessions);
    this.saveToStorage();

    // If deleted session was current, switch to first or create new
    if (this.currentSessionSubject.value?.id === sessionId) {
      if (sessions.length > 0) {
        this.setCurrentSession(sessions[0]);
      } else {
        this.createSession();
      }
    }
  }

  clearAllSessions(): void {
    this.sessionsSubject.next([]);
    this.saveToStorage();
    this.createSession();
  }

  getSessionById(id: string): ChatSession | undefined {
    return this.sessionsSubject.value.find(s => s.id === id);
  }

  private saveToStorage(): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.sessionsSubject.value));
    } catch (error) {
      console.error('Error saving chat history:', error);
    }
  }

  private generateId(): string {
    return `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
