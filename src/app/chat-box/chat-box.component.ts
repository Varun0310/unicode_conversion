import { Component } from '@angular/core';
import { SupportChatService } from '../services/support-chat.service';

interface ChatMessage {
  from: 'user' | 'bot';
  text: string;
  time: string;
}

@Component({
  selector: 'app-chat-box',
  standalone: false,
  templateUrl: './chat-box.component.html',
  styleUrls: ['./chat-box.component.scss']
})
export class ChatBoxComponent {

  messages: ChatMessage[] = [
    {
      from: 'bot',
      text: '👋 Hi! I’m Fino Pay Support. How can I help you today?',
      time: 'Now'
    }
  ];


  userMessage: string = '';
  loading = false;

  constructor(private chatService: SupportChatService) { }

  send() {
    if (!this.userMessage.trim()) return;

    const userText = this.userMessage;

    // 1️⃣ Show user message
    this.messages.push({
      from: 'user',
      text: userText,
      time: new Date().toLocaleTimeString()
    });

    this.userMessage = '';
    this.loading = true;

    // 2️⃣ Show typing indicator
    this.messages.push({
      from: 'bot',
      text: 'Typing...',
      time: ''
    });

    this.chatService.sendToGemini(userText).subscribe({
      next: (res) => {
        this.messages.pop();
        this.messages.push({
          from: 'bot',
          text: res.reply,
          time: new Date().toLocaleTimeString()
        });
        this.loading = false;
      },
      error: (err) => {
        this.messages.pop();
        console.error('API error:', err);

        this.messages.push({
          from: 'bot',
          text: '⚠️ Support is temporarily unavailable. Please try again.',
          time: new Date().toLocaleTimeString()
        });

        this.loading = false;
      }

    });

  }
}
