import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class FinanceService {
  private base = 'http://localhost:3000/api/finance';

  constructor(private http: HttpClient) {}

  // SAVE finance (userId comes in BODY)
  saveFinance(payload: any): Observable<any> {
    return this.http.post(this.base, payload);
  }

  // GET finance by userId
  getFinance(userId: string): Observable<any> {
    return this.http.get(`${this.base}/${userId}`);
  }
}
