import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class LanguageService {
    private lang$ = new BehaviorSubject<string>('en');
    currentLang$ = this.lang$.asObservable();

    setLang(lang: string) { this.lang$.next(lang); }
    getLang() { return this.lang$.value; }
}
