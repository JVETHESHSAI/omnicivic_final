import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent implements OnInit {
  form: FormGroup;
  loading = false;
  error: string | null = null;
  isForcedReset = false;
  currentUser: any = null;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router
  ) {
    this.form = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.currentUser = this.auth.getCurrentUser();
    if (!this.currentUser) {
      this.router.navigate(['/login']);
      return;
    }
    this.isForcedReset = !!this.currentUser.isFirstLogin;
  }

  get themeColor(): string {
    return this.currentUser?.branding?.themeColor || '#7B9576';
  }

  get pwMatch(): boolean {
    const n = this.form.get('newPassword')!.value;
    const c = this.form.get('confirmPassword')!.value;
    return !c || n === c;
  }

  get pwStrength(): { score: number; label: string; color: string } {
    const v = this.form.get('newPassword')!.value || '';
    let score = 0;
    if (v.length >= 8) score++;
    if (v.length >= 12) score++;
    if (/[A-Z]/.test(v)) score++;
    if (/[0-9]/.test(v)) score++;
    if (/[^A-Za-z0-9]/.test(v)) score++;

    const labels = ['Too short', 'Weak', 'Fair', 'Good', 'Strong', 'Excellent'];
    const colors = ['#B5564A', '#B5564A', '#D4A24C', '#D4A24C', '#7B9576', '#5F7A5A'];
    return { score, label: labels[score], color: colors[score] };
  }

  onSubmit() {
    if (this.form.invalid || this.loading) return;
    if (!this.pwMatch) {
      this.error = 'Passwords do not match.';
      return;
    }

    this.loading = true;
    this.error = null;

    const { currentPassword, newPassword } = this.form.value;
    this.auth.resetPassword({ currentPassword, newPassword }).subscribe({
      next: () => {
        this.loading = false;
        const user = this.auth.getCurrentUser();
        if (user?.role === 'SUPER_ADMIN') {
          this.router.navigate(['/super-admin']);
        } else {
          this.router.navigate(['/dashboard']);
        }
      },
      error: err => {
        this.loading = false;
        this.error = err?.error?.message || 'Could not change password. Please try again.';
      }
    });
  }

  cancel() {
    if (this.isForcedReset) return; // can't cancel a forced reset
    this.auth.logout();
  }
}
