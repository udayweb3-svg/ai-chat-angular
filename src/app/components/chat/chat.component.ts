import { Component, ViewChild, ElementRef, AfterViewChecked, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GeminiService, message } from '../../services/gemini.service';
import { ChatHistoryService, ChatSession } from '../../services/chat-history.service';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements AfterViewChecked, OnInit {
@ViewChild('scrollContainer') private scrollContainer!: ElementRef;
private shouldScroll = false;
private isStreamingMessage = false;

@Output() toggleSidebar = new EventEmitter<void>();

messages: message[] = [];
userInput: string = '';
isLoading: boolean = false;
currentSession: ChatSession | null = null;

constructor(
  private geminiService: GeminiService,
  private historyService: ChatHistoryService
) {}

onToggleSidebar(): void {
  this.toggleSidebar.emit();
}

ngOnInit(): void {
  // Listen to current session changes
  this.historyService.currentSession$.subscribe(session => {
    this.currentSession = session;
    if (session) {
      this.messages = [...session.messages];
      // Scroll to bottom when switching sessions
      setTimeout(() => this.scrollToBottom(), 0);
    }
  });

  // Create initial session if none exists
  const currentSession = this.historyService.getCurrentSession();
  if (!currentSession) {
    this.historyService.createSession();
  }
}

ngAfterViewChecked(): void {
  if (this.shouldScroll) {
    this.scrollToBottom();
    this.shouldScroll = false;
  }
}

private scrollToBottom(): void {
  if (this.scrollContainer) {
    this.scrollContainer.nativeElement.scrollTop = this.scrollContainer.nativeElement.scrollHeight;
  }
}

async sendMessage(): Promise<void> {
  if (!this.userInput.trim() || this.isLoading) return;

  const userMessage: message = {
    role: 'user',
    content: this.userInput,
    timestamp: new Date()
  };
  
  this.userInput = '';
  this.messages.push(userMessage);
  this.isLoading = true;
  this.shouldScroll = true;

  // Save user message to history
  if (this.currentSession) {
    this.historyService.addMessageToSession(this.currentSession.id, userMessage);
  }

  try {
    const response = await this.geminiService.sendMessage(userMessage.content);
    const aiMessage: message = {
      role: 'ai',
      content: response,
      timestamp: new Date()
    };
    
    this.messages.push(aiMessage);
    this.shouldScroll = true;

    // Save AI message to history
    if (this.currentSession) {
      this.historyService.addMessageToSession(this.currentSession.id, aiMessage);
    }
  } catch (error) {
    console.error('Error sending message:', error);
    const errorMessage: message = {
      role: 'ai',
      content: 'Sorry, there was an error processing your request. Please try again.',
      timestamp: new Date()
    };
    this.messages.push(errorMessage);
    this.shouldScroll = true;

    if (this.currentSession) {
      this.historyService.addMessageToSession(this.currentSession.id, errorMessage);
    }
  } finally {
    this.isLoading = false;
    this.shouldScroll = true;
  }
}

onKeyPress(event: KeyboardEvent): void {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault();
    this.sendMessage();
  }
}
}