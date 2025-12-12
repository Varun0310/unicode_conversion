import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
@Injectable({ providedIn: 'root' })
export class AuthService {
    base = 'http://localhost:3000/api/auth';
    constructor(private http: HttpClient) { }
    register(payload: any) { return this.http.post(`${this.base}/register`, payload); }
    login(payload: any) { return this.http.post(`${this.base}/login`, payload); }
}