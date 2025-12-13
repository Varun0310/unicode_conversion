import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CustomerService } from '../services/customer.service';

@Component({
  selector: 'app-customer-form',
  standalone: false,
  templateUrl: './customer-form.component.html',
  styleUrls: ['./customer-form.component.scss'],
})
export class CustomerFormComponent implements OnInit {
  userId: string | null = null;
  name = '';
  phone = '';
  selectedFile: File | null = null;
  previewSrc: string | ArrayBuffer | null = null;
  loading = false;

  constructor(
    private customerService: CustomerService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.userId = sessionStorage.getItem('userId');
    console.log('Customer userId:', this.userId);
  }

  onFileChange(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Only image files allowed!');
      return;
    }

    this.selectedFile = file;

    const reader = new FileReader();
    reader.onload = () => (this.previewSrc = reader.result);
    reader.readAsDataURL(file);
  }

  submit() {
    if (!this.name || !this.phone || !this.selectedFile) {
      alert('Please fill all fields and select image');
      return;
    }

    this.loading = true;

    this.customerService
      .uploadCustomer(this.userId!, this.name, this.phone, this.selectedFile)
      .subscribe({
        next: (res) => {
          this.loading = false;

          alert('Customer details saved successfully');

          this.router.navigate(['/finance', this.userId]);
        },
        error: (err) => {
          this.loading = false;
          alert('Upload failed: ' + err.error?.message || err.message);
        },
      });
  }

  resetForm() {
    this.name = '';
    this.phone = '';
    this.previewSrc = null;
    this.selectedFile = null;

    const fileInput = document.getElementById(
      'customerImage'
    ) as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  }
}
