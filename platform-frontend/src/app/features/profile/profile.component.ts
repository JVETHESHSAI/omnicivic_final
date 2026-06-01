import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { ApiService } from '../../core/services/api.service';
import { User } from '../../shared/models/models';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  user: User | null = null;
  authUser: any = null;
  form: FormGroup;
  saving = false;
  saved = false;
  error: string | null = null;
  avatarPreview: string | null = null;

  constructor(
    private auth: AuthService,
    private api: ApiService,
    private fb: FormBuilder
  ) {
    this.form = this.fb.group({
      firstName: [''],
      lastName: [''],
      phone: [''],
      bio: ['']
    });
  }

  ngOnInit() {
    this.authUser = this.auth.getCurrentUser();
    this.api.getCurrentUser().subscribe({
      next: u => {
        this.user = u;
        this.avatarPreview = u.avatarBase64 ? 'data:image/jpeg;base64,' + u.avatarBase64 : null;
        this.form.patchValue({
          firstName: u.firstName || '',
          lastName: u.lastName || '',
          phone: u.phone || '',
          bio: u.bio || ''
        });
      }
    });
  }

  get initials(): string {
    const f = this.user?.firstName?.charAt(0) ?? '';
    const l = this.user?.lastName?.charAt(0) ?? '';
    return (f + l).toUpperCase() || this.user?.username?.charAt(0)?.toUpperCase() || '?';
  }

  get roleLabel(): string {
    const r = this.user?.role;
    if (!r) return '';
    if (r === 'CO_ADMIN') return 'Co-Admin';
    return r.charAt(0) + r.slice(1).toLowerCase();
  }

  get themeColor(): string {
    return this.authUser?.branding?.themeColor || '#7B9576';
  }

  onAvatarFile(e: any) {
    const file: File = e.target?.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      this.error = 'Image must be under 2 MB.';
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      this.avatarPreview = result;
    };
    reader.readAsDataURL(file);
  }

  save() {
    if (this.saving) return;
    this.saving = true;
    this.error = null;
    this.saved = false;

    const avatarBase64 = this.avatarPreview && this.avatarPreview.includes('base64,')
      ? this.avatarPreview.split('base64,')[1]
      : (this.user?.avatarBase64 ?? null);

    const payload = { ...this.form.value, avatarBase64 };

    this.api.updateProfile(payload).subscribe({
      next: updated => {
        this.saving = false;
        this.saved = true;
        this.user = updated;
        // Update session so sidebar avatar/name reflects immediately without re-login
        this.auth.updateCurrentUser({
          firstName: updated.firstName,
          lastName: updated.lastName,
          avatarBase64: updated.avatarBase64 ?? null
        });
        setTimeout(() => this.saved = false, 3000);
      },
      error: err => {
        this.saving = false;
        this.error = err?.error?.message || 'Could not save profile.';
      }
    });
  }

  removeAvatar() {
    this.avatarPreview = null;
    this.api.updateProfile({ avatarBase64: null }).subscribe({
      next: u => {
        this.user = u;
        this.auth.updateCurrentUser({ avatarBase64: null });
      }
    });
  }
}
