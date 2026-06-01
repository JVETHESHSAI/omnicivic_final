
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Subject, debounceTime, distinctUntilChanged, of, catchError, takeUntil } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { ApiService } from '../../../core/services/api.service';
import { CommunityBranding } from '../../../shared/models/models';

type LoginMode = 'default' | 'community' | 'super';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, OnDestroy {
  form: FormGroup;
  mode: LoginMode = 'default';
  branding: CommunityBranding | null = null;
  loading = false;
  error: string | null = null;
  firstTimeHint = false;

  /** Last prefix we looked up so we don't keep hitting the API */
  private lastLookupPrefix: string | null = null;
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private api: ApiService,
    private router: Router
  ) {
    this.form = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  ngOnInit() {
    // If already signed in, send them where they belong
    if (this.auth.isLoggedIn()) {
      this.routeAfterLogin();
      return;
    }

    // Live-detect community / super admin as user types
    this.form.get('username')!.valueChanges
      .pipe(
        debounceTime(200),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(v => this.onUsernameChange((v || '').trim()));
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ─── Mode detection ──────────────────────────────────────────────
  private onUsernameChange(v: string) {
    this.error = null;

    if (!v) {
      this.setDefault();
      this.firstTimeHint = false;
      return;
    }

    // Super admin: email containing @
    if (v.includes('@')) {
      this.setSuper();
      this.firstTimeHint = false;
      return;
    }

    if (v.length >= 4) {
      this.firstTimeHint = /\d{1,3}$/.test(v);

      /**
       * Username formats:
       *  Admin/Co-admin : {PREFIX}ADMIN  → prefix is FIRST 4 chars  e.g. MARIADMIN
       *  Resident/Staff : {firstName}{PREFIX} → prefix is LAST 4 chars  e.g. petchiMARI
       *
       * Strategy: try last-4 first (covers resident/staff whose names vary),
       * then fall back to first-4 (covers admin).
       * We lookup both and whichever returns a valid community wins.
       */
      const suffixPrefix = v.substring(v.length - 4).toUpperCase();
      const prefixPrefix = v.substring(0, 4).toUpperCase();

      // Try suffix first (resident/staff pattern)
      if (suffixPrefix !== this.lastLookupPrefix) {
        this.lookupCommunity(suffixPrefix, prefixPrefix);
      }
    } else {
      this.setDefault();
      this.firstTimeHint = false;
    }
  }

  private lookupCommunity(primaryPrefix: string, fallbackPrefix?: string) {
    this.lastLookupPrefix = primaryPrefix;
    this.api.getPublicBranding(primaryPrefix)
      .pipe(
        catchError(() => of(null)),
        takeUntil(this.destroy$)
      )
      .subscribe(branding => {
        if (branding) {
          this.setCommunity(branding);
        } else if (fallbackPrefix && fallbackPrefix !== primaryPrefix) {
          // Primary (suffix) lookup failed — try prefix lookup (admin pattern)
          this.api.getPublicBranding(fallbackPrefix)
            .pipe(catchError(() => of(null)), takeUntil(this.destroy$))
            .subscribe(b2 => {
              if (b2) {
                this.lastLookupPrefix = fallbackPrefix;
                this.setCommunity(b2);
              } else {
                this.setDefault();
              }
            });
        } else {
          this.setDefault();
        }
      });
  }

  private setDefault() {
    this.mode = 'default';
    this.branding = null;
  }

  private setCommunity(b: CommunityBranding) {
    this.mode = 'community';
    this.branding = b;
  }

  private setSuper() {
    this.mode = 'super';
    this.branding = null;
  }

  // ─── Display helpers (consumed by the template) ──────────────────
  get pageClass(): string {
    const classes = ['login-page', `mode-${this.mode}`];
    if (this.mode === 'community') classes.push('recognized');
    return classes.join(' ');
  }

  get themeColor(): string {
    return this.branding?.themeColor || '#7B9576';
  }

  get eyebrowText(): string {
    if (this.mode === 'community') return '— · Community portal';
    if (this.mode === 'super') return '$ auth.init --super';
    return '— · Sign in';
  }

  get headlineHtml(): string {
    if (this.mode === 'community' && this.branding) {
      return `Welcome back<br>to <em>${this.escape(this.branding.name)}</em>.`;
    }
    if (this.mode === 'super') {
      return `Access the <em>engine room</em>.`;
    }
    return `Civic management,<br><em>finally</em> clear.`;
  }

  get subText(): string {
    if (this.mode === 'community') {
      return "Your community has activity waiting. Sign in to see what's new.";
    }
    if (this.mode === 'super') {
      return 'Review service requests, manage communities, monitor platform health.';
    }
    return "A quiet, modern portal for residents, admins and staff to see what's happening, what's been done, and what's next.";
  }

  get brandMark(): string {
    if (this.mode === 'super') return '⌘';
    if (this.mode === 'community' && this.branding) return this.branding.name.charAt(0).toUpperCase();
    return '◐';
  }

  get brandName(): string {
    if (this.mode === 'super') return 'omnicivic';
    if (this.mode === 'community' && this.branding) return this.branding.name;
    return 'OmniCivic';
  }

  get brandMeta(): string {
    if (this.mode === 'super') return '// super-admin';
    if (this.mode === 'community' && this.branding) return `· ${this.branding.communityPrefix}`;
    return '';
  }

  get formEyebrow(): string {
    if (this.mode === 'community') return 'Community sign-in';
    if (this.mode === 'super') return '$ session.init';
    return 'Welcome back';
  }

  get roleTagText(): string {
    if (this.mode === 'community' && this.branding) return this.branding.name;
    if (this.mode === 'super') return 'super-admin';
    return 'Resident';
  }

  get formTitle(): string {
    if (this.mode === 'community') return 'Welcome back.';
    if (this.mode === 'super') return 'Authenticate operator';
    return 'Sign in to continue';
  }

  get formSubHtml(): string {
    if (this.mode === 'community' && this.branding) {
      return `Signing in to <strong>${this.escape(this.branding.name)}</strong>.`;
    }
    if (this.mode === 'super') {
      return `Signing in to <strong>super-admin console</strong>.`;
    }
    return 'Use the username and password from your welcome email.';
  }

  get helperHtml(): string {
    if (this.mode === 'community' && this.branding) {
      return `<span class="hdot"></span> Recognised: <strong>${this.escape(this.branding.name)}</strong>`;
    }
    if (this.mode === 'super') {
      return `<span class="hdot"></span> super-admin email recognised`;
    }
    return "Type your username or super admin email to begin.";
  }

  get submitText(): string {
    if (this.loading) return 'Signing in…';
    if (this.mode === 'community' && this.branding) return `Sign in to ${this.branding.name}`;
    if (this.mode === 'super') return 'Authenticate';
    return 'Sign in';
  }

  // ─── Submit ──────────────────────────────────────────────────────
  onSubmit() {
    if (this.form.invalid || this.loading) return;
    this.loading = true;
    this.error = null;

    this.auth.login(this.form.value).subscribe({
      next: () => {
        this.loading = false;
        this.routeAfterLogin();
      },
      error: (err) => {
        this.loading = false;
        this.error = err?.error?.message || 'Sign-in failed. Check your credentials.';
      }
    });
  }

  private routeAfterLogin() {
    const user = this.auth.getCurrentUser();
    if (!user) return;
    if (user.isFirstLogin) {
      this.router.navigate(['/reset-password']);
      return;
    }
    if (user.role === 'SUPER_ADMIN') {
      this.router.navigate(['/super-admin']);
      return;
    }
    this.router.navigate(['/dashboard']);
  }

  private escape(s: string): string {
    const div = document.createElement('div');
    div.textContent = s;
    return div.innerHTML;
  }

  /** Detect image type from base64 header bytes */
  logoSrc(b64: string | null | undefined): string {
    if (!b64) return '';
    // Check the first few chars of base64 to guess MIME type
    // JPEG starts with /9j/ (base64 of FFD8FF), PNG with iVBO, GIF with R0lG, WebP with AAAB
    if (b64.startsWith('/9j/')) return `data:image/jpeg;base64,${b64}`;
    if (b64.startsWith('iVBOR')) return `data:image/png;base64,${b64}`;
    if (b64.startsWith('R0lG')) return `data:image/gif;base64,${b64}`;
    // Fallback — try JPEG as it's most common
    return `data:image/jpeg;base64,${b64}`;
  }
}
