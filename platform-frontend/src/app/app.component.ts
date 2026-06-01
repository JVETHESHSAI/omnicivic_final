// // import { Component, OnInit, OnDestroy } from '@angular/core';
// // import { Router, NavigationEnd } from '@angular/router';
// // import { filter, Subscription } from 'rxjs';
// // import { AuthService } from './core/services/auth.service';
// // import { NotificationCountService } from './core/services/notification-count.service';

// // @Component({
// //   selector: 'app-root',
// //   templateUrl: './app.component.html',
// //   styleUrls: ['./app.component.scss']
// // })
// // export class AppComponent implements OnInit, OnDestroy {
// //   isLoggedIn = false;
// //   isFirstLogin = false;
// //   isAdmin = false;
// //   isCoAdmin = false;
// //   isResident = false;
// //   isStaff = false;
// //   isSuperAdmin = false;
// //   currentUser: any = null;
// //   branding: any = null;
// //   themeColor = '#7B9576';
// //   unreadCount = 0;

// //   chromeless = false;
// //   sidebarCollapsed = false;

// //   private pollHandle: any;
// //   private subs: Subscription[] = [];

// //   constructor(
// //     private authService: AuthService,
// //     private router: Router,
// //     private notifCount: NotificationCountService
// //   ) {}

// //   get showShell(): boolean {
// //     return this.isLoggedIn && !this.chromeless && !this.isFirstLogin;
// //   }

// //   get isQuietOperatorShell(): boolean {
// //     return this.showShell && this.isSuperAdmin;
// //   }

// //   get isCommunityShell(): boolean {
// //     return this.showShell && !this.isSuperAdmin;
// //   }

// //   // ── Brand mark: show logo image if available, else initial letter ──
// //   get hasBrandLogo(): boolean {
// //     return !!(this.branding?.logoBase64);
// //   }

// //   get brandLogoSrc(): string {
// //     const b64 = this.branding?.logoBase64;
// //     if (!b64) return '';
// //     if (b64.startsWith('/9j/')) return `data:image/jpeg;base64,${b64}`;
// //     if (b64.startsWith('iVBOR')) return `data:image/png;base64,${b64}`;
// //     return `data:image/jpeg;base64,${b64}`;
// //   }

// //   get brandInitial(): string {
// //     if (this.isSuperAdmin) return '⌘';
// //     return this.branding?.name?.charAt(0)?.toUpperCase() ?? '◐';
// //   }

// //   get brandName(): string {
// //     if (this.isSuperAdmin) return 'omnicivic';
// //     return this.branding?.name || 'OmniCivic';
// //   }

// //   get brandMeta(): string {
// //     if (this.isSuperAdmin) return '// super-admin';
// //     return this.branding?.communityPrefix ? `· ${this.branding.communityPrefix}` : '';
// //   }

// //   // ── User display name: firstName if available, else username ──
// //   get displayName(): string {
// //     if (this.currentUser?.firstName) return this.currentUser.firstName;
// //     return this.currentUser?.username ?? '';
// //   }

// //   get displayInitial(): string {
// //     return this.displayName.charAt(0).toUpperCase();
// //   }

// //   // ── User avatar: photo if set, else colored initial ──
// //   get hasUserAvatar(): boolean {
// //     return !!(this.currentUser?.avatarBase64);
// //   }

// //   get userAvatarSrc(): string {
// //     const b64 = this.currentUser?.avatarBase64;
// //     if (!b64) return '';
// //     if (b64.startsWith('/9j/')) return `data:image/jpeg;base64,${b64}`;
// //     if (b64.startsWith('iVBOR')) return `data:image/png;base64,${b64}`;
// //     return `data:image/jpeg;base64,${b64}`;
// //   }

// //   get currentRoleLabel(): string {
// //     if (this.isSuperAdmin) return 'Super admin';
// //     if (this.isAdmin) return 'Admin';
// //     if (this.isCoAdmin) return 'Co-admin';
// //     if (this.isStaff) return 'Staff';
// //     if (this.isResident) return 'Resident';
// //     return '';
// //   }

