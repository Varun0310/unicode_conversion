import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastController } from '@ionic/angular';
import { AuthService } from '../services/auth.service'; // adjust path

@Component({
  selector: 'app-signup',
  standalone: false,
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss'],
})
export class SignupComponent implements OnInit {
  signupForm: FormGroup;
  loading = false;
  languageService: any;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private toastCtrl: ToastController,
    private auth: AuthService
  ) {
    this.signupForm = this.fb.group({
      fullName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
    });
  }


  ngOnInit() { }

  get f() {
    return this.signupForm.controls;
  }

  get passwordsMismatch(): boolean {
    const pw = this.signupForm.get('password')?.value;
    const cpw = this.signupForm.get('confirmPassword')?.value;
    return pw && cpw && pw !== cpw;
  }

  async onSubmit() {
    if (this.signupForm.invalid || this.passwordsMismatch) {
      this.signupForm.markAllAsTouched();
      const t = await this.toastCtrl.create({
        message: 'Please fix validation errors',
        duration: 1700,
        color: 'danger'
      });
      await t.present();
      return;
    }

    const { fullName, email, phone, password } = this.signupForm.value;
    const payload = { fullName, email, phone, password };

    this.loading = true;
    this.auth.register(payload).subscribe({
      next: async (res: any) => {
        this.loading = false;

        const toast = await this.toastCtrl.create({
          message: res?.message || 'Account created — redirecting to login.',
          duration: 1800,
          color: 'success'
        });
        await toast.present();
        this.signupForm.reset();
        setTimeout(() => this.router.navigate(['/login']), 900);
      },
      error: async (err) => {
        this.loading = false;
        const msg = err?.error?.message || 'Registration failed';
        const toast = await this.toastCtrl.create({
          message: msg,
          duration: 2200,
          color: 'danger'
        });
        await toast.present();
      }
    });
  }


  goToLogin() {
    this.router.navigate(['/login']);
  }
}
