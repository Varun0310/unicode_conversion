import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

const LANG_KEY = 'currentLang';
const DEFAULT_LANG = 'en';

@Injectable({ providedIn: 'root' })
export class LanguageService {
    getLang() {
        throw new Error('Method not implemented.');
    }
    private lang$ = new BehaviorSubject<string>('en');
    currentLang$ = this.lang$.asObservable();

    private readInitialLang(): string {
        const stored = localStorage.getItem(LANG_KEY);
        return stored ? stored : DEFAULT_LANG;
    }

    getCurrent(): string {
        return this.lang$.value;
    }

    setLang(lang: string) {
        this.lang$.next(lang);
        localStorage.setItem(LANG_KEY, lang);
    }

    resetToDefault() {
        this.lang$.next(DEFAULT_LANG);
        localStorage.setItem(LANG_KEY, DEFAULT_LANG);
    }

    clear() {

        localStorage.removeItem(LANG_KEY);
        this.lang$.next(DEFAULT_LANG);
    }
}