// //   get timeGreeting(): string {
// //     const h = new Date().getHours();
// //     if (h >= 5 && h < 11) return 'Good morning';
// //     if (h >= 11 && h < 17) return 'Good afternoon';
// //     if (h >= 17 && h < 21) return 'Good evening';
// //     return 'Working late';
// //   }

// //   ngOnInit() {
// //     this.sidebarCollapsed = localStorage.getItem('omnicivic_sidebar_collapsed') === '1';

// //     this.subs.push(
// //       this.authService.currentUser$.subscribe(user => {
// //         this.isLoggedIn = !!user;
// //         this.isFirstLogin = user?.isFirstLogin ?? false;
// //         this.currentUser = user;
// //         // branding works for ALL roles — admin, co-admin, resident, staff
// //         this.branding = user?.branding ?? null;
// //         this.themeColor = this.branding?.themeColor || '#7B9576';

// //         this.isSuperAdmin = this.authService.hasRole('SUPER_ADMIN');
// //         this.isAdmin     = this.authService.hasRole('ADMIN');
// //         this.isCoAdmin   = this.authService.hasRole('CO_ADMIN');
// //         this.isResident  = this.authService.hasRole('RESIDENT');
// //         this.isStaff     = this.authService.hasRole('STAFF');

// //         // Apply theme color as CSS variable for all community roles
// //         if (this.branding?.themeColor) {
// //           document.documentElement.style.setProperty('--primary', this.branding.themeColor);
// //         }

// //         if (this.showShell && !this.isSuperAdmin) {
// //           this.startPolling();
// //         } else {
// //           this.stopPolling();
// //         }
// //       })
// //     );

// //     this.subs.push(
// //       this.router.events.pipe(filter(e => e instanceof NavigationEnd)).subscribe((e: any) => {
// //         const url = e.urlAfterRedirects || e.url;
// //         this.chromeless = ['/login', '/setup', '/reset-password'].some(p => url.startsWith(p)) || url === '/';
// //         if (this.showShell && !this.isSuperAdmin) this.notifCount.refresh();
// //       })
// //     );

// //     this.subs.push(
// //       this.notifCount.unreadCount$.subscribe(count => this.unreadCount = count)
// //     );
// //   }

// //   ngOnDestroy() {
// //     this.stopPolling();
// //     this.subs.forEach(s => s.unsubscribe());
// //   }

// //   private startPolling() {
// //     this.notifCount.refresh();
// //     if (this.pollHandle) return;
// //     this.pollHandle = setInterval(() => this.notifCount.refresh(), 15000);
// //   }

// //   private stopPolling() {
// //     if (this.pollHandle) { clearInterval(this.pollHandle); this.pollHandle = null; }
// //   }

// //   toggleSidebar() {
// //     this.sidebarCollapsed = !this.sidebarCollapsed;
// //     localStorage.setItem('omnicivic_sidebar_collapsed', this.sidebarCollapsed ? '1' : '0');
// //   }

// //   logout() {
// //     this.authService.logout();
// //   }
// // }



// import { HttpClient } from '@angular/common/http';
// import { Component, OnInit, OnDestroy } from '@angular/core';
// import { Router, NavigationEnd } from '@angular/router';
// import { filter, Subscription } from 'rxjs';
// import { AuthService } from './core/services/auth.service';
// import { NotificationCountService } from './core/services/notification-count.service';

// @Component({
//   selector: 'app-root',
//   templateUrl: './app.component.html',
//   styleUrls: ['./app.component.scss']
// })
// export class AppComponent implements OnInit, OnDestroy {
//   isLoggedIn = false;
//   isFirstLogin = false;
//   isAdmin = false;
//   isCoAdmin = false;
//   isResident = false;
//   isStaff = false;
//   isSuperAdmin = false;
//   currentUser: any = null;
//   branding: any = null;
//   themeColor = '#7B9576';
//   unreadCount = 0;

//   chromeless = false;
//   sidebarCollapsed = false;

//   private pollHandle: any;
//   private subs: Subscription[] = [];

//   constructor(
//     private authService: AuthService,
//     private router: Router,
//     private notifCount: NotificationCountService,
//     private http: HttpClient
//   ) {}

//   get showShell(): boolean {
//     return this.isLoggedIn && !this.chromeless && !this.isFirstLogin;
//   }

