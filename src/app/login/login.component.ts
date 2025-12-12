import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastController } from '@ionic/angular';
import { AuthService } from '../services/auth.service';
import { LanguageService } from '../services/language.service';

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private toastCtrl: ToastController,
    private auth: AuthService,
    private languageService: LanguageService     // <-- added
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
    });
  }

  ngOnInit() { }

  get f() { return this.loginForm.controls; }

  async login() {
    console.log('LOGIN pressed', this.loginForm.value, 'valid?', this.loginForm.valid);

    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      const t = await this.toastCtrl.create({ message: 'Enter email and password', duration: 1500, color: 'danger' });
      await t.present();
      return;
    }

    this.loading = true;
    const { email, password } = this.loginForm.value;
    this.auth.login({ email, password }).subscribe({
      next: async (res: any) => {
        console.log('res', res)
        this.loading = false;

        if (res?.token) {
          sessionStorage.setItem('token', res.token);
          sessionStorage.setItem('name', res.name);
        }

        const toast = await this.toastCtrl.create({
          message: res?.message || 'Login successful',
          duration: 1200,
          color: 'success'
        });
        await toast.present();
        setTimeout(() => this.router.navigate(['/home']), 800);
      },
      error: async (err) => {
        this.loading = false;
        const msg = err?.error?.message || 'Login failed';
        const toast = await this.toastCtrl.create({ message: msg, duration: 2000, color: 'danger' });
        await toast.present();
      }
    });
  }

  goToSignup() {
    this.router.navigate(['/signup']);
  }
}
