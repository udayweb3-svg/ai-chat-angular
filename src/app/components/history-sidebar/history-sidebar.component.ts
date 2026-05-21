import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChatHistoryService, ChatSession } from '../../services/chat-history.service';

@Component({
  selector: 'app-history-sidebar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './history-sidebar.component.html',
  styleUrls: ['./history-sidebar.component.css']
})
export class HistorySidebarComponent implements OnInit {
  sessions: ChatSession[] = [];
  currentSessionId: string | null = null;
  showConfirmDelete = false;
  deleteSessionId: string | null = null;

  constructor(private historyService: ChatHistoryService) {}

  ngOnInit(): void {
    this.historyService.sessions$.subscribe(sessions => {
      this.sessions = sessions;
    });

    this.historyService.currentSession$.subscribe(session => {
      this.currentSessionId = session?.id ?? null;
    });
  }

  createNewChat(): void {
    this.historyService.createSession();
  }

  selectSession(session: ChatSession): void {
    this.historyService.setCurrentSession(session);
  }

  deleteSession(sessionId: string, event: Event): void {
    event.stopPropagation();
    this.deleteSessionId = sessionId;
    this.showConfirmDelete = true;
  }

  confirmDelete(): void {
    if (this.deleteSessionId) {
      this.historyService.deleteSession(this.deleteSessionId);
    }
    this.showConfirmDelete = false;
    this.deleteSessionId = null;
  }

  cancelDelete(): void {
    this.showConfirmDelete = false;
    this.deleteSessionId = null;
  }

  clearAll(): void {
    if (confirm('Are you sure you want to clear all chat history?')) {
      this.historyService.clearAllSessions();
    }
  }

  formatDate(date: Date): string {
    const d = new Date(date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (d.toDateString() === today.toDateString()) {
      return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } else if (d.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  }
}