//   get isQuietOperatorShell(): boolean {
//     return this.showShell && this.isSuperAdmin;
//   }

//   get isCommunityShell(): boolean {
//     return this.showShell && !this.isSuperAdmin;
//   }

//   // ── Brand mark: show logo image if available, else initial letter ──
//   get hasBrandLogo(): boolean {
//     return !!(this.branding?.logoBase64);
//   }

//   get brandLogoSrc(): string {
//     const b64 = this.branding?.logoBase64;
//     if (!b64) return '';
//     if (b64.startsWith('/9j/')) return `data:image/jpeg;base64,${b64}`;
//     if (b64.startsWith('iVBOR')) return `data:image/png;base64,${b64}`;
//     return `data:image/jpeg;base64,${b64}`;
//   }

//   get brandInitial(): string {
//     if (this.isSuperAdmin) return '⌘';
//     return this.branding?.name?.charAt(0)?.toUpperCase() ?? '◐';
//   }

//   get brandName(): string {
//     if (this.isSuperAdmin) return 'omnicivic';
//     return this.branding?.name || 'OmniCivic';
//   }

//   get brandMeta(): string {
//     if (this.isSuperAdmin) return '// super-admin';
//     return this.branding?.communityPrefix ? `· ${this.branding.communityPrefix}` : '';
//   }

//   // ── User display name: firstName if available, else username ──
//   get displayName(): string {
//     if (this.currentUser?.firstName) return this.currentUser.firstName;
//     return this.currentUser?.username ?? '';
//   }

//   get displayInitial(): string {
//     return this.displayName.charAt(0).toUpperCase();
//   }

//   // ── User avatar: photo if set, else colored initial ──
//   get hasUserAvatar(): boolean {
//     return !!(this.currentUser?.avatarBase64);
//   }

//   get userAvatarSrc(): string {
//     const b64 = this.currentUser?.avatarBase64;
//     if (!b64) return '';
//     if (b64.startsWith('/9j/')) return `data:image/jpeg;base64,${b64}`;
//     if (b64.startsWith('iVBOR')) return `data:image/png;base64,${b64}`;
//     return `data:image/jpeg;base64,${b64}`;
//   }

//   get currentRoleLabel(): string {
//     if (this.isSuperAdmin) return 'Super admin';
//     if (this.isAdmin) return 'Admin';
//     if (this.isCoAdmin) return 'Co-admin';
//     if (this.isStaff) return 'Staff';
//     if (this.isResident) return 'Resident';
//     return '';
//   }

//   get timeGreeting(): string {
//     const h = new Date().getHours();
//     if (h >= 5 && h < 11) return 'Good morning';
//     if (h >= 11 && h < 17) return 'Good afternoon';
//     if (h >= 17 && h < 21) return 'Good evening';
//     return 'Working late';
//   }

//   ngOnInit() {
//     this.sidebarCollapsed = localStorage.getItem('omnicivic_sidebar_collapsed') === '1';

//     this.subs.push(
//       this.authService.currentUser$.subscribe(user => {
//         this.isLoggedIn = !!user;
//         this.isFirstLogin = user?.isFirstLogin ?? false;
//         this.currentUser = user;
//         // branding works for ALL roles — admin, co-admin, resident, staff
//         this.branding = user?.branding ?? null;
//         this.themeColor = this.branding?.themeColor || '#7B9576';

//         this.isSuperAdmin = this.authService.hasRole('SUPER_ADMIN');
//         this.isAdmin     = this.authService.hasRole('ADMIN');
//         this.isCoAdmin   = this.authService.hasRole('CO_ADMIN');
//         this.isResident  = this.authService.hasRole('RESIDENT');
//         this.isStaff     = this.authService.hasRole('STAFF');

//         // Apply theme color as CSS variable for all community roles
//         if (this.branding?.themeColor) {
//           document.documentElement.style.setProperty('--primary', this.branding.themeColor);
//         }

//         if (this.showShell && !this.isSuperAdmin) {
//           this.startPolling();
//         } else {
//           this.stopPolling();
//         }
//       })
//     );

