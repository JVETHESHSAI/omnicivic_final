import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-super-admin-setup',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './setup.component.html',
  styleUrls: ['./setup.component.scss']
})
export class SetupComponent implements OnInit {
  form: FormGroup;
  checking = true;
  exists = false;
  loading = false;
  error: string | null = null;
  errorDetail: string | null = null;   // raw server message for debugging
  success: { username: string; tempPassword?: string } | null = null;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router
  ) {
    this.form = this.fb.group({
      firstName:  ['', Validators.required],
      lastName:   ['', Validators.required],
      email:      ['', [Validators.required, Validators.email]],
      phone:      [''],
      password:   ['', [Validators.required, Validators.minLength(8)]]
    });
  }

  ngOnInit() {
    this.http.get<{ superAdminExists: boolean }>('/api/bootstrap/status').subscribe({
      next: res => {
        this.exists = res.superAdminExists;
        this.checking = false;
      },
      error: (err: HttpErrorResponse) => {
        this.checking = false;
        if (err.status === 0) {
          this.error = 'Cannot reach the backend. Is it running on port 9090?';
        } else {
          this.error = `Status check failed (HTTP ${err.status}).`;
        }
      }
    });
  }

  onSubmit() {
    if (this.form.invalid || this.loading) return;
    this.loading = true;
    this.error = null;
    this.errorDetail = null;

    const v = this.form.value;

    // Backend BootstrapRequest record fields: username, password, firstName, lastName, email
    // We use the email as the username so they sign in with their email address.
    const payload = {
      username:  (v.email || '').trim().toLowerCase(),
      password:  v.password,
      firstName: v.firstName.trim(),
      lastName:  v.lastName.trim(),
      email:     (v.email || '').trim().toLowerCase()
    };

    this.http.post<any>('/api/bootstrap/super-admin', payload).subscribe({
      next: (res) => {
        this.loading = false;
        this.success = {
          username: res.username || payload.username
        };
        setTimeout(() => this.router.navigate(['/login']), 4000);
      },
      error: (err: HttpErrorResponse) => {
        this.loading = false;

        // Build the most descriptive error message possible
        if (err.status === 0) {
          this.error = 'Cannot reach the backend. Make sure Spring Boot is running on port 9090.';
          return;
        }

        if (err.status === 400) {
          // Spring validation errors come as { errors: [...] } or { message: "..." }
          const body = err.error;
          if (body?.errors && Array.isArray(body.errors) && body.errors.length > 0) {
            this.error = 'Validation failed: ' + body.errors.map((e: any) => e.defaultMessage || e.message || e).join(', ');
          } else if (body?.message) {
            this.error = body.message;
          } else if (typeof body === 'string') {
            this.error = body;
          } else {
            this.error = 'Bad request — check all fields are filled correctly.';
          }
          // Show raw body for debugging
          this.errorDetail = JSON.stringify(body);
          return;
        }

        if (err.status === 409 || err.error?.message?.includes('already')) {
          this.error = 'A super admin already exists in the database. Run this SQL to start fresh:\n  DELETE FROM user_account WHERE role = \'SUPER_ADMIN\';\nThen refresh this page.';
          return;
        }

        this.error = err.error?.message
          || err.error?.error
          || (typeof err.error === 'string' ? err.error : null)
          || `Server error (HTTP ${err.status}).`;
        this.errorDetail = JSON.stringify(err.error);
      }
    });
  }
}
