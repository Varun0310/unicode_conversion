// src/app/contact/contact.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastController } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { TranslateService } from '../services/translate.service';
import { LanguageService } from '../services/language.service';
import { forkJoin, of, Subscription } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Component({
  selector: 'app-contact',
  standalone: false,
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss'],
})
export class ContactComponent implements OnInit, OnDestroy {
  contactForm: FormGroup;
  baseLabels: any = {};
  labels: any = {};
  langSub: Subscription | null = null;

  private debugServiceId: string;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private toastCtrl: ToastController,
    private http: HttpClient,
    private translateService: TranslateService,
    private languageService: LanguageService
  ) {
    this.contactForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      subject: [''],
      message: ['', [Validators.required, Validators.minLength(10)]],
    });

    (this.languageService as any)._id =
      (this.languageService as any)._id || Math.random().toString(36).slice(2);
    this.debugServiceId = (this.languageService as any)._id;
    console.log('Contact ctor - LanguageService id =', this.debugServiceId);
  }

  ngOnInit() {
    this.http.get<any>('assets/i18n/contact.json').subscribe({
      next: (data) => {
        console.log('Contact: loaded contact.en.json ->', data);
        this.baseLabels = data?.baseLabels || {};
        this.labels = { ...this.baseLabels };

        const current = this.languageService.getLang();
        console.log('Contact: current language from service ->', current);

        const stored = localStorage.getItem('app_lang');
        if (stored && stored !== current) {
          console.log('Contact: localStorage app_lang =', stored, '(will translate if different)');
        }

        const effectiveLang = current && current !== 'en' ? current : (stored && stored !== 'en' ? stored : 'en');
        if (effectiveLang && effectiveLang !== 'en') {
          this.translateLabels(effectiveLang);
        }
      },
      error: (err) => {
        console.error('Contact: Failed to load contact.en.json', err);
      },
    });

    this.langSub = this.languageService.currentLang$.subscribe((lang) => {
      console.log('Contact subscription: language changed ->', lang, 'serviceId=', this.debugServiceId);
      if (!lang || lang === 'en') {
        this.labels = { ...this.baseLabels };
      } else {
        this.translateLabels(lang);
      }
    });
  }

  ngOnDestroy() {
    this.langSub?.unsubscribe();
  }

  private translateLabels(lang: string) {
    console.log('Contact: translateLabels called for', lang);
    const keys = Object.keys(this.baseLabels || {});
    if (!keys.length) {
      this.labels = { ...this.baseLabels };
      return;
    }

    const requests = keys.map((k) =>
      this.translateService.translate(this.baseLabels[k], lang).pipe(
        catchError((err) => {
          console.error('Contact: translate error for', k, err);
          return of({ translatedText: this.baseLabels[k] });
        }),
        map((res) => ({ key: k, text: res.translatedText }))
      )
    );

    forkJoin(requests).subscribe({
      next: (results: any[]) => {
        console.log('Contact: translation results ->', results);
        const newLabels: any = {};
        results.forEach((r: any) => (newLabels[r.key] = r.text));
        this.labels = newLabels;
      },
      error: (err) => {
        console.error('Contact: Batch translate failed', err);
        this.labels = { ...this.baseLabels };
      },
    });
  }

  get f() {
    return this.contactForm.controls;
  }

  async onSubmit() {
    if (this.contactForm.invalid) {
      this.contactForm.markAllAsTouched();
      return;
    }

    const val = this.contactForm.value;
    console.log('Contact submit', val);

    const toast = await this.toastCtrl.create({
      message: (this.labels.send ? this.labels.send + ' — ' : '') + 'Message sent.',
      duration: 2500,
      color: 'primary',
      position: 'bottom',
    });
    await toast.present();

    this.contactForm.reset();
    setTimeout(() => this.router.navigate(['/home']), 900);
  }
}
