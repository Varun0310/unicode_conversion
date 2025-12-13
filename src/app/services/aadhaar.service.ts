import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AadhaarService {
  // Use proxy '/api/aadhaar' or full backend URL like 'http://localhost:3000/api/aadhaar'
  private base = 'http://localhost:3000/api/aadhaar';

  constructor(private http: HttpClient) {}

  uploadAadhaar(formData: FormData): Observable<any> {
    return this.http.post(this.base, formData);
  }

  getByUserId(userId: string) {
    return this.http.get(`${this.base}/${userId}`);
  }
}
