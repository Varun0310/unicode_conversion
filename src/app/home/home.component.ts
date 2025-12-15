import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '../services/translate.service';
import { HttpClient } from '@angular/common/http';
import { LanguageService } from '../services/language.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-home',
  standalone: false,
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit, OnDestroy {
  currentLang = 'en';
  baseLabels: Record<string, string> = {};
  labels: Record<string, string> = {};
  loading = false;
  menuOpen = false;

  userNameOriginal = '';   // the raw name stored in localStorage (e.g. "Varun")
  userNameDisplay = '';    // name displayed on UI (may be transliterated)
  greeting = 'Welcome';    // translated greeting (only greeting is translated)
  brandName = 'Fino Pay';


  private langSub: Subscription | null = null;
  private nameCacheKey = 'name_translations';
  private inFlightNameRequests = new Map<string, Promise<string>>();

  constructor(
    private router: Router,
    private http: HttpClient,
    private translateService: TranslateService,
    private languageService: LanguageService
  ) { }

  private updateBrandName(lang: string) {
    const BRAND_NAMES: Record<string, string> = {
      en: 'Fino Pay',
      ta: 'ஃபினோ பே',
      hi: 'फिनो पे',
      te: 'ఫినో పే',
      ml: 'ഫിനോ പേ',
      kn: 'ಫಿನೋ ಪೇ'
    };

    this.brandName = BRAND_NAMES[lang] || BRAND_NAMES['en'];
  }


  ngOnInit() {

    const initialLang = this.languageService.getCurrent() || 'en';
    this.updateBrandName(initialLang);

    this.loadBaseLabels();

    this.loadUser();

    this.langSub = this.languageService.currentLang$.subscribe((lang) => {
      lang = lang || 'en';
      this.currentLang = lang;
      this.applyLanguage(lang);
    });

    const initial = this.languageService.getCurrent() || 'en';
    this.currentLang = initial;
    this.applyLanguage(initial);
  }

  ngOnDestroy() {
    this.langSub?.unsubscribe();
  }
  openMenu() {
    this.menuOpen = true;
  }

  loadBaseLabels() {
    this.http.get<any>('assets/i18n/en.json').subscribe({
      next: (data) => {
        this.baseLabels = data?.baseLabels || {};
        this.labels = { ...this.baseLabels };
        this.greeting = this.baseLabels['welcome'] || 'Welcome';
      },
      error: (err) => {
        console.error('Home: failed to load base labels', err);
      },
    });
  }

  changeLanguage(lang: string) {
    this.languageService.setLang(lang);
  }

  private applyLanguage(lang: string) {

    if (!this.baseLabels || Object.keys(this.baseLabels).length === 0) {
    } else if (!lang || lang === 'en') {
      this.labels = { ...this.baseLabels };
      this.greeting = this.baseLabels['welcome'] || 'Welcome';
    } else {
      const keys = Object.keys(this.baseLabels);
      const newLabels: Record<string, string> = {};
      let completed = 0;
      this.loading = true;

      keys.forEach((k) => {
        const text = this.baseLabels[k];
        this.translateService.translate(text, lang).subscribe({
          next: (res: any) => {
            newLabels[k] = res?.translatedText ?? text;
            completed++;
            if (completed === keys.length) {
              this.labels = newLabels;
              this.greeting = newLabels['welcome'] || this.baseLabels['welcome'] || 'Welcome';
              this.loading = false;
            }
          },
          error: (err) => {
            console.error('Home: translation error for', k, err);
            this.labels = { ...this.baseLabels };
            this.greeting = this.baseLabels['welcome'] || 'Welcome';
            this.loading = false;
          }
        });
      });
    }
    this.updateBrandName(lang);
    this.updateDisplayedUserName(lang);
  }

  private loadUser() {
    const raw = sessionStorage.getItem('name');
    if (!raw) {
      this.userNameOriginal = '';
      this.userNameDisplay = '';
      return;
    }
    try {
      const u = raw;
      this.userNameOriginal = u;
      this.userNameDisplay = this.userNameOriginal;
      console.log('this.userNameDisplay', this.userNameDisplay)
    } catch (e) {
      console.warn('Home: invalid user in localStorage', e);
      this.userNameOriginal = '';
      this.userNameDisplay = '';
    }
  }

  private isProbablyEmailOrHandle(name: string): boolean {
    if (!name) return true;
    return /[@\d_<>\/\\]/.test(name);
  }

  private isAlreadyInTargetScript(name: string, lang: string): boolean {
    if (!name) return true;
    if (lang === 'ta') {
      return /[\u0B80-\u0BFF]/.test(name);
    }
    if (lang === 'en') {
      return /^[A-Za-z0-9 .,'-]+$/.test(name);
    }
    return false;
  }

  private readNameCache(): Record<string, string> {
    try {
      const raw = localStorage.getItem(this.nameCacheKey);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  }

  private writeNameCache(obj: Record<string, string>) {
    try {
      localStorage.setItem(this.nameCacheKey, JSON.stringify(obj));
    } catch { }
  }

  translateName(name: string, lang: string): Promise<string> {
    if (!name) return Promise.resolve('');

    if (this.isProbablyEmailOrHandle(name)) return Promise.resolve(name);
    if (this.isAlreadyInTargetScript(name, lang)) return Promise.resolve(name);

    const cacheKey = `${name}::${lang}`;
    const cache = this.readNameCache();
    if (cache[cacheKey]) return Promise.resolve(cache[cacheKey]);

    if (this.inFlightNameRequests.has(cacheKey)) {
      return this.inFlightNameRequests.get(cacheKey)!;
    }

    const p = new Promise<string>((resolve) => {
      this.translateService.translate(name, lang).subscribe({
        next: (res: any) => {
          const translated = res?.translatedText ?? name;
          const c = this.readNameCache();
          c[cacheKey] = translated;
          this.writeNameCache(c);
          this.inFlightNameRequests.delete(cacheKey);
          resolve(translated);
        },
        error: (err) => {
          console.error('Name transliteration error', err);
          this.inFlightNameRequests.delete(cacheKey);
          resolve(name);
        }
      });
    });

    this.inFlightNameRequests.set(cacheKey, p);
    return p;
  }

  private updateDisplayedUserName(lang: string) {
    const original = this.userNameOriginal || '';
    if (!original) {
      this.userNameDisplay = '';
      return;
    }

    this.userNameDisplay = original;

    if (lang === 'en' && this.isAlreadyInTargetScript(original, 'en')) {
      this.userNameDisplay = original;
      return;
    }

    this.translateName(original, lang).then((translated) => {
      if ((this.currentLang || 'en') === lang) {
        this.userNameDisplay = translated || original;
      }
    }).catch(() => {
      this.userNameDisplay = original;
    });
  }

  gotocontact() {
    this.router.navigate(['/contact']);
  }

  gotosupport() {
    this.router.navigate(['/support']);
  }

  logout() {
    sessionStorage.clear();


    this.languageService.resetToDefault();

    this.currentLang = 'en';
    this.labels = { ...this.baseLabels };
    this.greeting = this.baseLabels['welcome'] || 'Welcome';
    this.userNameOriginal = '';
    this.userNameDisplay = '';

    this.router.navigate(['/login']);
  }
}