//     this.subs.push(
//       this.router.events.pipe(filter(e => e instanceof NavigationEnd)).subscribe((e: any) => {
//         const url = e.urlAfterRedirects || e.url;
//         this.chromeless = ['/login', '/setup', '/reset-password'].some(p => url.startsWith(p)) || url === '/';
//         if (this.showShell && !this.isSuperAdmin) {
//           this.notifCount.refresh();
//         } else if (this.isSuperAdmin) {
//           this.refreshSuperAdminNotifCount();
//         }
//       })
//     );

//     this.subs.push(
//       this.notifCount.unreadCount$.subscribe(count => this.unreadCount = count)
//     );
//   }

//   ngOnDestroy() {
//     this.stopPolling();
//     this.subs.forEach(s => s.unsubscribe());
//   }

//   private startPolling() {
//     this.notifCount.refresh();
//     if (this.pollHandle) return;
//     this.pollHandle = setInterval(() => this.notifCount.refresh(), 15000);
//   }

//   private stopPolling() {
//     if (this.pollHandle) { clearInterval(this.pollHandle); this.pollHandle = null; }
//   }

//   toggleSidebar() {
//     this.sidebarCollapsed = !this.sidebarCollapsed;
//     localStorage.setItem('omnicivic_sidebar_collapsed', this.sidebarCollapsed ? '1' : '0');
//   }

//   refreshSuperAdminNotifCount() {
//     this.http.get<any[]>('/api/service-requests?status=PENDING').subscribe({
//       next: list => { this.unreadCount = (list ?? []).length; },
//       error: () => {}
//     });
//   }

//   logout() {
//     this.authService.logout();
//   }
// }






