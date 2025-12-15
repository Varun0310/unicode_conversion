import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class SupportChatService {

    private apiUrl = 'http://localhost:3000/api/openai/chat';

    constructor(private http: HttpClient) { }

    sendToGemini(message: string) {
        return this.http.post<{ reply: string }>(
            'http://localhost:3000/api/gemini/chat',
            { message }
        );
    }
}
