import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

interface TranslateResponse {
  translatedText: string;
}

@Injectable({
  providedIn: 'root',
})
export class TranslateService {
  private apiUrl = 'http://localhost:3000/api/translate';

  constructor(private http: HttpClient) {}

  translate(text: string, targetLang: string): Observable<TranslateResponse> {
    return this.http.post<TranslateResponse>(this.apiUrl, {
      q: text,
      target: targetLang,
    });
  }
}