import { HttpClient } from '@angular/common/http';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter, Subscription } from 'rxjs';
import { AuthService } from './core/services/auth.service';
import { NotificationCountService } from './core/services/notification-count.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  isLoggedIn = false;
  isFirstLogin = false;
  isAdmin = false;
  isCoAdmin = false;
  isResident = false;
  isStaff = false;
  isSuperAdmin = false;
  currentUser: any = null;
  branding: any = null;
  themeColor = '#7B9576';
  unreadCount = 0;

  chromeless = false;
  sidebarCollapsed = false;

  private pollHandle: any;
  private subs: Subscription[] = [];

  constructor(
    private authService: AuthService,
    private router: Router,
    private notifCount: NotificationCountService,
    private http: HttpClient
  ) {}

  get showShell(): boolean {
    return this.isLoggedIn && !this.chromeless && !this.isFirstLogin;
  }

  get isQuietOperatorShell(): boolean {
    return this.showShell && this.isSuperAdmin;
  }

  get isCommunityShell(): boolean {
    return this.showShell && !this.isSuperAdmin;
  }

  // ── Brand mark: show logo image if available, else initial letter ──
  get hasBrandLogo(): boolean {
    return !!(this.branding?.logoBase64);
  }

  get brandLogoSrc(): string {
    const b64 = this.branding?.logoBase64;
    if (!b64) return '';
    if (b64.startsWith('/9j/')) return `data:image/jpeg;base64,${b64}`;
    if (b64.startsWith('iVBOR')) return `data:image/png;base64,${b64}`;
    return `data:image/jpeg;base64,${b64}`;
  }

  get brandInitial(): string {
    if (this.isSuperAdmin) return '⌘';
    return this.branding?.name?.charAt(0)?.toUpperCase() ?? '◐';
  }

  get brandName(): string {
    if (this.isSuperAdmin) return 'omnicivic';
    return this.branding?.name || 'OmniCivic';
  }

  get brandMeta(): string {
    if (this.isSuperAdmin) return '// super-admin';
    return this.branding?.communityPrefix ? `· ${this.branding.communityPrefix}` : '';
  }

  // ── User display name: firstName if available, else username ──
  get displayName(): string {
    if (this.currentUser?.firstName) return this.currentUser.firstName;
    return this.currentUser?.username ?? '';
  }

  get displayInitial(): string {
    return this.displayName.charAt(0).toUpperCase();
  }

  // ── User avatar: photo if set, else colored initial ──
  get hasUserAvatar(): boolean {
    return !!(this.currentUser?.avatarBase64);
  }

  get userAvatarSrc(): string {
    const b64 = this.currentUser?.avatarBase64;
    if (!b64) return '';
    if (b64.startsWith('/9j/')) return `data:image/jpeg;base64,${b64}`;
    if (b64.startsWith('iVBOR')) return `data:image/png;base64,${b64}`;
    return `data:image/jpeg;base64,${b64}`;
  }

  get currentRoleLabel(): string {
    if (this.isSuperAdmin) return 'Super admin';
    if (this.isAdmin) return 'Admin';
    if (this.isCoAdmin) return 'Co-admin';
    if (this.isStaff) return 'Staff';
    if (this.isResident) return 'Resident';
    return '';
  }

  get timeGreeting(): string {
    const h = new Date().getHours();
    if (h >= 5 && h < 11) return 'Good morning';
    if (h >= 11 && h < 17) return 'Good afternoon';
    if (h >= 17 && h < 21) return 'Good evening';
    return 'Working late';
  }

  ngOnInit() {
    this.sidebarCollapsed = localStorage.getItem('omnicivic_sidebar_collapsed') === '1';

    this.subs.push(
      this.authService.currentUser$.subscribe(user => {
        this.isLoggedIn = !!user;
        this.isFirstLogin = user?.isFirstLogin ?? false;
        this.currentUser = user;
        // branding works for ALL roles — admin, co-admin, resident, staff
        this.branding = user?.branding ?? null;
        this.themeColor = this.branding?.themeColor || '#7B9576';

        this.isSuperAdmin = this.authService.hasRole('SUPER_ADMIN');
        this.isAdmin     = this.authService.hasRole('ADMIN');
        this.isCoAdmin   = this.authService.hasRole('CO_ADMIN');
        this.isResident  = this.authService.hasRole('RESIDENT');
        this.isStaff     = this.authService.hasRole('STAFF');

        // Apply theme color as CSS variable for all community roles
        if (this.branding?.themeColor) {
          document.documentElement.style.setProperty('--primary', this.branding.themeColor);
        }

        if (this.showShell && !this.isSuperAdmin) {
          this.startPolling();
        } else if (this.showShell && this.isSuperAdmin) {
          this.refreshSuperAdminNotifCount();
          this.startSuperAdminPolling();
        } else {
          this.stopPolling();
          this.stopSuperAdminPolling();
        }
      })
    );

    this.subs.push(
      this.router.events.pipe(filter(e => e instanceof NavigationEnd)).subscribe((e: any) => {
        const url = e.urlAfterRedirects || e.url;
        this.chromeless = ['/login', '/setup', '/reset-password'].some(p => url.startsWith(p)) || url === '/';
        if (this.showShell && !this.isSuperAdmin) {
          this.notifCount.refresh();
        } else if (this.isSuperAdmin) {
          this.refreshSuperAdminNotifCount();
        }
      })
    );

    this.subs.push(
      this.notifCount.unreadCount$.subscribe(count => {
        // Only update from community notif service if NOT super admin
        if (!this.isSuperAdmin) this.unreadCount = count;
      })
    );
  }

  ngOnDestroy() {
    this.stopPolling();
    this.subs.forEach(s => s.unsubscribe());
  }

  private startPolling() {
    this.notifCount.refresh();
    if (this.pollHandle) return;
    this.pollHandle = setInterval(() => this.notifCount.refresh(), 15000);
  }

  private stopPolling() {
    if (this.pollHandle) { clearInterval(this.pollHandle); this.pollHandle = null; }
  }

  private superAdminPollHandle: any;

  private startSuperAdminPolling() {
    if (this.superAdminPollHandle) return;
    this.superAdminPollHandle = setInterval(() => this.refreshSuperAdminNotifCount(), 15000);
  }

  private stopSuperAdminPolling() {
    if (this.superAdminPollHandle) { clearInterval(this.superAdminPollHandle); this.superAdminPollHandle = null; }
  }

  toggleSidebar() {
    this.sidebarCollapsed = !this.sidebarCollapsed;
    localStorage.setItem('omnicivic_sidebar_collapsed', this.sidebarCollapsed ? '1' : '0');
  }

  refreshSuperAdminNotifCount() {
    this.http.get<any[]>('/api/service-requests?status=PENDING').subscribe({
      next: list => { this.unreadCount = (list ?? []).length; },
      error: () => {}
    });
  }

  logout() {
    this.authService.logout();
  }
}
