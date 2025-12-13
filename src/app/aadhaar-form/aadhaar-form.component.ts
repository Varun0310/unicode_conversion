import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AadhaarService } from '../services/aadhaar.service';

@Component({
  selector: 'app-aadhaar-form',
  standalone: false,
  templateUrl: './aadhaar-form.component.html',
  styleUrls: ['./aadhaar-form.component.scss'],
})
export class AadhaarFormComponent implements OnInit {
  userId: string | null = null;
  aadhaarNumber = '';

  frontFile: File | null = null;
  backFile: File | null = null;

  frontPreview: string | ArrayBuffer | null = null;
  backPreview: string | ArrayBuffer | null = null;

  uploading = false;

  maxFileSize = 6 * 1024 * 1024;
  allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private aadhaarSvc: AadhaarService
  ) {}

  ngOnInit() {
    this.userId =
      this.route.snapshot.paramMap.get('userId') ||
      sessionStorage.getItem('userId');

    if (!this.userId) {
      alert('Session expired. Please login again.');
      this.router.navigate(['/login']);
    }
  }

  // ✅ FRONT IMAGE HANDLER
  onFrontChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || !input.files.length) return;

    const file = input.files[0];

    if (!this.allowedTypes.includes(file.type)) {
      alert('Only JPG/PNG/WEBP allowed');
      input.value = '';
      return;
    }

    if (file.size > this.maxFileSize) {
      alert('Front image too large (max 6MB)');
      input.value = '';
      return;
    }

    this.frontFile = file;

    const reader = new FileReader();
    reader.onload = () => (this.frontPreview = reader.result);
    reader.readAsDataURL(file);
  }

  // ✅ BACK IMAGE HANDLER
  onBackChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || !input.files.length) return;

    const file = input.files[0];

    if (!this.allowedTypes.includes(file.type)) {
      alert('Only JPG/PNG/WEBP allowed');
      input.value = '';
      return;
    }

    if (file.size > this.maxFileSize) {
      alert('Back image too large (max 6MB)');
      input.value = '';
      return;
    }

    this.backFile = file;

    const reader = new FileReader();
    reader.onload = () => (this.backPreview = reader.result);
    reader.readAsDataURL(file);
  }

  // ✅ RESET FORM
  reset() {
    this.aadhaarNumber = '';
    this.frontFile = null;
    this.backFile = null;
    this.frontPreview = null;
    this.backPreview = null;

    const f1 = document.getElementById('frontInput') as HTMLInputElement | null;
    const f2 = document.getElementById('backInput') as HTMLInputElement | null;
    if (f1) f1.value = '';
    if (f2) f2.value = '';
  }

  // ✅ SUBMIT
  submit() {
    if (!this.userId) {
      alert('Missing userId');
      return;
    }

    const cleaned = this.aadhaarNumber.replace(/\s+/g, '');
    if (!/^\d{12}$/.test(cleaned)) {
      alert('Aadhaar must be exactly 12 digits');
      return;
    }

    if (!this.frontFile || !this.backFile) {
      alert('Please upload both front and back images');
      return;
    }

    const fd = new FormData();
    fd.append('userId', this.userId);
    fd.append('aadhaarNumber', cleaned);
    fd.append('front', this.frontFile);
    fd.append('back', this.backFile);

    this.uploading = true;
    this.aadhaarSvc.uploadAadhaar(fd).subscribe({
      next: () => {
        this.uploading = false;
        alert('Aadhaar uploaded successfully');
        this.router.navigate(['/home']);
      },
      error: (err) => {
        this.uploading = false;
        alert(err.error?.message || 'Upload failed');
      },
    });
  }
}
