import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class NotificationCountService {
  private _count$ = new BehaviorSubject<number>(0);
  unreadCount$ = this._count$.asObservable();

  constructor(private api: ApiService) {}

  /** Re-fetch the unread count from the server. */
  refresh(): void {
    this.api.getUnreadCount().subscribe({
      next: r => {
        // Backend returns { count: Long } — in JSON this is always a number
        const count = typeof r?.count === 'number' ? r.count : Number(r?.count ?? 0);
        this._count$.next(isNaN(count) ? 0 : count);
      },
      error: () => {}
    });
  }

  /** Optimistically clear the badge after marking as read in the UI. */
  clear(): void {
    this._count$.next(0);
  }

  /** Optimistically decrement by 1. */
  decrement(): void {
    const current = this._count$.value;
    this._count$.next(Math.max(0, current - 1));
  }
}
