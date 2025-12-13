import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CustomerService {
  private base = 'http://localhost:3000/api/customers';

  constructor(private http: HttpClient) {}

  uploadCustomer(
    userId: string,
    name: string,
    phone: string,
    file: File
  ): Observable<any> {
    const fd = new FormData();
    fd.append('userId', userId);
    fd.append('name', name);
    fd.append('phone', phone);
    fd.append('image', file);

    return this.http.post(this.base, fd);
  }
}
