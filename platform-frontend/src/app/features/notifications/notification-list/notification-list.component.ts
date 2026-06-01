// import { Component, OnInit } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { Router, RouterModule } from '@angular/router';
// import { ApiService } from '../../../core/services/api.service';
// import { NotificationCountService } from '../../../core/services/notification-count.service';
// import { Notification } from '../../../shared/models/models';

// @Component({
//   selector: 'app-notification-list',
//   standalone: true,
//   imports: [CommonModule, RouterModule],
//   templateUrl: './notification-list.component.html',
//   styleUrls: ['./notification-list.component.scss']
// })
// export class NotificationListComponent implements OnInit {
//   notifications: Notification[] = [];
//   loading = true;
//   filter: 'all' | 'unread' = 'all';

//   constructor(
//     private api: ApiService,
//     private notifCount: NotificationCountService,
//     private router: Router
//   ) {}

//   ngOnInit() { this.load(); }

//   private load() {
//     this.loading = true;
//     this.api.getNotifications().subscribe({
//       next: list => { this.notifications = list ?? []; this.loading = false; },
//       error: () => { this.loading = false; }
//     });
//   }

//   get filtered(): Notification[] {
//     return this.filter === 'unread'
//       ? this.notifications.filter(n => !n.read)
//       : this.notifications;
//   }

//   get unreadCount(): number {
//     return this.notifications.filter(n => !n.read).length;
//   }

//   markRead(n: Notification) {
//     if (n.read) return;
//     this.api.markNotificationRead(n.id).subscribe({
//       next: () => {
//         n.read = true;
//         this.notifCount.refresh();
//       }
//     });
//   }

//   markAll() {
//     if (this.unreadCount === 0) return;
//     this.api.markAllNotificationsRead().subscribe({
//       next: () => {
//         this.notifications.forEach(n => n.read = true);
//         this.notifCount.refresh();
//       }
//     });
//   }

//   open(n: Notification) {
//     this.markRead(n);
//     if (n.complaintId) this.router.navigate(['/complaints'], { queryParams: { id: n.complaintId } });
//   }

//   iconFor(type: string): string {
//     const lower = (type || '').toUpperCase();
//     if (lower.includes('ASSIGNED') || lower.includes('ASSIGNMENT')) return '◇';
//     if (lower.includes('PROOF') || lower.includes('REVIEW')) return '✓';
//     if (lower.includes('RESOLVED') || lower.includes('CLOSED')) return '✓';
//     if (lower.includes('REJECT')) return '✗';
//     if (lower.includes('UPVOTE')) return '↑';
//     if (lower.includes('SUBMITTED') || lower.includes('NEW')) return '•';
//     return '◯';
//   }

//   iconClass(type: string): string {
//     const lower = (type || '').toUpperCase();
//     if (lower.includes('RESOLVED') || lower.includes('CLOSED') || lower.includes('PROOF')) return 'icon-sage';
//     if (lower.includes('REJECT')) return 'icon-warm';
//     if (lower.includes('ASSIGNED') || lower.includes('ASSIGNMENT')) return 'icon-amber';
//     return 'icon-ink';
//   }

//   timeAgo(iso: string): string {
//     if (!iso) return '';
//     const ms = Date.now() - new Date(iso).getTime();
//     const m = Math.floor(ms / 60000);
//     if (m < 1) return 'just now';
//     if (m < 60) return `${m}m ago`;
//     const h = Math.floor(m / 60);
//     if (h < 24) return `${h}h ago`;
//     const d = Math.floor(h / 24);
//     if (d < 7) return `${d}d ago`;
//     return new Date(iso).toLocaleDateString();
//   }
// }


import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { NotificationCountService } from '../../../core/services/notification-count.service';
import { Notification } from '../../../shared/models/models';

@Component({
  selector: 'app-notification-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './notification-list.component.html',
  styleUrls: ['./notification-list.component.scss']
})
export class NotificationListComponent implements OnInit {
  notifications: Notification[] = [];
  loading = true;
  filter: 'all' | 'unread' = 'all';

  constructor(
    private api: ApiService,
    private notifCount: NotificationCountService,
    private router: Router
  ) {}

  isSuperAdmin = false;

  ngOnInit() {
    // Super admin has no community notifications — redirect to requests dashboard
    const user = JSON.parse(localStorage.getItem('omnicivic_user') ?? '{}');
    if (user?.role === 'SUPER_ADMIN') {
      this.isSuperAdmin = true;
      this.router.navigate(['/super-admin'], { queryParams: { tab: 'requests' } });
      return;
    }
    this.load();
  }

  private load() {
    this.loading = true;
    this.api.getNotifications().subscribe({
      next: list => { this.notifications = list ?? []; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  get filtered(): Notification[] {
    return this.filter === 'unread'
      ? this.notifications.filter(n => !n.read)
      : this.notifications;
  }

  get unreadCount(): number {
    return this.notifications.filter(n => !n.read).length;
  }

  markRead(n: Notification) {
    if (n.read) return;
    this.api.markNotificationRead(n.id).subscribe({
      next: () => {
        n.read = true;
        this.notifCount.refresh();
      }
    });
  }

  markAll() {
    if (this.unreadCount === 0) return;
    this.api.markAllNotificationsRead().subscribe({
      next: () => {
        this.notifications.forEach(n => n.read = true);
        this.notifCount.refresh();
      }
    });
  }

  open(n: Notification) {
    this.markRead(n);
    if (n.complaintId) this.router.navigate(['/complaints'], { queryParams: { id: n.complaintId } });
  }

  iconFor(type: string): string {
    const lower = (type || '').toUpperCase();
    if (lower.includes('ASSIGNED') || lower.includes('ASSIGNMENT')) return '◇';
    if (lower.includes('PROOF') || lower.includes('REVIEW')) return '✓';
    if (lower.includes('RESOLVED') || lower.includes('CLOSED')) return '✓';
    if (lower.includes('REJECT')) return '✗';
    if (lower.includes('UPVOTE')) return '↑';
    if (lower.includes('SUBMITTED') || lower.includes('NEW')) return '•';
    return '◯';
  }

  iconClass(type: string): string {
    const lower = (type || '').toUpperCase();
    if (lower.includes('RESOLVED') || lower.includes('CLOSED') || lower.includes('PROOF')) return 'icon-sage';
    if (lower.includes('REJECT')) return 'icon-warm';
    if (lower.includes('ASSIGNED') || lower.includes('ASSIGNMENT')) return 'icon-amber';
    return 'icon-ink';
  }

  timeAgo(iso: string): string {
    if (!iso) return '';
    const ms = Date.now() - new Date(iso).getTime();
    const m = Math.floor(ms / 60000);
    if (m < 1) return 'just now';
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    const d = Math.floor(h / 24);
    if (d < 7) return `${d}d ago`;
    return new Date(iso).toLocaleDateString();
  }
}
