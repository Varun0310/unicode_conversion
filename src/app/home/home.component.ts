import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '../services/translate.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-home',
  standalone: false,
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  currentLang = 'en';
  baseLabels = {};
  labels: any = {};
  loading = false;
  menuOpen = false;

  constructor(
    private router: Router,
    private http: HttpClient,
    private translateService: TranslateService
  ) {}

  ngOnInit() {
    this.loadBaseLabels();
  }
  loadBaseLabels() {
    this.http
      .get<any>('assets/i18n/en.json')
      .subscribe((data) => {
        this.baseLabels = data['baseLabels'];
        this.labels = { ...this.baseLabels };
      });
  }
  openMenu() {
    this.menuOpen = true;
  }

  changeLanguage(lang: string) {
    this.currentLang = lang;

    if (lang === 'en') {
      this.labels = { ...this.baseLabels };
      return;
    }

    const keys = Object.keys(
      this.baseLabels
    ) as (keyof typeof this.baseLabels)[];
    const newLabels: any = {};
    let completed = 0;

    this.loading = true;

    keys.forEach((key) => {
      const text = this.baseLabels[key];

      this.translateService.translate(text, lang).subscribe({
        next: (res) => {
          newLabels[key] = res.translatedText;
          completed++;

          if (completed === keys.length) {
            this.labels = newLabels;
            this.loading = false;
            console.log('Translated labels:', this.labels);
          }
        },
        error: (err) => {
          console.error('Translation error for', key, err);
          this.labels = { ...this.baseLabels };
          this.loading = false;
        },
      });
    });
  }

  logout() {
    this.router.navigate(['/login']);
  }
}
