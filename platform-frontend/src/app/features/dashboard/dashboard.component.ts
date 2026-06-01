// // // // // // import { Component, OnInit, OnDestroy, AfterViewInit, ElementRef, ViewChild, NgZone } from '@angular/core';
// // // // // // import { CommonModule } from '@angular/common';
// // // // // // import { Router, RouterModule } from '@angular/router';
// // // // // // import { Subscription } from 'rxjs';
// // // // // // import { AuthService } from '../../core/services/auth.service';
// // // // // // import { ApiService } from '../../core/services/api.service';
// // // // // // import { Complaint, CommunityBranding } from '../../shared/models/models';

// // // // // // declare const L: any;

// // // // // // @Component({
// // // // // //   selector: 'app-dashboard',
// // // // // //   standalone: true,
// // // // // //   imports: [CommonModule, RouterModule],
// // // // // //   templateUrl: './dashboard.component.html',
// // // // // //   styleUrls: ['./dashboard.component.scss']
// // // // // // })
// // // // // // export class DashboardComponent implements OnInit, AfterViewInit, OnDestroy {
// // // // // //   @ViewChild('mapEl') mapEl!: ElementRef<HTMLDivElement>;

// // // // // //   user: any = null;
// // // // // //   role: string | null = null;
// // // // // //   branding: CommunityBranding | null = null;
// // // // // //   themeColor = '#7B9576';

// // // // // //   complaints: Complaint[] = [];
// // // // // //   communityFeed: Complaint[] = [];   // all community complaints shown under staff's task list
// // // // // //   loading = true;
// // // // // //   loadingCommunityFeed = false;

// // // // // //   activeFilter: 'all' | 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' = 'all';
// // // // // //   highlightedId: number | null = null;

// // // // // //   stats = { total: 0, open: 0, inProgress: 0, proofSubmitted: 0, resolved: 0 };
// // // // // //   greeting = '';
// // // // // //   timeOfDay = '';

// // // // // //   private map: any = null;
// // // // // //   private markers: Record<number, any> = {};
// // // // // //   private subs: Subscription[] = [];
// // // // // //   private resizeObserver: ResizeObserver | null = null;
// // // // // //   private pollHandle: any;

// // // // // //   constructor(
// // // // // //     private auth: AuthService,
// // // // // //     private api: ApiService,
// // // // // //     private router: Router,
// // // // // //     private zone: NgZone
// // // // // //   ) {}

// // // // // //   ngOnInit() {
// // // // // //     this.user = this.auth.getCurrentUser();
// // // // // //     this.role = this.user?.role;
// // // // // //     this.branding = this.user?.branding ?? null;
// // // // // //     if (this.branding?.themeColor) this.themeColor = this.branding.themeColor;
// // // // // //     this.computeGreeting();
// // // // // //     this.loadComplaints();
// // // // // //     this.pollHandle = setInterval(() => this.loadComplaints(true), 30000);
// // // // // //   }

// // // // // //   ngAfterViewInit() {
// // // // // //     if (this.isResident() && this.mapEl) {
// // // // // //       this.zone.runOutsideAngular(() => {
// // // // // //         this.resizeObserver = new ResizeObserver(() => {
// // // // // //           if (this.mapEl?.nativeElement?.offsetHeight > 0) {
// // // // // //             this.resizeObserver?.disconnect();
// // // // // //             this.zone.run(() => this.initMap());
// // // // // //           }
// // // // // //         });
// // // // // //         this.resizeObserver.observe(this.mapEl.nativeElement);
// // // // // //         setTimeout(() => {
// // // // // //           if (this.mapEl?.nativeElement?.offsetHeight > 0 && !this.map) {
// // // // // //             this.zone.run(() => this.initMap());
// // // // // //           }
// // // // // //         }, 150);
// // // // // //       });
// // // // // //     }
// // // // // //   }

// // // // // //   ngOnDestroy() {
// // // // // //     if (this.pollHandle) clearInterval(this.pollHandle);
// // // // // //     this.subs.forEach(s => s.unsubscribe());
// // // // // //     this.resizeObserver?.disconnect();
// // // // // //     if (this.map) { try { this.map.remove(); } catch {} }
// // // // // //   }

// // // // // //   isResident(): boolean { return this.role === 'RESIDENT'; }
// // // // // //   isStaff(): boolean { return this.role === 'STAFF'; }
// // // // // //   isAdmin(): boolean { return this.role === 'ADMIN' || this.role === 'CO_ADMIN'; }

// // // // // //   private computeGreeting() {
// // // // // //     const h = new Date().getHours();
// // // // // //     // Use firstName if available, fall back to username
// // // // // //     const name = this.user?.firstName || this.user?.username || '';
// // // // // //     if (h >= 5 && h < 11) this.timeOfDay = 'Good morning';
// // // // // //     else if (h >= 11 && h < 17) this.timeOfDay = 'Good afternoon';
// // // // // //     else if (h >= 17 && h < 21) this.timeOfDay = 'Good evening';
// // // // // //     else this.timeOfDay = 'Working late';
// // // // // //     this.greeting = `${this.timeOfDay}, ${name}`;
// // // // // //   }

// // // // // //   get displayName(): string {
// // // // // //     return this.user?.firstName || this.user?.username || '';
// // // // // //   }

// // // // // //   private loadComplaints(silent = false) {
// // // // // //     if (!silent) this.loading = true;

// // // // // //     if (this.isResident()) {
// // // // // //       // Resident: load community feed (all complaints in community)
// // // // // //       // AND load own complaints separately for accurate stats
// // // // // //       this.api.getCommunityFeed().subscribe({
// // // // // //         next: list => {
// // // // // //           this.complaints = (list ?? []).sort(
// // // // // //             (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
// // // // // //           );
// // // // // //           this.loading = false;
// // // // // //           if (this.map) this.refreshMap();
// // // // // //         },
// // // // // //         error: () => { this.loading = false; }
// // // // // //       });
// // // // // //       // Load own complaints for stats separately
// // // // // //       this.api.getMyComplaints().subscribe({
// // // // // //         next: mine => {
// // // // // //           const t = mine ?? [];
// // // // // //           this.stats.total = t.length;
// // // // // //           this.stats.open = t.filter(c => c.status === 'OPEN' || c.status === 'SUBMITTED' || c.status === 'ASSIGNED').length;
// // // // // //           this.stats.inProgress = t.filter(c => c.status === 'IN_PROGRESS').length;
// // // // // //           this.stats.proofSubmitted = t.filter(c => c.status === 'PROOF_SUBMITTED').length;
// // // // // //           this.stats.resolved = t.filter(c => c.status === 'RESOLVED' || c.status === 'CLOSED').length;
// // // // // //         }
// // // // // //       });
// // // // // //       return;
// // // // // //     }

// // // // // //     let obs;
// // // // // //     if (this.isStaff()) obs = this.api.getAssignedComplaints();
// // // // // //     else obs = this.api.getAllComplaints();

// // // // // //     obs.subscribe({
// // // // // //       next: list => {
// // // // // //         this.complaints = (list ?? []).sort(
// // // // // //           (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
// // // // // //         );
// // // // // //         this.computeStats();
// // // // // //         this.loading = false;
// // // // // //         if (this.map) this.refreshMap();

// // // // // //         // Staff: also load the full community feed separately
// // // // // //         if (this.isStaff() && !silent) {
// // // // // //           this.loadingCommunityFeed = true;
// // // // // //           this.api.getCommunityFeed().subscribe({
// // // // // //             next: all => {
// // // // // //               this.communityFeed = (all ?? []).sort(
// // // // // //                 (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
// // // // // //               );
// // // // // //               this.loadingCommunityFeed = false;
// // // // // //             },
// // // // // //             error: () => { this.loadingCommunityFeed = false; }
// // // // // //           });
// // // // // //         }
// // // // // //       },
// // // // // //       error: () => { this.loading = false; }
// // // // // //     });
// // // // // //   }

// // // // // //   private computeStats() {
// // // // // //     const t = this.complaints;
// // // // // //     this.stats.total = t.length;
// // // // // //     // "Needs assignment" = OPEN or SUBMITTED only (not ASSIGNED — those are already assigned)
// // // // // //     this.stats.open = t.filter(c => c.status === 'OPEN' || c.status === 'SUBMITTED').length;
// // // // // //     // "In progress" = ASSIGNED + IN_PROGRESS
// // // // // //     this.stats.inProgress = t.filter(c => c.status === 'ASSIGNED' || c.status === 'IN_PROGRESS').length;
// // // // // //     // "Awaiting review" = proof submitted
// // // // // //     this.stats.proofSubmitted = t.filter(c => c.status === 'PROOF_SUBMITTED').length;
// // // // // //     // "Resolved" = resolved or closed
// // // // // //     this.stats.resolved = t.filter(c => c.status === 'RESOLVED' || c.status === 'CLOSED').length;
// // // // // //   }

// // // // // //   setFilter(f: typeof this.activeFilter) { this.activeFilter = f; }

// // // // // //   get filteredComplaints(): Complaint[] {
// // // // // //     if (this.activeFilter === 'all') return this.complaints;
// // // // // //     return this.complaints.filter(c => {
// // // // // //       if (this.activeFilter === 'OPEN') return c.status === 'OPEN' || c.status === 'SUBMITTED' || c.status === 'ASSIGNED';
// // // // // //       if (this.activeFilter === 'IN_PROGRESS') return c.status === 'IN_PROGRESS' || c.status === 'PROOF_SUBMITTED';
// // // // // //       if (this.activeFilter === 'RESOLVED') return c.status === 'RESOLVED' || c.status === 'CLOSED';
// // // // // //       return true;
// // // // // //     });
// // // // // //   }

// // // // // //   get filterCounts() {
// // // // // //     return {
// // // // // //       all: this.complaints.length,
// // // // // //       OPEN: this.complaints.filter(c => c.status === 'OPEN' || c.status === 'SUBMITTED').length,
// // // // // //       IN_PROGRESS: this.complaints.filter(c => c.status === 'ASSIGNED' || c.status === 'IN_PROGRESS' || c.status === 'PROOF_SUBMITTED').length,
// // // // // //       RESOLVED: this.complaints.filter(c => c.status === 'RESOLVED' || c.status === 'CLOSED').length,
// // // // // //     };
// // // // // //   }

// // // // // //   /** Staff: complaints waiting for admin review */
// // // // // //   get proofPendingComplaints(): Complaint[] {
// // // // // //     return this.complaints.filter(c => c.status === 'PROOF_SUBMITTED');
// // // // // //   }

// // // // // //   /** Staff: active work = IN_PROGRESS or ASSIGNED */
// // // // // //   get activeWorkComplaints(): Complaint[] {
// // // // // //     return this.complaints.filter(c => c.status === 'IN_PROGRESS' || c.status === 'ASSIGNED');
// // // // // //   }

// // // // // //   complaintNumber(c: Complaint): string {
// // // // // //     return c.communityComplaintNumber ? `#${c.communityComplaintNumber}` : `#${c.id}`;
// // // // // //   }

// // // // // //   statusColor(s: string): string {
// // // // // //     if (s === 'OPEN' || s === 'SUBMITTED') return '#B5564A';
// // // // // //     if (s === 'ASSIGNED' || s === 'IN_PROGRESS') return '#D4A24C';
// // // // // //     if (s === 'PROOF_SUBMITTED') return '#5B86A8';
// // // // // //     return '#7B9576';
// // // // // //   }

// // // // // //   statusLabel(s: string): string {
// // // // // //     const map: Record<string,string> = {
// // // // // //       SUBMITTED: 'New', OPEN: 'Open', ASSIGNED: 'Assigned',
// // // // // //       IN_PROGRESS: 'In progress', PROOF_SUBMITTED: 'Awaiting review',
// // // // // //       RESOLVED: 'Resolved', CLOSED: 'Closed'
// // // // // //     };
// // // // // //     return map[s] || s;
// // // // // //   }

// // // // // //   hasPhoto(c: Complaint): boolean { return !!(c.mediaBase64List && c.mediaBase64List.length > 0); }
// // // // // //   photoSrc(c: Complaint): string { return 'data:image/jpeg;base64,' + (c.mediaBase64List?.[0] ?? ''); }

// // // // // //   timeAgo(iso: string): string {
// // // // // //     if (!iso) return '';
// // // // // //     const ms = Date.now() - new Date(iso).getTime();
// // // // // //     const m = Math.floor(ms / 60000);
// // // // // //     if (m < 1) return 'just now';
// // // // // //     if (m < 60) return `${m}m ago`;
// // // // // //     const h = Math.floor(m / 60);
// // // // // //     if (h < 24) return `${h}h ago`;
// // // // // //     const d = Math.floor(h / 24);
// // // // // //     if (d < 7) return `${d}d ago`;
// // // // // //     return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
// // // // // //   }

// // // // // //   openComplaint(c: Complaint) {
// // // // // //     this.router.navigate(['/complaints'], { queryParams: { id: c.id } });
// // // // // //   }

// // // // // //   // ─── Map ──────────────────────────────────────────────────────────────────
// // // // // //   private initMap() {
// // // // // //     if (this.map || !this.mapEl || typeof L === 'undefined') return;
// // // // // //     const lat = this.branding?.mapCenterLat ?? 11.0168;
// // // // // //     const lng = this.branding?.mapCenterLng ?? 76.9558;
// // // // // //     const zoom = this.branding?.mapZoom ?? 16;

// // // // // //     this.map = L.map(this.mapEl.nativeElement, { zoomControl: true, attributionControl: false })
// // // // // //       .setView([lat, lng], zoom);
// // // // // //     L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(this.map);

// // // // // //     const style = document.createElement('style');
// // // // // //     style.textContent = `@keyframes pin-pulse { 0% { transform: scale(1); opacity: 0.6; } 100% { transform: scale(3.5); opacity: 0; } }`;
// // // // // //     document.head.appendChild(style);

// // // // // //     setTimeout(() => { if (this.map) this.map.invalidateSize(); }, 200);
// // // // // //     this.refreshMap();
// // // // // //   }

// // // // // //   private refreshMap() {
// // // // // //     if (!this.map) return;
// // // // // //     Object.values(this.markers).forEach(m => { try { this.map.removeLayer(m); } catch {} });
// // // // // //     this.markers = {};

// // // // // //     this.complaints.forEach(c => {
// // // // // //       if (c.latitude == null || c.longitude == null) return;
// // // // // //       const color = this.statusColor(c.status);
// // // // // //       const ring = c.status !== 'RESOLVED' && c.status !== 'CLOSED';
// // // // // //       const html = `
// // // // // //         <div style="position:relative;width:14px;height:14px;cursor:pointer;">
// // // // // //           <div style="position:absolute;inset:0;background:${color};border-radius:50%;border:2px solid #FAF9F5;box-shadow:0 1px 3px rgba(0,0,0,0.3);transition:transform 300ms cubic-bezier(0.32,0.72,0,1);"></div>
// // // // // //           ${ring ? `<div style="position:absolute;inset:-2px;border-radius:50%;background:${color};opacity:0.4;animation:pin-pulse 2s ease-out infinite;"></div>` : ''}
// // // // // //         </div>`;
// // // // // //       const icon = L.divIcon({ html, className: '', iconSize: [14,14], iconAnchor: [7,7] });
// // // // // //       const m = L.marker([c.latitude, c.longitude], { icon })
// // // // // //         .addTo(this.map)
// // // // // //         .bindTooltip(`${c.categoryName} · ${this.statusLabel(c.status)}`, { direction: 'top', offset: [0,-8] });
// // // // // //       m.on('click', () => this.zone.run(() => this.highlightFromMap(c.id)));
// // // // // //       this.markers[c.id] = m;
// // // // // //     });
// // // // // //   }

// // // // // //   highlightFromCard(c: Complaint) {
// // // // // //     this.highlightedId = c.id;
// // // // // //     const m = this.markers[c.id];
// // // // // //     if (m && this.map) {
// // // // // //       this.map.flyTo([c.latitude, c.longitude], Math.max(this.map.getZoom(), 18), { duration: 0.6 });
// // // // // //       const el = m.getElement();
// // // // // //       if (el) {
// // // // // //         const pin = el.querySelector('div > div:first-child') as HTMLElement;
// // // // // //         if (pin) {
// // // // // //           pin.style.transform = 'scale(1.7)';
// // // // // //           pin.style.boxShadow = '0 0 0 6px rgba(123, 149, 118, 0.45)';
// // // // // //           setTimeout(() => { pin.style.transform = ''; pin.style.boxShadow = ''; }, 2000);
// // // // // //         }
// // // // // //       }
// // // // // //     }
// // // // // //     setTimeout(() => { if (this.highlightedId === c.id) this.highlightedId = null; }, 2200);
// // // // // //   }

// // // // // //   private highlightFromMap(id: number) {
// // // // // //     this.highlightedId = id;
// // // // // //     setTimeout(() => {
// // // // // //       const card = document.querySelector(`[data-card-id="${id}"]`) as HTMLElement;
// // // // // //       if (card) card.scrollIntoView({ behavior: 'smooth', block: 'center' });
// // // // // //     }, 50);
// // // // // //     setTimeout(() => { if (this.highlightedId === id) this.highlightedId = null; }, 2400);
// // // // // //   }
// // // // // // }




// // // // // import { Component, OnInit, OnDestroy, AfterViewInit, ElementRef, ViewChild, NgZone } from '@angular/core';
// // // // // import { CommonModule } from '@angular/common';
// // // // // import { Router, RouterModule } from '@angular/router';
// // // // // import { Subscription } from 'rxjs';
// // // // // import { AuthService } from '../../core/services/auth.service';
// // // // // import { ApiService } from '../../core/services/api.service';
// // // // // import { Complaint, CommunityBranding } from '../../shared/models/models';

// // // // // declare const L: any;

// // // // // @Component({
// // // // //   selector: 'app-dashboard',
// // // // //   standalone: true,
// // // // //   imports: [CommonModule, RouterModule],
// // // // //   templateUrl: './dashboard.component.html',
// // // // //   styleUrls: ['./dashboard.component.scss']
// // // // // })
// // // // // export class DashboardComponent implements OnInit, AfterViewInit, OnDestroy {
// // // // //   @ViewChild('mapEl') mapEl!: ElementRef<HTMLDivElement>;

// // // // //   user: any = null;
// // // // //   role: string | null = null;
// // // // //   branding: CommunityBranding | null = null;
// // // // //   themeColor = '#7B9576';

// // // // //   complaints: Complaint[] = [];
// // // // //   communityFeed: Complaint[] = [];   // all community complaints shown under staff's task list
// // // // //   loading = true;
// // // // //   loadingCommunityFeed = false;

// // // // //   activeFilter: 'all' | 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' = 'all';
// // // // //   highlightedId: number | null = null;

// // // // //   stats = { total: 0, open: 0, inProgress: 0, proofSubmitted: 0, resolved: 0 };
// // // // //   greeting = '';
// // // // //   timeOfDay = '';

// // // // //   private map: any = null;
// // // // //   private markers: Record<number, any> = {};
// // // // //   private subs: Subscription[] = [];
// // // // //   private resizeObserver: ResizeObserver | null = null;
// // // // //   private pollHandle: any;

// // // // //   constructor(
// // // // //     private auth: AuthService,
// // // // //     private api: ApiService,
// // // // //     private router: Router,
// // // // //     private zone: NgZone
// // // // //   ) {}

// // // // //   ngOnInit() {
// // // // //     this.user = this.auth.getCurrentUser();
// // // // //     this.role = this.user?.role;
// // // // //     this.branding = this.user?.branding ?? null;
// // // // //     if (this.branding?.themeColor) this.themeColor = this.branding.themeColor;
// // // // //     this.computeGreeting();
// // // // //     this.loadComplaints();
// // // // //     this.pollHandle = setInterval(() => this.loadComplaints(true), 30000);
// // // // //   }

// // // // //   ngAfterViewInit() {
// // // // //     if (this.isResident() && this.mapEl) {
// // // // //       this.zone.runOutsideAngular(() => {
// // // // //         this.resizeObserver = new ResizeObserver(() => {
// // // // //           if (this.mapEl?.nativeElement?.offsetHeight > 0) {
// // // // //             this.resizeObserver?.disconnect();
// // // // //             this.zone.run(() => this.initMap());
// // // // //           }
// // // // //         });
// // // // //         this.resizeObserver.observe(this.mapEl.nativeElement);
// // // // //         setTimeout(() => {
// // // // //           if (this.mapEl?.nativeElement?.offsetHeight > 0 && !this.map) {
// // // // //             this.zone.run(() => this.initMap());
// // // // //           }
// // // // //         }, 150);
// // // // //       });
// // // // //     }
// // // // //   }

// // // // //   ngOnDestroy() {
// // // // //     if (this.pollHandle) clearInterval(this.pollHandle);
// // // // //     this.subs.forEach(s => s.unsubscribe());
// // // // //     this.resizeObserver?.disconnect();
// // // // //     if (this.map) { try { this.map.remove(); } catch {} }
// // // // //   }

// // // // //   isResident(): boolean { return this.role === 'RESIDENT'; }
// // // // //   isStaff(): boolean { return this.role === 'STAFF'; }
// // // // //   isAdmin(): boolean { return this.role === 'ADMIN' || this.role === 'CO_ADMIN'; }

// // // // //   private computeGreeting() {
// // // // //     const h = new Date().getHours();
// // // // //     // Use firstName if available, fall back to username
// // // // //     const name = this.user?.firstName || this.user?.username || '';
// // // // //     if (h >= 5 && h < 11) this.timeOfDay = 'Good morning';
// // // // //     else if (h >= 11 && h < 17) this.timeOfDay = 'Good afternoon';
// // // // //     else if (h >= 17 && h < 21) this.timeOfDay = 'Good evening';
// // // // //     else this.timeOfDay = 'Working late';
// // // // //     this.greeting = `${this.timeOfDay}, ${name}`;
// // // // //   }

// // // // //   get displayName(): string {
// // // // //     return this.user?.firstName || this.user?.username || '';
// // // // //   }

// // // // //   private loadComplaints(silent = false) {
// // // // //     if (!silent) this.loading = true;

// // // // //     if (this.isResident()) {
// // // // //       // Resident: load community feed (all complaints in community)
// // // // //       // AND load own complaints separately for accurate stats
// // // // //       this.api.getCommunityFeed().subscribe({
// // // // //         next: list => {
// // // // //           this.complaints = (list ?? []).sort(
// // // // //             (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
// // // // //           );
// // // // //           this.loading = false;
// // // // //           if (this.map) this.refreshMap();
// // // // //         },
// // // // //         error: () => { this.loading = false; }
// // // // //       });
// // // // //       // Load own complaints for stats separately
// // // // //       this.api.getMyComplaints().subscribe({
// // // // //         next: mine => {
// // // // //           const t = mine ?? [];
// // // // //           this.stats.total = t.length;
// // // // //           this.stats.open = t.filter(c => c.status === 'OPEN' || c.status === 'SUBMITTED' || c.status === 'ASSIGNED').length;
// // // // //           this.stats.inProgress = t.filter(c => c.status === 'IN_PROGRESS').length;
// // // // //           this.stats.proofSubmitted = t.filter(c => c.status === 'PROOF_SUBMITTED').length;
// // // // //           this.stats.resolved = t.filter(c => c.status === 'RESOLVED' || c.status === 'CLOSED').length;
// // // // //         }
// // // // //       });
// // // // //       return;
// // // // //     }

// // // // //     let obs;
// // // // //     if (this.isStaff()) obs = this.api.getAssignedComplaints();
// // // // //     else obs = this.api.getAllComplaints();

// // // // //     obs.subscribe({
// // // // //       next: list => {
// // // // //         this.complaints = (list ?? []).sort(
// // // // //           (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
// // // // //         );
// // // // //         this.computeStats();
// // // // //         this.loading = false;
// // // // //         if (this.map) this.refreshMap();

// // // // //         // Staff: also load the full community feed separately
// // // // //         if (this.isStaff() && !silent) {
// // // // //           this.loadingCommunityFeed = true;
// // // // //           this.api.getCommunityFeed().subscribe({
// // // // //             next: all => {
// // // // //               this.communityFeed = (all ?? []).sort(
// // // // //                 (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
// // // // //               );
// // // // //               this.loadingCommunityFeed = false;
// // // // //             },
// // // // //             error: () => { this.loadingCommunityFeed = false; }
// // // // //           });
// // // // //         }
// // // // //       },
// // // // //       error: () => { this.loading = false; }
// // // // //     });
// // // // //   }

// // // // //   private computeStats() {
// // // // //     const t = this.complaints;
// // // // //     this.stats.total = t.length;
// // // // //     // "Needs assignment" = OPEN or SUBMITTED only (not ASSIGNED — those are already assigned)
// // // // //     this.stats.open = t.filter(c => c.status === 'OPEN' || c.status === 'SUBMITTED').length;
// // // // //     // "In progress" = ASSIGNED + IN_PROGRESS
// // // // //     this.stats.inProgress = t.filter(c => c.status === 'ASSIGNED' || c.status === 'IN_PROGRESS').length;
// // // // //     // "Awaiting review" = proof submitted
// // // // //     this.stats.proofSubmitted = t.filter(c => c.status === 'PROOF_SUBMITTED').length;
// // // // //     // "Resolved" = resolved or closed
// // // // //     this.stats.resolved = t.filter(c => c.status === 'RESOLVED' || c.status === 'CLOSED').length;
// // // // //   }

// // // // //   setFilter(f: typeof this.activeFilter) { this.activeFilter = f; }

// // // // //   get filteredComplaints(): Complaint[] {
// // // // //     if (this.activeFilter === 'all') return this.complaints;
// // // // //     return this.complaints.filter(c => {
// // // // //       if (this.activeFilter === 'OPEN') return c.status === 'OPEN' || c.status === 'SUBMITTED' || c.status === 'ASSIGNED';
// // // // //       if (this.activeFilter === 'IN_PROGRESS') return c.status === 'IN_PROGRESS' || c.status === 'PROOF_SUBMITTED';
// // // // //       if (this.activeFilter === 'RESOLVED') return c.status === 'RESOLVED' || c.status === 'CLOSED';
// // // // //       return true;
// // // // //     });
// // // // //   }

// // // // //   get filterCounts() {
// // // // //     return {
// // // // //       all: this.complaints.length,
// // // // //       OPEN: this.complaints.filter(c => c.status === 'OPEN' || c.status === 'SUBMITTED').length,
// // // // //       IN_PROGRESS: this.complaints.filter(c => c.status === 'ASSIGNED' || c.status === 'IN_PROGRESS' || c.status === 'PROOF_SUBMITTED').length,
// // // // //       RESOLVED: this.complaints.filter(c => c.status === 'RESOLVED' || c.status === 'CLOSED').length,
// // // // //     };
// // // // //   }

// // // // //   /** Staff: complaints waiting for admin review */
// // // // //   get proofPendingComplaints(): Complaint[] {
// // // // //     return this.complaints.filter(c => c.status === 'PROOF_SUBMITTED');
// // // // //   }

// // // // //   /** Staff: active work = IN_PROGRESS or ASSIGNED */
// // // // //   get activeWorkComplaints(): Complaint[] {
// // // // //     return this.complaints.filter(c => c.status === 'IN_PROGRESS' || c.status === 'ASSIGNED');
// // // // //   }

// // // // //   complaintNumber(c: Complaint): string {
// // // // //     return c.communityComplaintNumber ? `#${c.communityComplaintNumber}` : `#${c.id}`;
// // // // //   }

// // // // //   statusColor(s: string): string {
// // // // //     if (s === 'OPEN' || s === 'SUBMITTED') return '#B5564A';
// // // // //     if (s === 'ASSIGNED' || s === 'IN_PROGRESS') return '#D4A24C';
// // // // //     if (s === 'PROOF_SUBMITTED') return '#5B86A8';
// // // // //     return '#7B9576';
// // // // //   }

// // // // //   statusLabel(s: string): string {
// // // // //     const map: Record<string,string> = {
// // // // //       SUBMITTED: 'New', OPEN: 'Open', ASSIGNED: 'Assigned',
// // // // //       IN_PROGRESS: 'In progress', PROOF_SUBMITTED: 'Awaiting review',
// // // // //       RESOLVED: 'Resolved', CLOSED: 'Closed'
// // // // //     };
// // // // //     return map[s] || s;
// // // // //   }

// // // // //   hasPhoto(c: Complaint): boolean {
// // // // //     return !!(c.thumbnailBase64 || (c.mediaBase64List && c.mediaBase64List.length > 0));
// // // // //   }
// // // // //   photoSrc(c: Complaint): string {
// // // // //     const b64 = c.mediaBase64List?.[0] ?? c.thumbnailBase64 ?? '';
// // // // //     if (!b64) return '';
// // // // //     if (b64.startsWith('/9j/')) return 'data:image/jpeg;base64,' + b64;
// // // // //     if (b64.startsWith('iVBOR')) return 'data:image/png;base64,' + b64;
// // // // //     return 'data:image/jpeg;base64,' + b64;
// // // // //   }

// // // // //   timeAgo(iso: string): string {
// // // // //     if (!iso) return '';
// // // // //     const ms = Date.now() - new Date(iso).getTime();
// // // // //     const m = Math.floor(ms / 60000);
// // // // //     if (m < 1) return 'just now';
// // // // //     if (m < 60) return `${m}m ago`;
// // // // //     const h = Math.floor(m / 60);
// // // // //     if (h < 24) return `${h}h ago`;
// // // // //     const d = Math.floor(h / 24);
// // // // //     if (d < 7) return `${d}d ago`;
// // // // //     return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
// // // // //   }

// // // // //   openComplaint(c: Complaint) {
// // // // //     this.router.navigate(['/complaints'], { queryParams: { id: c.id } });
// // // // //   }

// // // // //   // ─── Map ──────────────────────────────────────────────────────────────────
// // // // //   private initMap() {
// // // // //     if (this.map || !this.mapEl || typeof L === 'undefined') return;
// // // // //     const lat = this.branding?.mapCenterLat ?? 11.0168;
// // // // //     const lng = this.branding?.mapCenterLng ?? 76.9558;
// // // // //     const zoom = this.branding?.mapZoom ?? 16;

// // // // //     this.map = L.map(this.mapEl.nativeElement, { zoomControl: true, attributionControl: false })
// // // // //       .setView([lat, lng], zoom);
// // // // //     L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(this.map);

// // // // //     const style = document.createElement('style');
// // // // //     style.textContent = `@keyframes pin-pulse { 0% { transform: scale(1); opacity: 0.6; } 100% { transform: scale(3.5); opacity: 0; } }`;
// // // // //     document.head.appendChild(style);

// // // // //     setTimeout(() => { if (this.map) this.map.invalidateSize(); }, 200);
// // // // //     this.refreshMap();
// // // // //   }

// // // // //   private refreshMap() {
// // // // //     if (!this.map) return;
// // // // //     Object.values(this.markers).forEach(m => { try { this.map.removeLayer(m); } catch {} });
// // // // //     this.markers = {};

// // // // //     this.complaints.forEach(c => {
// // // // //       if (c.latitude == null || c.longitude == null) return;
// // // // //       const color = this.statusColor(c.status);
// // // // //       const ring = c.status !== 'RESOLVED' && c.status !== 'CLOSED';
// // // // //       const html = `
// // // // //         <div style="position:relative;width:14px;height:14px;cursor:pointer;">
// // // // //           <div style="position:absolute;inset:0;background:${color};border-radius:50%;border:2px solid #FAF9F5;box-shadow:0 1px 3px rgba(0,0,0,0.3);transition:transform 300ms cubic-bezier(0.32,0.72,0,1);"></div>
// // // // //           ${ring ? `<div style="position:absolute;inset:-2px;border-radius:50%;background:${color};opacity:0.4;animation:pin-pulse 2s ease-out infinite;"></div>` : ''}
// // // // //         </div>`;
// // // // //       const icon = L.divIcon({ html, className: '', iconSize: [14,14], iconAnchor: [7,7] });
// // // // //       const m = L.marker([c.latitude, c.longitude], { icon })
// // // // //         .addTo(this.map)
// // // // //         .bindTooltip(`${c.categoryName} · ${this.statusLabel(c.status)}`, { direction: 'top', offset: [0,-8] });
// // // // //       m.on('click', () => this.zone.run(() => this.highlightFromMap(c.id)));
// // // // //       this.markers[c.id] = m;
// // // // //     });
// // // // //   }

// // // // //   highlightFromCard(c: Complaint) {
// // // // //     this.highlightedId = c.id;
// // // // //     const m = this.markers[c.id];
// // // // //     if (m && this.map) {
// // // // //       this.map.flyTo([c.latitude, c.longitude], Math.max(this.map.getZoom(), 18), { duration: 0.6 });
// // // // //       const el = m.getElement();
// // // // //       if (el) {
// // // // //         const pin = el.querySelector('div > div:first-child') as HTMLElement;
// // // // //         if (pin) {
// // // // //           pin.style.transform = 'scale(1.7)';
// // // // //           pin.style.boxShadow = '0 0 0 6px rgba(123, 149, 118, 0.45)';
// // // // //           setTimeout(() => { pin.style.transform = ''; pin.style.boxShadow = ''; }, 2000);
// // // // //         }
// // // // //       }
// // // // //     }
// // // // //     setTimeout(() => { if (this.highlightedId === c.id) this.highlightedId = null; }, 2200);
// // // // //   }

// // // // //   private highlightFromMap(id: number) {
// // // // //     this.highlightedId = id;
// // // // //     setTimeout(() => {
// // // // //       const card = document.querySelector(`[data-card-id="${id}"]`) as HTMLElement;
// // // // //       if (card) card.scrollIntoView({ behavior: 'smooth', block: 'center' });
// // // // //     }, 50);
// // // // //     setTimeout(() => { if (this.highlightedId === id) this.highlightedId = null; }, 2400);
// // // // //   }
// // // // // }



// // // // import { Component, OnInit, OnDestroy, AfterViewInit, ElementRef, ViewChild, NgZone } from '@angular/core';
// // // // import { CommonModule } from '@angular/common';
// // // // import { Router, RouterModule } from '@angular/router';
// // // // import { Subscription } from 'rxjs';
// // // // import { AuthService } from '../../core/services/auth.service';
// // // // import { ApiService } from '../../core/services/api.service';
// // // // import { Complaint, CommunityBranding } from '../../shared/models/models';

// // // // declare const L: any;

// // // // @Component({
// // // //   selector: 'app-dashboard',
// // // //   standalone: true,
// // // //   imports: [CommonModule, RouterModule],
// // // //   templateUrl: './dashboard.component.html',
// // // //   styleUrls: ['./dashboard.component.scss']
// // // // })
// // // // export class DashboardComponent implements OnInit, AfterViewInit, OnDestroy {
// // // //   @ViewChild('mapEl') mapEl!: ElementRef<HTMLDivElement>;

// // // //   user: any = null;
// // // //   role: string | null = null;
// // // //   branding: CommunityBranding | null = null;
// // // //   themeColor = '#7B9576';

// // // //   complaints: Complaint[] = [];
// // // //   communityFeed: Complaint[] = [];   // all community complaints shown under staff's task list
// // // //   loading = true;
// // // //   loadingCommunityFeed = false;

// // // //   activeFilter: 'all' | 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' = 'all';
// // // //   highlightedId: number | null = null;

// // // //   stats = { total: 0, open: 0, inProgress: 0, proofSubmitted: 0, resolved: 0 };
// // // //   greeting = '';
// // // //   timeOfDay = '';

// // // //   private map: any = null;
// // // //   private markers: Record<number, any> = {};
// // // //   private subs: Subscription[] = [];
// // // //   private resizeObserver: ResizeObserver | null = null;
// // // //   private pollHandle: any;

// // // //   constructor(
// // // //     private auth: AuthService,
// // // //     private api: ApiService,
// // // //     private router: Router,
// // // //     private zone: NgZone
// // // //   ) {}

// // // //   ngOnInit() {
// // // //     this.user = this.auth.getCurrentUser();
// // // //     this.role = this.user?.role;
// // // //     this.branding = this.user?.branding ?? null;
// // // //     if (this.branding?.themeColor) this.themeColor = this.branding.themeColor;
// // // //     this.computeGreeting();
// // // //     this.loadComplaints();
// // // //     this.pollHandle = setInterval(() => this.loadComplaints(true), 30000);
// // // //   }

// // // //   ngAfterViewInit() {
// // // //     if (this.isResident() && this.mapEl) {
// // // //       this.zone.runOutsideAngular(() => {
// // // //         this.resizeObserver = new ResizeObserver(() => {
// // // //           if (this.mapEl?.nativeElement?.offsetHeight > 0) {
// // // //             this.resizeObserver?.disconnect();
// // // //             this.zone.run(() => this.initMap());
// // // //           }
// // // //         });
// // // //         this.resizeObserver.observe(this.mapEl.nativeElement);
// // // //         setTimeout(() => {
// // // //           if (this.mapEl?.nativeElement?.offsetHeight > 0 && !this.map) {
// // // //             this.zone.run(() => this.initMap());
// // // //           }
// // // //         }, 150);
// // // //       });
// // // //     }
// // // //   }

// // // //   ngOnDestroy() {
// // // //     if (this.pollHandle) clearInterval(this.pollHandle);
// // // //     this.subs.forEach(s => s.unsubscribe());
// // // //     this.resizeObserver?.disconnect();
// // // //     if (this.map) { try { this.map.remove(); } catch {} }
// // // //   }

// // // //   isResident(): boolean { return this.role === 'RESIDENT'; }
// // // //   isStaff(): boolean { return this.role === 'STAFF'; }
// // // //   isAdmin(): boolean { return this.role === 'ADMIN' || this.role === 'CO_ADMIN'; }

// // // //   private computeGreeting() {
// // // //     const h = new Date().getHours();
// // // //     // Use firstName if available, fall back to username
// // // //     const name = this.user?.firstName || this.user?.username || '';
// // // //     if (h >= 5 && h < 11) this.timeOfDay = 'Good morning';
// // // //     else if (h >= 11 && h < 17) this.timeOfDay = 'Good afternoon';
// // // //     else if (h >= 17 && h < 21) this.timeOfDay = 'Good evening';
// // // //     else this.timeOfDay = 'Working late';
// // // //     this.greeting = `${this.timeOfDay}, ${name}`;
// // // //   }

// // // //   get displayName(): string {
// // // //     return this.user?.firstName || this.user?.username || '';
// // // //   }

// // // //   private loadComplaints(silent = false) {
// // // //     if (!silent) this.loading = true;

// // // //     if (this.isResident()) {
// // // //       // Resident: load community feed (all complaints in community)
// // // //       // AND load own complaints separately for accurate stats
// // // //       this.api.getCommunityFeed().subscribe({
// // // //         next: list => {
// // // //           this.complaints = (list ?? []).sort(
// // // //             (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
// // // //           );
// // // //           this.loading = false;
// // // //           if (this.map) this.refreshMap();
// // // //         },
// // // //         error: () => { this.loading = false; }
// // // //       });
// // // //       // Load own complaints for stats separately
// // // //       this.api.getMyComplaints().subscribe({
// // // //         next: mine => {
// // // //           const t = mine ?? [];
// // // //           this.stats.total = t.length;
// // // //           this.stats.open = t.filter(c => c.status === 'OPEN' || c.status === 'SUBMITTED' || c.status === 'ASSIGNED').length;
// // // //           this.stats.inProgress = t.filter(c => c.status === 'IN_PROGRESS').length;
// // // //           this.stats.proofSubmitted = t.filter(c => c.status === 'PROOF_SUBMITTED').length;
// // // //           this.stats.resolved = t.filter(c => c.status === 'RESOLVED' || c.status === 'CLOSED').length;
// // // //         }
// // // //       });
// // // //       return;
// // // //     }

// // // //     let obs;
// // // //     if (this.isStaff()) obs = this.api.getAssignedComplaints();
// // // //     else obs = this.api.getAllComplaints();

// // // //     obs.subscribe({
// // // //       next: list => {
// // // //         this.complaints = (list ?? []).sort(
// // // //           (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
// // // //         );
// // // //         this.computeStats();
// // // //         this.loading = false;
// // // //         if (this.map) this.refreshMap();

// // // //         // Staff: also load the full community feed separately
// // // //         if (this.isStaff() && !silent) {
// // // //           this.loadingCommunityFeed = true;
// // // //           this.api.getCommunityFeed().subscribe({
// // // //             next: all => {
// // // //               this.communityFeed = (all ?? []).sort(
// // // //                 (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
// // // //               );
// // // //               this.loadingCommunityFeed = false;
// // // //             },
// // // //             error: () => { this.loadingCommunityFeed = false; }
// // // //           });
// // // //         }
// // // //       },
// // // //       error: () => { this.loading = false; }
// // // //     });
// // // //   }

// // // //   private computeStats() {
// // // //     const t = this.complaints;
// // // //     this.stats.total = t.length;
// // // //     // "Needs assignment" = OPEN or SUBMITTED only (not ASSIGNED — those are already assigned)
// // // //     this.stats.open = t.filter(c => c.status === 'OPEN' || c.status === 'SUBMITTED').length;
// // // //     // "In progress" = ASSIGNED + IN_PROGRESS
// // // //     this.stats.inProgress = t.filter(c => c.status === 'ASSIGNED' || c.status === 'IN_PROGRESS').length;
// // // //     // "Awaiting review" = proof submitted
// // // //     this.stats.proofSubmitted = t.filter(c => c.status === 'PROOF_SUBMITTED').length;
// // // //     // "Resolved" = resolved or closed
// // // //     this.stats.resolved = t.filter(c => c.status === 'RESOLVED' || c.status === 'CLOSED').length;
// // // //   }

// // // //   setFilter(f: typeof this.activeFilter) { this.activeFilter = f; }

// // // //   get filteredComplaints(): Complaint[] {
// // // //     if (this.activeFilter === 'all') return this.complaints;
// // // //     return this.complaints.filter(c => {
// // // //       if (this.activeFilter === 'OPEN') return c.status === 'OPEN' || c.status === 'SUBMITTED' || c.status === 'ASSIGNED';
// // // //       if (this.activeFilter === 'IN_PROGRESS') return c.status === 'IN_PROGRESS' || c.status === 'PROOF_SUBMITTED';
// // // //       if (this.activeFilter === 'RESOLVED') return c.status === 'RESOLVED' || c.status === 'CLOSED';
// // // //       return true;
// // // //     });
// // // //   }

// // // //   get filterCounts() {
// // // //     return {
// // // //       all: this.complaints.length,
// // // //       OPEN: this.complaints.filter(c => c.status === 'OPEN' || c.status === 'SUBMITTED').length,
// // // //       IN_PROGRESS: this.complaints.filter(c => c.status === 'ASSIGNED' || c.status === 'IN_PROGRESS' || c.status === 'PROOF_SUBMITTED').length,
// // // //       RESOLVED: this.complaints.filter(c => c.status === 'RESOLVED' || c.status === 'CLOSED').length,
// // // //     };
// // // //   }

// // // //   /** Staff: complaints waiting for admin review */
// // // //   get proofPendingComplaints(): Complaint[] {
// // // //     return this.complaints.filter(c => c.status === 'PROOF_SUBMITTED');
// // // //   }

// // // //   /** Staff: active work = IN_PROGRESS or ASSIGNED */
// // // //   get activeWorkComplaints(): Complaint[] {
// // // //     return this.complaints.filter(c => c.status === 'IN_PROGRESS' || c.status === 'ASSIGNED');
// // // //   }

// // // //   complaintNumber(c: Complaint): string {
// // // //     return c.communityComplaintNumber ? `#${c.communityComplaintNumber}` : `#${c.id}`;
// // // //   }

// // // //   statusColor(s: string): string {
// // // //     if (s === 'OPEN' || s === 'SUBMITTED') return '#B5564A';
// // // //     if (s === 'ASSIGNED' || s === 'IN_PROGRESS') return '#D4A24C';
// // // //     if (s === 'PROOF_SUBMITTED') return '#5B86A8';
// // // //     return '#7B9576';
// // // //   }

// // // //   statusLabel(s: string): string {
// // // //     const map: Record<string,string> = {
// // // //       SUBMITTED: 'New', OPEN: 'Open', ASSIGNED: 'Assigned',
// // // //       IN_PROGRESS: 'In progress', PROOF_SUBMITTED: 'Awaiting review',
// // // //       RESOLVED: 'Resolved', CLOSED: 'Closed'
// // // //     };
// // // //     return map[s] || s;
// // // //   }

// // // //   hasPhoto(c: Complaint): boolean {
// // // //     const b64 = c.mediaBase64List?.[0] ?? c.thumbnailBase64 ?? '';
// // // //     if (!b64) return false;
// // // //     // Exclude community branding logo — compare against known branding logo
// // // //     const brandingLogo = this.branding?.logoBase64 ?? '';
// // // //     if (brandingLogo && b64.substring(0, 30) === brandingLogo.substring(0, 30)) return false;
// // // //     // Must be at least 10KB of base64 (real photo) — logos are usually smaller
// // // //     // base64 chars: 1 char ≈ 0.75 bytes, so 10KB ≈ 13700 chars
// // // //     if (b64.length < 5000) return false;
// // // //     return true;
// // // //   }
// // // //   photoSrc(c: Complaint): string {
// // // //     const b64 = c.mediaBase64List?.[0] ?? c.thumbnailBase64 ?? '';
// // // //     if (!b64) return '';
// // // //     if (b64.startsWith('/9j/')) return 'data:image/jpeg;base64,' + b64;
// // // //     if (b64.startsWith('iVBOR')) return 'data:image/png;base64,' + b64;
// // // //     return 'data:image/jpeg;base64,' + b64;
// // // //   }

// // // //   timeAgo(iso: string): string {
// // // //     if (!iso) return '';
// // // //     const ms = Date.now() - new Date(iso).getTime();
// // // //     const m = Math.floor(ms / 60000);
// // // //     if (m < 1) return 'just now';
// // // //     if (m < 60) return `${m}m ago`;
// // // //     const h = Math.floor(m / 60);
// // // //     if (h < 24) return `${h}h ago`;
// // // //     const d = Math.floor(h / 24);
// // // //     if (d < 7) return `${d}d ago`;
// // // //     return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
// // // //   }

// // // //   openComplaint(c: Complaint) {
// // // //     this.router.navigate(['/complaints'], { queryParams: { id: c.id } });
// // // //   }

// // // //   // ─── Map ──────────────────────────────────────────────────────────────────
// // // //   private initMap() {
// // // //     if (this.map || !this.mapEl || typeof L === 'undefined') return;
// // // //     const lat = this.branding?.mapCenterLat ?? 11.0168;
// // // //     const lng = this.branding?.mapCenterLng ?? 76.9558;
// // // //     const zoom = this.branding?.mapZoom ?? 16;

// // // //     this.map = L.map(this.mapEl.nativeElement, { zoomControl: true, attributionControl: false })
// // // //       .setView([lat, lng], zoom);
// // // //     L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(this.map);

// // // //     const style = document.createElement('style');
// // // //     style.textContent = `@keyframes pin-pulse { 0% { transform: scale(1); opacity: 0.6; } 100% { transform: scale(3.5); opacity: 0; } }`;
// // // //     document.head.appendChild(style);

// // // //     setTimeout(() => { if (this.map) this.map.invalidateSize(); }, 200);
// // // //     this.refreshMap();
// // // //   }

// // // //   private refreshMap() {
// // // //     if (!this.map) return;
// // // //     Object.values(this.markers).forEach(m => { try { this.map.removeLayer(m); } catch {} });
// // // //     this.markers = {};

// // // //     this.complaints.forEach(c => {
// // // //       if (c.latitude == null || c.longitude == null) return;
// // // //       const color = this.statusColor(c.status);
// // // //       const ring = c.status !== 'RESOLVED' && c.status !== 'CLOSED';
// // // //       const html = `
// // // //         <div style="position:relative;width:14px;height:14px;cursor:pointer;">
// // // //           <div style="position:absolute;inset:0;background:${color};border-radius:50%;border:2px solid #FAF9F5;box-shadow:0 1px 3px rgba(0,0,0,0.3);transition:transform 300ms cubic-bezier(0.32,0.72,0,1);"></div>
// // // //           ${ring ? `<div style="position:absolute;inset:-2px;border-radius:50%;background:${color};opacity:0.4;animation:pin-pulse 2s ease-out infinite;"></div>` : ''}
// // // //         </div>`;
// // // //       const icon = L.divIcon({ html, className: '', iconSize: [14,14], iconAnchor: [7,7] });
// // // //       const m = L.marker([c.latitude, c.longitude], { icon })
// // // //         .addTo(this.map)
// // // //         .bindTooltip(`${c.categoryName} · ${this.statusLabel(c.status)}`, { direction: 'top', offset: [0,-8] });
// // // //       m.on('click', () => this.zone.run(() => this.highlightFromMap(c.id)));
// // // //       this.markers[c.id] = m;
// // // //     });
// // // //   }

// // // //   highlightFromCard(c: Complaint) {
// // // //     this.highlightedId = c.id;
// // // //     const m = this.markers[c.id];
// // // //     if (m && this.map) {
// // // //       this.map.flyTo([c.latitude, c.longitude], Math.max(this.map.getZoom(), 18), { duration: 0.6 });
// // // //       const el = m.getElement();
// // // //       if (el) {
// // // //         const pin = el.querySelector('div > div:first-child') as HTMLElement;
// // // //         if (pin) {
// // // //           pin.style.transform = 'scale(1.7)';
// // // //           pin.style.boxShadow = '0 0 0 6px rgba(123, 149, 118, 0.45)';
// // // //           setTimeout(() => { pin.style.transform = ''; pin.style.boxShadow = ''; }, 2000);
// // // //         }
// // // //       }
// // // //     }
// // // //     setTimeout(() => { if (this.highlightedId === c.id) this.highlightedId = null; }, 2200);
// // // //   }

// // // //   private highlightFromMap(id: number) {
// // // //     this.highlightedId = id;
// // // //     setTimeout(() => {
// // // //       const card = document.querySelector(`[data-card-id="${id}"]`) as HTMLElement;
// // // //       if (card) card.scrollIntoView({ behavior: 'smooth', block: 'center' });
// // // //     }, 50);
// // // //     setTimeout(() => { if (this.highlightedId === id) this.highlightedId = null; }, 2400);
// // // //   }
// // // // }






// // // import { Component, OnInit, OnDestroy, AfterViewInit, ElementRef, ViewChild, NgZone } from '@angular/core';
// // // import { CommonModule } from '@angular/common';
// // // import { Router, RouterModule } from '@angular/router';
// // // import { Subscription } from 'rxjs';
// // // import { AuthService } from '../../core/services/auth.service';
// // // import { ApiService } from '../../core/services/api.service';
// // // import { Complaint, CommunityBranding } from '../../shared/models/models';

// // // declare const L: any;

// // // @Component({
// // //   selector: 'app-dashboard',
// // //   standalone: true,
// // //   imports: [CommonModule, RouterModule],
// // //   templateUrl: './dashboard.component.html',
// // //   styleUrls: ['./dashboard.component.scss']
// // // })
// // // export class DashboardComponent implements OnInit, AfterViewInit, OnDestroy {
// // //   @ViewChild('mapEl') mapEl!: ElementRef<HTMLDivElement>;

// // //   user: any = null;
// // //   role: string | null = null;
// // //   branding: CommunityBranding | null = null;
// // //   themeColor = '#7B9576';

// // //   complaints: Complaint[] = [];
// // //   communityFeed: Complaint[] = [];   // all community complaints shown under staff's task list
// // //   loading = true;
// // //   loadingCommunityFeed = false;

// // //   activeFilter: 'all' | 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' = 'all';
// // //   highlightedId: number | null = null;

// // //   stats = { total: 0, open: 0, inProgress: 0, proofSubmitted: 0, resolved: 0 };
// // //   greeting = '';
// // //   timeOfDay = '';

// // //   private map: any = null;
// // //   private markers: Record<number, any> = {};
// // //   private subs: Subscription[] = [];
// // //   private resizeObserver: ResizeObserver | null = null;
// // //   private pollHandle: any;

// // //   constructor(
// // //     private auth: AuthService,
// // //     private api: ApiService,
// // //     private router: Router,
// // //     private zone: NgZone
// // //   ) {}

// // //   ngOnInit() {
// // //     this.user = this.auth.getCurrentUser();
// // //     this.role = this.user?.role;
// // //     this.branding = this.user?.branding ?? null;
// // //     if (this.branding?.themeColor) this.themeColor = this.branding.themeColor;
// // //     this.computeGreeting();
// // //     this.loadComplaints();
// // //     this.pollHandle = setInterval(() => this.loadComplaints(true), 30000);
// // //   }

// // //   ngAfterViewInit() {
// // //     if (this.isResident() && this.mapEl) {
// // //       this.zone.runOutsideAngular(() => {
// // //         this.resizeObserver = new ResizeObserver(() => {
// // //           if (this.mapEl?.nativeElement?.offsetHeight > 0) {
// // //             this.resizeObserver?.disconnect();
// // //             this.zone.run(() => this.initMap());
// // //           }
// // //         });
// // //         this.resizeObserver.observe(this.mapEl.nativeElement);
// // //         setTimeout(() => {
// // //           if (this.mapEl?.nativeElement?.offsetHeight > 0 && !this.map) {
// // //             this.zone.run(() => this.initMap());
// // //           }
// // //         }, 150);
// // //       });
// // //     }
// // //   }

// // //   ngOnDestroy() {
// // //     if (this.pollHandle) clearInterval(this.pollHandle);
// // //     this.subs.forEach(s => s.unsubscribe());
// // //     this.resizeObserver?.disconnect();
// // //     if (this.map) { try { this.map.remove(); } catch {} }
// // //   }

// // //   isResident(): boolean { return this.role === 'RESIDENT'; }
// // //   isStaff(): boolean { return this.role === 'STAFF'; }
// // //   isAdmin(): boolean { return this.role === 'ADMIN' || this.role === 'CO_ADMIN'; }

// // //   private computeGreeting() {
// // //     const h = new Date().getHours();
// // //     // Use firstName if available, fall back to username
// // //     const name = this.user?.firstName || this.user?.username || '';
// // //     if (h >= 5 && h < 11) this.timeOfDay = 'Good morning';
// // //     else if (h >= 11 && h < 17) this.timeOfDay = 'Good afternoon';
// // //     else if (h >= 17 && h < 21) this.timeOfDay = 'Good evening';
// // //     else this.timeOfDay = 'Working late';
// // //     this.greeting = `${this.timeOfDay}, ${name}`;
// // //   }

// // //   get displayName(): string {
// // //     return this.user?.firstName || this.user?.username || '';
// // //   }

// // //   private loadComplaints(silent = false) {
// // //     if (!silent) this.loading = true;

// // //     if (this.isResident()) {
// // //       // Resident: load community feed (all complaints in community)
// // //       // AND load own complaints separately for accurate stats
// // //       this.api.getCommunityFeed().subscribe({
// // //         next: list => {
// // //           this.complaints = (list ?? []).sort(
// // //             (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
// // //           );
// // //           this.loading = false;
// // //           if (this.map) this.refreshMap();
// // //         },
// // //         error: () => { this.loading = false; }
// // //       });
// // //       // Load own complaints for stats separately
// // //       this.api.getMyComplaints().subscribe({
// // //         next: mine => {
// // //           const t = mine ?? [];
// // //           this.stats.total = t.length;
// // //           this.stats.open = t.filter(c => c.status === 'OPEN' || c.status === 'SUBMITTED' || c.status === 'ASSIGNED').length;
// // //           this.stats.inProgress = t.filter(c => c.status === 'IN_PROGRESS').length;
// // //           this.stats.proofSubmitted = t.filter(c => c.status === 'PROOF_SUBMITTED').length;
// // //           this.stats.resolved = t.filter(c => c.status === 'RESOLVED' || c.status === 'CLOSED').length;
// // //         }
// // //       });
// // //       return;
// // //     }

// // //     let obs;
// // //     if (this.isStaff()) obs = this.api.getAssignedComplaints();
// // //     else obs = this.api.getAllComplaints();

// // //     obs.subscribe({
// // //       next: list => {
// // //         this.complaints = (list ?? []).sort(
// // //           (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
// // //         );
// // //         this.computeStats();
// // //         this.loading = false;
// // //         if (this.map) this.refreshMap();

// // //         // Staff: also load the full community feed separately
// // //         if (this.isStaff() && !silent) {
// // //           this.loadingCommunityFeed = true;
// // //           this.api.getCommunityFeed().subscribe({
// // //             next: all => {
// // //               this.communityFeed = (all ?? []).sort(
// // //                 (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
// // //               );
// // //               this.loadingCommunityFeed = false;
// // //             },
// // //             error: () => { this.loadingCommunityFeed = false; }
// // //           });
// // //         }
// // //       },
// // //       error: () => { this.loading = false; }
// // //     });
// // //   }

// // //   private computeStats() {
// // //     const t = this.complaints;
// // //     this.stats.total = t.length;
// // //     // "Needs assignment" = OPEN or SUBMITTED only (not ASSIGNED — those are already assigned)
// // //     this.stats.open = t.filter(c => c.status === 'OPEN' || c.status === 'SUBMITTED').length;
// // //     // "In progress" = ASSIGNED + IN_PROGRESS
// // //     this.stats.inProgress = t.filter(c => c.status === 'ASSIGNED' || c.status === 'IN_PROGRESS').length;
// // //     // "Awaiting review" = proof submitted
// // //     this.stats.proofSubmitted = t.filter(c => c.status === 'PROOF_SUBMITTED').length;
// // //     // "Resolved" = resolved or closed
// // //     this.stats.resolved = t.filter(c => c.status === 'RESOLVED' || c.status === 'CLOSED').length;
// // //   }

// // //   setFilter(f: typeof this.activeFilter) { this.activeFilter = f; }

// // //   get filteredComplaints(): Complaint[] {
// // //     if (this.activeFilter === 'all') return this.complaints;
// // //     return this.complaints.filter(c => {
// // //       if (this.activeFilter === 'OPEN') return c.status === 'OPEN' || c.status === 'SUBMITTED' || c.status === 'ASSIGNED';
// // //       if (this.activeFilter === 'IN_PROGRESS') return c.status === 'IN_PROGRESS' || c.status === 'PROOF_SUBMITTED';
// // //       if (this.activeFilter === 'RESOLVED') return c.status === 'RESOLVED' || c.status === 'CLOSED';
// // //       return true;
// // //     });
// // //   }

// // //   get filterCounts() {
// // //     return {
// // //       all: this.complaints.length,
// // //       OPEN: this.complaints.filter(c => c.status === 'OPEN' || c.status === 'SUBMITTED').length,
// // //       IN_PROGRESS: this.complaints.filter(c => c.status === 'ASSIGNED' || c.status === 'IN_PROGRESS' || c.status === 'PROOF_SUBMITTED').length,
// // //       RESOLVED: this.complaints.filter(c => c.status === 'RESOLVED' || c.status === 'CLOSED').length,
// // //     };
// // //   }

// // //   /** Staff: complaints waiting for admin review */
// // //   get proofPendingComplaints(): Complaint[] {
// // //     return this.complaints.filter(c => c.status === 'PROOF_SUBMITTED');
// // //   }

// // //   /** Staff: active work = IN_PROGRESS or ASSIGNED */
// // //   get activeWorkComplaints(): Complaint[] {
// // //     return this.complaints.filter(c => c.status === 'IN_PROGRESS' || c.status === 'ASSIGNED');
// // //   }

// // //   complaintNumber(c: Complaint): string {
// // //     return c.communityComplaintNumber ? `#${c.communityComplaintNumber}` : `#${c.id}`;
// // //   }

// // //   statusColor(s: string): string {
// // //     if (s === 'OPEN' || s === 'SUBMITTED') return '#B5564A';
// // //     if (s === 'ASSIGNED' || s === 'IN_PROGRESS') return '#D4A24C';
// // //     if (s === 'PROOF_SUBMITTED') return '#5B86A8';
// // //     return '#7B9576';
// // //   }

// // //   statusLabel(s: string): string {
// // //     const map: Record<string,string> = {
// // //       SUBMITTED: 'New', OPEN: 'Open', ASSIGNED: 'Assigned',
// // //       IN_PROGRESS: 'In progress', PROOF_SUBMITTED: 'Awaiting review',
// // //       RESOLVED: 'Resolved', CLOSED: 'Closed'
// // //     };
// // //     return map[s] || s;
// // //   }

// // //   hasPhoto(c: Complaint): boolean {
// // //     const b64 = c.mediaBase64List?.[0] ?? c.thumbnailBase64 ?? '';
// // //     if (!b64) return false;
// // //     // Only exclude if it exactly matches community branding logo
// // //     const brandingLogo = this.branding?.logoBase64 ?? '';
// // //     if (brandingLogo && b64.substring(0, 50) === brandingLogo.substring(0, 50)) return false;
// // //     return true;
// // //   }
// // //   photoSrc(c: Complaint): string {
// // //     const b64 = c.mediaBase64List?.[0] ?? c.thumbnailBase64 ?? '';
// // //     if (!b64) return '';
// // //     if (b64.startsWith('/9j/')) return 'data:image/jpeg;base64,' + b64;
// // //     if (b64.startsWith('iVBOR')) return 'data:image/png;base64,' + b64;
// // //     return 'data:image/jpeg;base64,' + b64;
// // //   }

// // //   timeAgo(iso: string): string {
// // //     if (!iso) return '';
// // //     const ms = Date.now() - new Date(iso).getTime();
// // //     const m = Math.floor(ms / 60000);
// // //     if (m < 1) return 'just now';
// // //     if (m < 60) return `${m}m ago`;
// // //     const h = Math.floor(m / 60);
// // //     if (h < 24) return `${h}h ago`;
// // //     const d = Math.floor(h / 24);
// // //     if (d < 7) return `${d}d ago`;
// // //     return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
// // //   }

// // //   openComplaint(c: Complaint) {
// // //     this.router.navigate(['/complaints'], { queryParams: { id: c.id } });
// // //   }

// // //   // ─── Map ──────────────────────────────────────────────────────────────────
// // //   private initMap() {
// // //     if (this.map || !this.mapEl || typeof L === 'undefined') return;
// // //     const lat = this.branding?.mapCenterLat ?? 11.0168;
// // //     const lng = this.branding?.mapCenterLng ?? 76.9558;
// // //     const zoom = this.branding?.mapZoom ?? 16;

// // //     this.map = L.map(this.mapEl.nativeElement, { zoomControl: true, attributionControl: false })
// // //       .setView([lat, lng], zoom);
// // //     L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(this.map);

// // //     const style = document.createElement('style');
// // //     style.textContent = `@keyframes pin-pulse { 0% { transform: scale(1); opacity: 0.6; } 100% { transform: scale(3.5); opacity: 0; } }`;
// // //     document.head.appendChild(style);

// // //     setTimeout(() => { if (this.map) this.map.invalidateSize(); }, 200);
// // //     this.refreshMap();
// // //   }

// // //   private refreshMap() {
// // //     if (!this.map) return;
// // //     Object.values(this.markers).forEach(m => { try { this.map.removeLayer(m); } catch {} });
// // //     this.markers = {};

// // //     this.complaints.forEach(c => {
// // //       if (c.latitude == null || c.longitude == null) return;
// // //       const color = this.statusColor(c.status);
// // //       const ring = c.status !== 'RESOLVED' && c.status !== 'CLOSED';
// // //       const html = `
// // //         <div style="position:relative;width:14px;height:14px;cursor:pointer;">
// // //           <div style="position:absolute;inset:0;background:${color};border-radius:50%;border:2px solid #FAF9F5;box-shadow:0 1px 3px rgba(0,0,0,0.3);transition:transform 300ms cubic-bezier(0.32,0.72,0,1);"></div>
// // //           ${ring ? `<div style="position:absolute;inset:-2px;border-radius:50%;background:${color};opacity:0.4;animation:pin-pulse 2s ease-out infinite;"></div>` : ''}
// // //         </div>`;
// // //       const icon = L.divIcon({ html, className: '', iconSize: [14,14], iconAnchor: [7,7] });
// // //       const m = L.marker([c.latitude, c.longitude], { icon })
// // //         .addTo(this.map)
// // //         .bindTooltip(`${c.categoryName} · ${this.statusLabel(c.status)}`, { direction: 'top', offset: [0,-8] });
// // //       m.on('click', () => this.zone.run(() => this.highlightFromMap(c.id)));
// // //       this.markers[c.id] = m;
// // //     });
// // //   }

// // //   highlightFromCard(c: Complaint) {
// // //     this.highlightedId = c.id;
// // //     const m = this.markers[c.id];
// // //     if (m && this.map) {
// // //       this.map.flyTo([c.latitude, c.longitude], Math.max(this.map.getZoom(), 18), { duration: 0.6 });
// // //       const el = m.getElement();
// // //       if (el) {
// // //         const pin = el.querySelector('div > div:first-child') as HTMLElement;
// // //         if (pin) {
// // //           pin.style.transform = 'scale(1.7)';
// // //           pin.style.boxShadow = '0 0 0 6px rgba(123, 149, 118, 0.45)';
// // //           setTimeout(() => { pin.style.transform = ''; pin.style.boxShadow = ''; }, 2000);
// // //         }
// // //       }
// // //     }
// // //     setTimeout(() => { if (this.highlightedId === c.id) this.highlightedId = null; }, 2200);
// // //   }

// // //   private highlightFromMap(id: number) {
// // //     this.highlightedId = id;
// // //     setTimeout(() => {
// // //       const card = document.querySelector(`[data-card-id="${id}"]`) as HTMLElement;
// // //       if (card) card.scrollIntoView({ behavior: 'smooth', block: 'center' });
// // //     }, 50);
// // //     setTimeout(() => { if (this.highlightedId === id) this.highlightedId = null; }, 2400);
// // //   }
// // // }


// // import { Component, OnInit, OnDestroy, AfterViewInit, ElementRef, ViewChild, NgZone } from '@angular/core';
// // import { CommonModule } from '@angular/common';
// // import { Router, RouterModule } from '@angular/router';
// // import { Subscription } from 'rxjs';
// // import { AuthService } from '../../core/services/auth.service';
// // import { ApiService } from '../../core/services/api.service';
// // import { Complaint, CommunityBranding } from '../../shared/models/models';

// // declare const L: any;

// // @Component({
// //   selector: 'app-dashboard',
// //   standalone: true,
// //   imports: [CommonModule, RouterModule],
// //   templateUrl: './dashboard.component.html',
// //   styleUrls: ['./dashboard.component.scss']
// // })
// // export class DashboardComponent implements OnInit, AfterViewInit, OnDestroy {
// //   @ViewChild('mapEl') mapEl!: ElementRef<HTMLDivElement>;

// //   user: any = null;
// //   role: string | null = null;
// //   branding: CommunityBranding | null = null;
// //   themeColor = '#7B9576';

// //   complaints: Complaint[] = [];
// //   communityFeed: Complaint[] = [];   // all community complaints shown under staff's task list
// //   loading = true;
// //   loadingCommunityFeed = false;

// //   activeFilter: 'all' | 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' = 'all';
// //   highlightedId: number | null = null;

// //   stats = { total: 0, open: 0, inProgress: 0, proofSubmitted: 0, resolved: 0 };
// //   greeting = '';
// //   timeOfDay = '';

// //   private map: any = null;
// //   private markers: Record<number, any> = {};
// //   private subs: Subscription[] = [];
// //   private resizeObserver: ResizeObserver | null = null;
// //   private pollHandle: any;

// //   constructor(
// //     private auth: AuthService,
// //     private api: ApiService,
// //     private router: Router,
// //     private zone: NgZone
// //   ) {}

// //   ngOnInit() {
// //     this.user = this.auth.getCurrentUser();
// //     this.role = this.user?.role;
// //     this.branding = this.user?.branding ?? null;
// //     if (this.branding?.themeColor) this.themeColor = this.branding.themeColor;
// //     this.computeGreeting();
// //     this.loadComplaints();
// //     this.pollHandle = setInterval(() => this.loadComplaints(true), 30000);
// //   }

// //   ngAfterViewInit() {
// //     if (this.isResident() && this.mapEl) {
// //       this.zone.runOutsideAngular(() => {
// //         this.resizeObserver = new ResizeObserver(() => {
// //           if (this.mapEl?.nativeElement?.offsetHeight > 0) {
// //             this.resizeObserver?.disconnect();
// //             this.zone.run(() => this.initMap());
// //           }
// //         });
// //         this.resizeObserver.observe(this.mapEl.nativeElement);
// //         setTimeout(() => {
// //           if (this.mapEl?.nativeElement?.offsetHeight > 0 && !this.map) {
// //             this.zone.run(() => this.initMap());
// //           }
// //         }, 150);
// //       });
// //     }
// //   }

// //   ngOnDestroy() {
// //     if (this.pollHandle) clearInterval(this.pollHandle);
// //     this.subs.forEach(s => s.unsubscribe());
// //     this.resizeObserver?.disconnect();
// //     if (this.map) { try { this.map.remove(); } catch {} }
// //   }

// //   isResident(): boolean { return this.role === 'RESIDENT'; }
// //   isStaff(): boolean { return this.role === 'STAFF'; }
// //   isAdmin(): boolean { return this.role === 'ADMIN' || this.role === 'CO_ADMIN'; }

// //   private computeGreeting() {
// //     const h = new Date().getHours();
// //     // Use firstName if available, fall back to username
// //     const name = this.user?.firstName || this.user?.username || '';
// //     if (h >= 5 && h < 11) this.timeOfDay = 'Good morning';
// //     else if (h >= 11 && h < 17) this.timeOfDay = 'Good afternoon';
// //     else if (h >= 17 && h < 21) this.timeOfDay = 'Good evening';
// //     else this.timeOfDay = 'Working late';
// //     this.greeting = `${this.timeOfDay}, ${name}`;
// //   }

// //   get displayName(): string {
// //     return this.user?.firstName || this.user?.username || '';
// //   }

// //   private loadComplaints(silent = false) {
// //     if (!silent) this.loading = true;

// //     if (this.isResident()) {
// //       // Resident: load community feed (all complaints in community)
// //       // AND load own complaints separately for accurate stats
// //       this.api.getCommunityFeed().subscribe({
// //         next: list => {
// //           this.complaints = (list ?? []).sort(
// //             (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
// //           );
// //           this.loading = false;
// //           if (this.map) this.refreshMap();
// //         },
// //         error: () => { this.loading = false; }
// //       });
// //       // Load own complaints for stats separately
// //       this.api.getMyComplaints().subscribe({
// //         next: mine => {
// //           const t = mine ?? [];
// //           this.stats.total = t.length;
// //           this.stats.open = t.filter(c => c.status === 'OPEN' || c.status === 'SUBMITTED').length;
// //           this.stats.inProgress = t.filter(c => c.status === 'ASSIGNED' || c.status === 'IN_PROGRESS' || c.status === 'PROOF_SUBMITTED').length;
// //           this.stats.proofSubmitted = t.filter(c => c.status === 'PROOF_SUBMITTED').length;
// //           this.stats.resolved = t.filter(c => c.status === 'RESOLVED' || c.status === 'CLOSED').length;
// //         }
// //       });
// //       return;
// //     }

// //     let obs;
// //     if (this.isStaff()) obs = this.api.getAssignedComplaints();
// //     else obs = this.api.getAllComplaints();

// //     obs.subscribe({
// //       next: list => {
// //         this.complaints = (list ?? []).sort(
// //           (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
// //         );
// //         this.computeStats();
// //         this.loading = false;
// //         if (this.map) this.refreshMap();

// //         // Staff: also load the full community feed separately
// //         if (this.isStaff() && !silent) {
// //           this.loadingCommunityFeed = true;
// //           this.api.getCommunityFeed().subscribe({
// //             next: all => {
// //               this.communityFeed = (all ?? []).sort(
// //                 (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
// //               );
// //               this.loadingCommunityFeed = false;
// //             },
// //             error: () => { this.loadingCommunityFeed = false; }
// //           });
// //         }
// //       },
// //       error: () => { this.loading = false; }
// //     });
// //   }

// //   private computeStats() {
// //     const t = this.complaints;
// //     this.stats.total = t.length;
// //     // "Needs assignment" = OPEN or SUBMITTED only (not ASSIGNED — those are already assigned)
// //     this.stats.open = t.filter(c => c.status === 'OPEN' || c.status === 'SUBMITTED').length;
// //     // "In progress" = ASSIGNED + IN_PROGRESS
// //     this.stats.inProgress = t.filter(c => c.status === 'ASSIGNED' || c.status === 'IN_PROGRESS').length;
// //     // "Awaiting review" = proof submitted
// //     this.stats.proofSubmitted = t.filter(c => c.status === 'PROOF_SUBMITTED').length;
// //     // "Resolved" = resolved or closed
// //     this.stats.resolved = t.filter(c => c.status === 'RESOLVED' || c.status === 'CLOSED').length;
// //   }

// //   setFilter(f: typeof this.activeFilter) { this.activeFilter = f; }

// //   get filteredComplaints(): Complaint[] {
// //     if (this.activeFilter === 'all') return this.complaints;
// //     return this.complaints.filter(c => {
// //       // OPEN filter = needs attention (not yet being worked on)
// //       if (this.activeFilter === 'OPEN')
// //         return c.status === 'OPEN' || c.status === 'SUBMITTED';
// //       // IN_PROGRESS filter = being worked on (assigned, in progress, proof submitted)
// //       if (this.activeFilter === 'IN_PROGRESS')
// //         return c.status === 'ASSIGNED' || c.status === 'IN_PROGRESS' || c.status === 'PROOF_SUBMITTED';
// //       // RESOLVED filter = done
// //       if (this.activeFilter === 'RESOLVED')
// //         return c.status === 'RESOLVED' || c.status === 'CLOSED';
// //       return true;
// //     });
// //   }

// //   get filterCounts() {
// //     return {
// //       all: this.complaints.length,
// //       OPEN: this.complaints.filter(c => c.status === 'OPEN' || c.status === 'SUBMITTED').length,
// //       IN_PROGRESS: this.complaints.filter(c => c.status === 'ASSIGNED' || c.status === 'IN_PROGRESS' || c.status === 'PROOF_SUBMITTED').length,
// //       RESOLVED: this.complaints.filter(c => c.status === 'RESOLVED' || c.status === 'CLOSED').length,
// //     };
// //   }

// //   /** Staff: complaints waiting for admin review */
// //   get proofPendingComplaints(): Complaint[] {
// //     return this.complaints.filter(c => c.status === 'PROOF_SUBMITTED');
// //   }

// //   /** Staff: active work = IN_PROGRESS or ASSIGNED */
// //   get activeWorkComplaints(): Complaint[] {
// //     return this.complaints.filter(c => c.status === 'IN_PROGRESS' || c.status === 'ASSIGNED');
// //   }

// //   complaintNumber(c: Complaint): string {
// //     return c.communityComplaintNumber ? `#${c.communityComplaintNumber}` : `#${c.id}`;
// //   }

// //   statusColor(s: string): string {
// //     if (s === 'OPEN' || s === 'SUBMITTED') return '#B5564A';
// //     if (s === 'ASSIGNED' || s === 'IN_PROGRESS') return '#D4A24C';
// //     if (s === 'PROOF_SUBMITTED') return '#5B86A8';
// //     return '#7B9576';
// //   }

// //   statusLabel(s: string): string {
// //     const map: Record<string,string> = {
// //       SUBMITTED: 'New', OPEN: 'Open', ASSIGNED: 'Assigned',
// //       IN_PROGRESS: 'In progress', PROOF_SUBMITTED: 'Awaiting review',
// //       RESOLVED: 'Resolved', CLOSED: 'Closed'
// //     };
// //     return map[s] || s;
// //   }

// //   hasPhoto(c: Complaint): boolean {
// //     const b64 = c.mediaBase64List?.[0] ?? c.thumbnailBase64 ?? '';
// //     if (!b64) return false;
// //     // Only exclude if it exactly matches community branding logo
// //     const brandingLogo = this.branding?.logoBase64 ?? '';
// //     if (brandingLogo && b64.substring(0, 50) === brandingLogo.substring(0, 50)) return false;
// //     return true;
// //   }
// //   photoSrc(c: Complaint): string {
// //     const b64 = c.mediaBase64List?.[0] ?? c.thumbnailBase64 ?? '';
// //     if (!b64) return '';
// //     if (b64.startsWith('/9j/')) return 'data:image/jpeg;base64,' + b64;
// //     if (b64.startsWith('iVBOR')) return 'data:image/png;base64,' + b64;
// //     return 'data:image/jpeg;base64,' + b64;
// //   }

// //   timeAgo(iso: string): string {
// //     if (!iso) return '';
// //     const ms = Date.now() - new Date(iso).getTime();
// //     const m = Math.floor(ms / 60000);
// //     if (m < 1) return 'just now';
// //     if (m < 60) return `${m}m ago`;
// //     const h = Math.floor(m / 60);
// //     if (h < 24) return `${h}h ago`;
// //     const d = Math.floor(h / 24);
// //     if (d < 7) return `${d}d ago`;
// //     return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
// //   }

// //   openComplaint(c: Complaint) {
// //     this.router.navigate(['/complaints'], { queryParams: { id: c.id } });
// //   }

// //   // ─── Map ──────────────────────────────────────────────────────────────────
// //   private initMap() {
// //     if (this.map || !this.mapEl || typeof L === 'undefined') return;
// //     const lat = this.branding?.mapCenterLat ?? 11.0168;
// //     const lng = this.branding?.mapCenterLng ?? 76.9558;
// //     const zoom = this.branding?.mapZoom ?? 16;

// //     this.map = L.map(this.mapEl.nativeElement, { zoomControl: true, attributionControl: false })
// //       .setView([lat, lng], zoom);
// //     L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(this.map);

// //     const style = document.createElement('style');
// //     style.textContent = `@keyframes pin-pulse { 0% { transform: scale(1); opacity: 0.6; } 100% { transform: scale(3.5); opacity: 0; } }`;
// //     document.head.appendChild(style);

// //     setTimeout(() => { if (this.map) this.map.invalidateSize(); }, 200);
// //     this.refreshMap();
// //   }

// //   private refreshMap() {
// //     if (!this.map) return;
// //     Object.values(this.markers).forEach(m => { try { this.map.removeLayer(m); } catch {} });
// //     this.markers = {};

// //     this.complaints.forEach(c => {
// //       if (c.latitude == null || c.longitude == null) return;
// //       const color = this.statusColor(c.status);
// //       const ring = c.status !== 'RESOLVED' && c.status !== 'CLOSED';
// //       const html = `
// //         <div style="position:relative;width:14px;height:14px;cursor:pointer;">
// //           <div style="position:absolute;inset:0;background:${color};border-radius:50%;border:2px solid #FAF9F5;box-shadow:0 1px 3px rgba(0,0,0,0.3);transition:transform 300ms cubic-bezier(0.32,0.72,0,1);"></div>
// //           ${ring ? `<div style="position:absolute;inset:-2px;border-radius:50%;background:${color};opacity:0.4;animation:pin-pulse 2s ease-out infinite;"></div>` : ''}
// //         </div>`;
// //       const icon = L.divIcon({ html, className: '', iconSize: [14,14], iconAnchor: [7,7] });
// //       const m = L.marker([c.latitude, c.longitude], { icon })
// //         .addTo(this.map)
// //         .bindTooltip(`${c.categoryName} · ${this.statusLabel(c.status)}`, { direction: 'top', offset: [0,-8] });
// //       m.on('click', () => this.zone.run(() => this.highlightFromMap(c.id)));
// //       this.markers[c.id] = m;
// //     });
// //   }

// //   highlightFromCard(c: Complaint) {
// //     this.highlightedId = c.id;
// //     const m = this.markers[c.id];
// //     if (m && this.map) {
// //       this.map.flyTo([c.latitude, c.longitude], Math.max(this.map.getZoom(), 18), { duration: 0.6 });
// //       const el = m.getElement();
// //       if (el) {
// //         const pin = el.querySelector('div > div:first-child') as HTMLElement;
// //         if (pin) {
// //           pin.style.transform = 'scale(1.7)';
// //           pin.style.boxShadow = '0 0 0 6px rgba(123, 149, 118, 0.45)';
// //           setTimeout(() => { pin.style.transform = ''; pin.style.boxShadow = ''; }, 2000);
// //         }
// //       }
// //     }
// //     setTimeout(() => { if (this.highlightedId === c.id) this.highlightedId = null; }, 2200);
// //   }

// //   private highlightFromMap(id: number) {
// //     this.highlightedId = id;
// //     setTimeout(() => {
// //       const card = document.querySelector(`[data-card-id="${id}"]`) as HTMLElement;
// //       if (card) card.scrollIntoView({ behavior: 'smooth', block: 'center' });
// //     }, 50);
// //     setTimeout(() => { if (this.highlightedId === id) this.highlightedId = null; }, 2400);
// //   }
// // }


// import { Component, OnInit, OnDestroy, AfterViewInit, ElementRef, ViewChild, NgZone } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { Router, RouterModule } from '@angular/router';
// import { Subscription } from 'rxjs';
// import { AuthService } from '../../core/services/auth.service';
// import { ApiService } from '../../core/services/api.service';
// import { Complaint, CommunityBranding } from '../../shared/models/models';

// declare const L: any;

// @Component({
//   selector: 'app-dashboard',
//   standalone: true,
//   imports: [CommonModule, RouterModule],
//   templateUrl: './dashboard.component.html',
//   styleUrls: ['./dashboard.component.scss']
// })
// export class DashboardComponent implements OnInit, AfterViewInit, OnDestroy {
//   @ViewChild('mapEl') mapEl!: ElementRef<HTMLDivElement>;

//   user: any = null;
//   role: string | null = null;
//   branding: CommunityBranding | null = null;
//   themeColor = '#7B9576';

//   complaints: Complaint[] = [];
//   communityFeed: Complaint[] = [];   // all community complaints shown under staff's task list
//   loading = true;
//   loadingCommunityFeed = false;

//   activeFilter: 'all' | 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' = 'all';
//   highlightedId: number | null = null;

//   stats = { total: 0, open: 0, inProgress: 0, proofSubmitted: 0, resolved: 0 };
//   greeting = '';
//   timeOfDay = '';

//   private map: any = null;
//   private markers: Record<number, any> = {};
//   private subs: Subscription[] = [];
//   private resizeObserver: ResizeObserver | null = null;
//   private pollHandle: any;

//   constructor(
//     private auth: AuthService,
//     private api: ApiService,
//     private router: Router,
//     private zone: NgZone
//   ) {}

//   ngOnInit() {
//     this.user = this.auth.getCurrentUser();
//     this.role = this.user?.role;
//     this.branding = this.user?.branding ?? null;
//     if (this.branding?.themeColor) this.themeColor = this.branding.themeColor;
//     this.computeGreeting();
//     this.loadComplaints();
//     this.pollHandle = setInterval(() => this.loadComplaints(true), 30000);
//   }

//   ngAfterViewInit() {
//     if (this.isResident() && this.mapEl) {
//       this.zone.runOutsideAngular(() => {
//         this.resizeObserver = new ResizeObserver(() => {
//           if (this.mapEl?.nativeElement?.offsetHeight > 0) {
//             this.resizeObserver?.disconnect();
//             this.zone.run(() => this.initMap());
//           }
//         });
//         this.resizeObserver.observe(this.mapEl.nativeElement);
//         setTimeout(() => {
//           if (this.mapEl?.nativeElement?.offsetHeight > 0 && !this.map) {
//             this.zone.run(() => this.initMap());
//           }
//         }, 150);
//       });
//     }
//   }

//   ngOnDestroy() {
//     if (this.pollHandle) clearInterval(this.pollHandle);
//     this.subs.forEach(s => s.unsubscribe());
//     this.resizeObserver?.disconnect();
//     if (this.map) { try { this.map.remove(); } catch {} }
//   }

//   isResident(): boolean { return this.role === 'RESIDENT'; }
//   isStaff(): boolean { return this.role === 'STAFF'; }
//   isAdmin(): boolean { return this.role === 'ADMIN' || this.role === 'CO_ADMIN'; }

//   get currentUsername(): string { return this.user?.username ?? ''; }

//   isRework(c: Complaint): boolean {
//     if (!c || c.status !== 'ASSIGNED') return false;
//     return !!(c.assignedToUsername === this.currentUsername &&
//       c.proofs?.some((p: any) => p.submittedByUsername === this.currentUsername && p.status === 'REJECTED'));
//   }

//   isReassignedAway(c: Complaint): boolean {
//     if (!c || c.assignedToUsername === this.currentUsername) return false;
//     return !!(c.proofs?.some((p: any) => p.submittedByUsername === this.currentUsername && p.status === 'REJECTED'));
//   }

//   getRejectionReason(c: Complaint): string {
//     const p = c.proofs?.find((p: any) => p.submittedByUsername === this.currentUsername && p.status === 'REJECTED');
//     return (p as any)?.rejectionReason ?? '';
//   }

//   private computeGreeting() {
//     const h = new Date().getHours();
//     // Use firstName if available, fall back to username
//     const name = this.user?.firstName || this.user?.username || '';
//     if (h >= 5 && h < 11) this.timeOfDay = 'Good morning';
//     else if (h >= 11 && h < 17) this.timeOfDay = 'Good afternoon';
//     else if (h >= 17 && h < 21) this.timeOfDay = 'Good evening';
//     else this.timeOfDay = 'Working late';
//     this.greeting = `${this.timeOfDay}, ${name}`;
//   }

//   get displayName(): string {
//     return this.user?.firstName || this.user?.username || '';
//   }

//   private loadComplaints(silent = false) {
//     if (!silent) this.loading = true;

//     if (this.isResident()) {
//       // Resident: load community feed (all complaints in community)
//       // AND load own complaints separately for accurate stats
//       this.api.getCommunityFeed().subscribe({
//         next: list => {
//           this.complaints = (list ?? []).sort(
//             (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
//           );
//           this.loading = false;
//           if (this.map) this.refreshMap();
//         },
//         error: () => { this.loading = false; }
//       });
//       // Load own complaints for stats separately
//       this.api.getMyComplaints().subscribe({
//         next: mine => {
//           const t = mine ?? [];
//           this.stats.total = t.length;
//           this.stats.open = t.filter(c => c.status === 'OPEN' || c.status === 'SUBMITTED').length;
//           this.stats.inProgress = t.filter(c => c.status === 'ASSIGNED' || c.status === 'IN_PROGRESS' || c.status === 'PROOF_SUBMITTED').length;
//           this.stats.proofSubmitted = t.filter(c => c.status === 'PROOF_SUBMITTED').length;
//           this.stats.resolved = t.filter(c => c.status === 'RESOLVED' || c.status === 'CLOSED').length;
//         }
//       });
//       return;
//     }

//     let obs;
//     if (this.isStaff()) obs = this.api.getMyWorkHistory();
//     else obs = this.api.getAllComplaints();

//     obs.subscribe({
//       next: list => {
//         this.complaints = (list ?? []).sort(
//           (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
//         );
//         this.computeStats();
//         this.loading = false;
//         if (this.map) this.refreshMap();

//         // Staff: also load the full community feed separately
//         if (this.isStaff() && !silent) {
//           this.loadingCommunityFeed = true;
//           this.api.getCommunityFeed().subscribe({
//             next: all => {
//               this.communityFeed = (all ?? []).sort(
//                 (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
//               );
//               this.loadingCommunityFeed = false;
//             },
//             error: () => { this.loadingCommunityFeed = false; }
//           });
//         }
//       },
//       error: () => { this.loading = false; }
//     });
//   }

//   private computeStats() {
//     const t = this.complaints;
//     this.stats.total = t.length;
//     // "Needs assignment" = OPEN or SUBMITTED only (not ASSIGNED — those are already assigned)
//     this.stats.open = t.filter(c => c.status === 'OPEN' || c.status === 'SUBMITTED').length;
//     // "In progress" = ASSIGNED + IN_PROGRESS
//     this.stats.inProgress = t.filter(c => c.status === 'ASSIGNED' || c.status === 'IN_PROGRESS').length;
//     // "Awaiting review" = proof submitted
//     this.stats.proofSubmitted = t.filter(c => c.status === 'PROOF_SUBMITTED').length;
//     // "Resolved" = resolved or closed
//     this.stats.resolved = t.filter(c => c.status === 'RESOLVED' || c.status === 'CLOSED').length;
//   }

//   setFilter(f: typeof this.activeFilter) { this.activeFilter = f; }

//   get filteredComplaints(): Complaint[] {
//     if (this.activeFilter === 'all') return this.complaints;
//     return this.complaints.filter(c => {
//       // OPEN filter = needs attention (not yet being worked on)
//       if (this.activeFilter === 'OPEN')
//         return c.status === 'OPEN' || c.status === 'SUBMITTED';
//       // IN_PROGRESS filter = being worked on (assigned, in progress, proof submitted)
//       if (this.activeFilter === 'IN_PROGRESS')
//         return c.status === 'ASSIGNED' || c.status === 'IN_PROGRESS' || c.status === 'PROOF_SUBMITTED';
//       // RESOLVED filter = done
//       if (this.activeFilter === 'RESOLVED')
//         return c.status === 'RESOLVED' || c.status === 'CLOSED';
//       return true;
//     });
//   }

//   get filterCounts() {
//     return {
//       all: this.complaints.length,
//       OPEN: this.complaints.filter(c => c.status === 'OPEN' || c.status === 'SUBMITTED').length,
//       IN_PROGRESS: this.complaints.filter(c => c.status === 'ASSIGNED' || c.status === 'IN_PROGRESS' || c.status === 'PROOF_SUBMITTED').length,
//       RESOLVED: this.complaints.filter(c => c.status === 'RESOLVED' || c.status === 'CLOSED').length,
//     };
//   }

//   /** Staff: complaints waiting for admin review */
//   get proofPendingComplaints(): Complaint[] {
//     return this.complaints.filter(c => c.status === 'PROOF_SUBMITTED');
//   }

//   /** Staff: rework needed — proof rejected, reassigned back to this staff */
//   get reworkComplaints(): Complaint[] {
//     return this.complaints.filter(c => this.isRework(c));
//   }

//   /** Staff: fresh assigned (no rejected proof from this staff) or in progress */
//   get activeWorkComplaints(): Complaint[] {
//     return this.complaints.filter(c =>
//       (c.status === 'IN_PROGRESS') ||
//       (c.status === 'ASSIGNED' && !this.isRework(c) && c.assignedToUsername === this.currentUsername)
//     );
//   }

//   /** Staff: proof was rejected and task given to someone else — history view */
//   get reassignedAwayComplaints(): Complaint[] {
//     return this.complaints.filter(c => this.isReassignedAway(c));
//   }

//   complaintNumber(c: Complaint): string {
//     return c.communityComplaintNumber ? `#${c.communityComplaintNumber}` : `#${c.id}`;
//   }

//   statusColor(s: string): string {
//     if (s === 'OPEN' || s === 'SUBMITTED') return '#B5564A';
//     if (s === 'ASSIGNED' || s === 'IN_PROGRESS') return '#D4A24C';
//     if (s === 'PROOF_SUBMITTED') return '#5B86A8';
//     return '#7B9576';
//   }

//   statusLabel(s: string): string {
//     const map: Record<string,string> = {
//       SUBMITTED: 'New', OPEN: 'Open', ASSIGNED: 'Assigned',
//       IN_PROGRESS: 'In progress', PROOF_SUBMITTED: 'Awaiting review',
//       RESOLVED: 'Resolved', CLOSED: 'Closed'
//     };
//     return map[s] || s;
//   }

//   hasPhoto(c: Complaint): boolean {
//     const b64 = c.mediaBase64List?.[0] ?? c.thumbnailBase64 ?? '';
//     if (!b64) return false;
//     // Only exclude if it exactly matches community branding logo
//     const brandingLogo = this.branding?.logoBase64 ?? '';
//     if (brandingLogo && b64.substring(0, 50) === brandingLogo.substring(0, 50)) return false;
//     return true;
//   }
//   photoSrc(c: Complaint): string {
//     const b64 = c.mediaBase64List?.[0] ?? c.thumbnailBase64 ?? '';
//     if (!b64) return '';
//     if (b64.startsWith('/9j/')) return 'data:image/jpeg;base64,' + b64;
//     if (b64.startsWith('iVBOR')) return 'data:image/png;base64,' + b64;
//     return 'data:image/jpeg;base64,' + b64;
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
//     return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
//   }

//   openComplaint(c: Complaint) {
//     this.router.navigate(['/complaints'], { queryParams: { id: c.id } });
//   }

//   // ─── Map ──────────────────────────────────────────────────────────────────
//   private initMap() {
//     if (this.map || !this.mapEl || typeof L === 'undefined') return;
//     const lat = this.branding?.mapCenterLat ?? 11.0168;
//     const lng = this.branding?.mapCenterLng ?? 76.9558;
//     const zoom = this.branding?.mapZoom ?? 16;

//     this.map = L.map(this.mapEl.nativeElement, { zoomControl: true, attributionControl: false })
//       .setView([lat, lng], zoom);
//     L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(this.map);

//     const style = document.createElement('style');
//     style.textContent = `@keyframes pin-pulse { 0% { transform: scale(1); opacity: 0.6; } 100% { transform: scale(3.5); opacity: 0; } }`;
//     document.head.appendChild(style);

//     setTimeout(() => { if (this.map) this.map.invalidateSize(); }, 200);
//     this.refreshMap();
//   }

//   private refreshMap() {
//     if (!this.map) return;
//     Object.values(this.markers).forEach(m => { try { this.map.removeLayer(m); } catch {} });
//     this.markers = {};

//     this.complaints.forEach(c => {
//       if (c.latitude == null || c.longitude == null) return;
//       const color = this.statusColor(c.status);
//       const ring = c.status !== 'RESOLVED' && c.status !== 'CLOSED';
//       const html = `
//         <div style="position:relative;width:14px;height:14px;cursor:pointer;">
//           <div style="position:absolute;inset:0;background:${color};border-radius:50%;border:2px solid #FAF9F5;box-shadow:0 1px 3px rgba(0,0,0,0.3);transition:transform 300ms cubic-bezier(0.32,0.72,0,1);"></div>
//           ${ring ? `<div style="position:absolute;inset:-2px;border-radius:50%;background:${color};opacity:0.4;animation:pin-pulse 2s ease-out infinite;"></div>` : ''}
//         </div>`;
//       const icon = L.divIcon({ html, className: '', iconSize: [14,14], iconAnchor: [7,7] });
//       const m = L.marker([c.latitude, c.longitude], { icon })
//         .addTo(this.map)
//         .bindTooltip(`${c.categoryName} · ${this.statusLabel(c.status)}`, { direction: 'top', offset: [0,-8] });
//       m.on('click', () => this.zone.run(() => this.highlightFromMap(c.id)));
//       this.markers[c.id] = m;
//     });
//   }

//   highlightFromCard(c: Complaint) {
//     this.highlightedId = c.id;
//     const m = this.markers[c.id];
//     if (m && this.map) {
//       this.map.flyTo([c.latitude, c.longitude], Math.max(this.map.getZoom(), 18), { duration: 0.6 });
//       const el = m.getElement();
//       if (el) {
//         const pin = el.querySelector('div > div:first-child') as HTMLElement;
//         if (pin) {
//           pin.style.transform = 'scale(1.7)';
//           pin.style.boxShadow = '0 0 0 6px rgba(123, 149, 118, 0.45)';
//           setTimeout(() => { pin.style.transform = ''; pin.style.boxShadow = ''; }, 2000);
//         }
//       }
//     }
//     setTimeout(() => { if (this.highlightedId === c.id) this.highlightedId = null; }, 2200);
//   }

//   private highlightFromMap(id: number) {
//     this.highlightedId = id;
//     setTimeout(() => {
//       const card = document.querySelector(`[data-card-id="${id}"]`) as HTMLElement;
//       if (card) card.scrollIntoView({ behavior: 'smooth', block: 'center' });
//     }, 50);
//     setTimeout(() => { if (this.highlightedId === id) this.highlightedId = null; }, 2400);
//   }
// }


import { Component, OnInit, OnDestroy, AfterViewInit, ElementRef, ViewChild, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { ApiService } from '../../core/services/api.service';
import { Complaint, CommunityBranding } from '../../shared/models/models';

declare const L: any;

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('mapEl') mapEl!: ElementRef<HTMLDivElement>;

  user: any = null;
  role: string | null = null;
  branding: CommunityBranding | null = null;
  themeColor = '#7B9576';

  complaints: Complaint[] = [];
  communityFeed: Complaint[] = [];   // all community complaints shown under staff's task list
  loading = true;
  loadingCommunityFeed = false;

  activeFilter: 'all' | 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' = 'all';
  highlightedId: number | null = null;

  stats = { total: 0, open: 0, inProgress: 0, proofSubmitted: 0, resolved: 0 };
  greeting = '';
  timeOfDay = '';

  private map: any = null;
  private markers: Record<number, any> = {};
  private subs: Subscription[] = [];
  private resizeObserver: ResizeObserver | null = null;
  private pollHandle: any;

  constructor(
    private auth: AuthService,
    private api: ApiService,
    private router: Router,
    private zone: NgZone
  ) {}

  ngOnInit() {
    this.user = this.auth.getCurrentUser();
    this.role = this.user?.role;
    this.branding = this.user?.branding ?? null;
    if (this.branding?.themeColor) this.themeColor = this.branding.themeColor;
    this.computeGreeting();
    this.loadComplaints();
    this.pollHandle = setInterval(() => this.loadComplaints(true), 30000);
  }

  ngAfterViewInit() {
    if (this.isResident() && this.mapEl) {
      this.zone.runOutsideAngular(() => {
        this.resizeObserver = new ResizeObserver(() => {
          if (this.mapEl?.nativeElement?.offsetHeight > 0) {
            this.resizeObserver?.disconnect();
            this.zone.run(() => this.initMap());
          }
        });
        this.resizeObserver.observe(this.mapEl.nativeElement);
        setTimeout(() => {
          if (this.mapEl?.nativeElement?.offsetHeight > 0 && !this.map) {
            this.zone.run(() => this.initMap());
          }
        }, 150);
      });
    }
  }

  ngOnDestroy() {
    if (this.pollHandle) clearInterval(this.pollHandle);
    this.subs.forEach(s => s.unsubscribe());
    this.resizeObserver?.disconnect();
    if (this.map) { try { this.map.remove(); } catch {} }
  }

  isResident(): boolean { return this.role === 'RESIDENT'; }
  isStaff(): boolean { return this.role === 'STAFF'; }
  isAdmin(): boolean { return this.role === 'ADMIN' || this.role === 'CO_ADMIN'; }

  get currentUsername(): string { return this.user?.username ?? ''; }

  isRework(c: Complaint): boolean {
    if (!c || c.status !== 'ASSIGNED') return false;
    // Rework = proof rejected AND still assigned to this staff
    return !!(c.assignedToUsername === this.currentUsername &&
      c.proofs?.some((p: any) => p.submittedByUsername === this.currentUsername && p.status === 'REJECTED'));
  }

  /** Backend computes this reliably via myProofRejected field */
  isReassignedAway(c: Complaint): boolean {
    return !!c?.myProofRejected;
  }

  getRejectionReason(c: Complaint): string {
    return (c as any)?.myRejectionReason ?? '';
  }

  private computeGreeting() {
    const h = new Date().getHours();
    // Use firstName if available, fall back to username
    const name = this.user?.firstName || this.user?.username || '';
    if (h >= 5 && h < 11) this.timeOfDay = 'Good morning';
    else if (h >= 11 && h < 17) this.timeOfDay = 'Good afternoon';
    else if (h >= 17 && h < 21) this.timeOfDay = 'Good evening';
    else this.timeOfDay = 'Working late';
    this.greeting = `${this.timeOfDay}, ${name}`;
  }

  get displayName(): string {
    return this.user?.firstName || this.user?.username || '';
  }

  private loadComplaints(silent = false) {
    if (!silent) this.loading = true;

    if (this.isResident()) {
      // Resident: load community feed (all complaints in community)
      // AND load own complaints separately for accurate stats
      this.api.getCommunityFeed().subscribe({
        next: list => {
          this.complaints = (list ?? []).sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          this.loading = false;
          if (this.map) this.refreshMap();
        },
        error: () => { this.loading = false; }
      });
      // Load own complaints for stats separately
      this.api.getMyComplaints().subscribe({
        next: mine => {
          const t = mine ?? [];
          this.stats.total = t.length;
          this.stats.open = t.filter(c => c.status === 'OPEN' || c.status === 'SUBMITTED').length;
          this.stats.inProgress = t.filter(c => c.status === 'ASSIGNED' || c.status === 'IN_PROGRESS' || c.status === 'PROOF_SUBMITTED').length;
          this.stats.proofSubmitted = t.filter(c => c.status === 'PROOF_SUBMITTED').length;
          this.stats.resolved = t.filter(c => c.status === 'RESOLVED' || c.status === 'CLOSED').length;
        }
      });
      return;
    }

    let obs;
    if (this.isStaff()) obs = this.api.getMyWorkHistory();
    else obs = this.api.getAllComplaints();

    obs.subscribe({
      next: list => {
        this.complaints = (list ?? []).sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        this.computeStats();
        this.loading = false;
        if (this.map) this.refreshMap();

        // Staff: also load the full community feed separately
        if (this.isStaff() && !silent) {
          this.loadingCommunityFeed = true;
          this.api.getCommunityFeed().subscribe({
            next: all => {
              this.communityFeed = (all ?? []).sort(
                (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
              );
              this.loadingCommunityFeed = false;
            },
            error: () => { this.loadingCommunityFeed = false; }
          });
        }
      },
      error: () => { this.loading = false; }
    });
  }

  private computeStats() {
    const t = this.complaints;
    this.stats.total = t.length;
    // "Needs assignment" = OPEN or SUBMITTED only (not ASSIGNED — those are already assigned)
    this.stats.open = t.filter(c => c.status === 'OPEN' || c.status === 'SUBMITTED').length;
    // "In progress" = ASSIGNED + IN_PROGRESS
    this.stats.inProgress = t.filter(c => c.status === 'ASSIGNED' || c.status === 'IN_PROGRESS').length;
    // "Awaiting review" = proof submitted
    this.stats.proofSubmitted = t.filter(c => c.status === 'PROOF_SUBMITTED').length;
    // "Resolved" = resolved or closed
    this.stats.resolved = t.filter(c => c.status === 'RESOLVED' || c.status === 'CLOSED').length;
  }

  setFilter(f: typeof this.activeFilter) { this.activeFilter = f; }

  get filteredComplaints(): Complaint[] {
    if (this.activeFilter === 'all') return this.complaints;
    return this.complaints.filter(c => {
      // OPEN filter = needs attention (not yet being worked on)
      if (this.activeFilter === 'OPEN')
        return c.status === 'OPEN' || c.status === 'SUBMITTED';
      // IN_PROGRESS filter = being worked on (assigned, in progress, proof submitted)
      if (this.activeFilter === 'IN_PROGRESS')
        return c.status === 'ASSIGNED' || c.status === 'IN_PROGRESS' || c.status === 'PROOF_SUBMITTED';
      // RESOLVED filter = done
      if (this.activeFilter === 'RESOLVED')
        return c.status === 'RESOLVED' || c.status === 'CLOSED';
      return true;
    });
  }

  get filterCounts() {
    return {
      all: this.complaints.length,
      OPEN: this.complaints.filter(c => c.status === 'OPEN' || c.status === 'SUBMITTED').length,
      IN_PROGRESS: this.complaints.filter(c => c.status === 'ASSIGNED' || c.status === 'IN_PROGRESS' || c.status === 'PROOF_SUBMITTED').length,
      RESOLVED: this.complaints.filter(c => c.status === 'RESOLVED' || c.status === 'CLOSED').length,
    };
  }

  /** Staff: complaints waiting for admin review */
  get proofPendingComplaints(): Complaint[] {
    return this.complaints.filter(c => c.status === 'PROOF_SUBMITTED');
  }

  /** Staff: rework needed — proof rejected, reassigned back to this staff */
  get reworkComplaints(): Complaint[] {
    return this.complaints.filter(c => this.isRework(c));
  }

  /** Staff: fresh assigned (no rejected proof from this staff) or in progress */
  get activeWorkComplaints(): Complaint[] {
    return this.complaints.filter(c =>
      (c.status === 'IN_PROGRESS') ||
      (c.status === 'ASSIGNED' && !this.isRework(c) && c.assignedToUsername === this.currentUsername)
    );
  }

  /** Staff: proof was rejected and task given to someone else — history view */
  get reassignedAwayComplaints(): Complaint[] {
    return this.complaints.filter(c => this.isReassignedAway(c));
  }

  complaintNumber(c: Complaint): string {
    return c.communityComplaintNumber ? `#${c.communityComplaintNumber}` : `#${c.id}`;
  }

  etaLabel(c: Complaint): string {
    if (!c.estimatedResolutionAt) return 'ETA pending';
    const eta = new Date(c.estimatedResolutionAt);
    return `ETA ${eta.toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      hour: 'numeric',
      minute: '2-digit'
    })}`;
  }

  etaClass(c: Complaint): string {
    if (!c.estimatedResolutionAt) return 'pending';
    if (c.status === 'RESOLVED' || c.status === 'CLOSED') return 'resolved';
    return new Date(c.estimatedResolutionAt).getTime() < Date.now() ? 'overdue' : 'active';
  }

  statusColor(s: string): string {
    if (s === 'OPEN' || s === 'SUBMITTED') return '#B5564A';
    if (s === 'ASSIGNED' || s === 'IN_PROGRESS') return '#D4A24C';
    if (s === 'PROOF_SUBMITTED') return '#5B86A8';
    return '#7B9576';
  }

  statusLabel(s: string): string {
    const map: Record<string,string> = {
      SUBMITTED: 'New', OPEN: 'Open', ASSIGNED: 'Assigned',
      IN_PROGRESS: 'In progress', PROOF_SUBMITTED: 'Awaiting review',
      RESOLVED: 'Resolved', CLOSED: 'Closed'
    };
    return map[s] || s;
  }

  hasPhoto(c: Complaint): boolean {
    const b64 = c.mediaBase64List?.[0] ?? c.thumbnailBase64 ?? '';
    if (!b64) return false;
    // Only exclude if it exactly matches community branding logo
    const brandingLogo = this.branding?.logoBase64 ?? '';
    if (brandingLogo && b64.substring(0, 50) === brandingLogo.substring(0, 50)) return false;
    return true;
  }
  photoSrc(c: Complaint): string {
    const b64 = c.mediaBase64List?.[0] ?? c.thumbnailBase64 ?? '';
    if (!b64) return '';
    if (b64.startsWith('/9j/')) return 'data:image/jpeg;base64,' + b64;
    if (b64.startsWith('iVBOR')) return 'data:image/png;base64,' + b64;
    return 'data:image/jpeg;base64,' + b64;
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
    return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  }

  openComplaint(c: Complaint) {
    this.router.navigate(['/complaints'], { queryParams: { id: c.id } });
  }

  // ─── Map ──────────────────────────────────────────────────────────────────
  private initMap() {
    if (this.map || !this.mapEl || typeof L === 'undefined') return;
    const lat = this.branding?.mapCenterLat ?? 11.0168;
    const lng = this.branding?.mapCenterLng ?? 76.9558;
    const zoom = this.branding?.mapZoom ?? 16;

    this.map = L.map(this.mapEl.nativeElement, { zoomControl: true, attributionControl: false })
      .setView([lat, lng], zoom);
    L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(this.map);

    const style = document.createElement('style');
    style.textContent = `@keyframes pin-pulse { 0% { transform: scale(1); opacity: 0.6; } 100% { transform: scale(3.5); opacity: 0; } }`;
    document.head.appendChild(style);

    setTimeout(() => { if (this.map) this.map.invalidateSize(); }, 200);
    this.refreshMap();
  }

  private refreshMap() {
    if (!this.map) return;
    Object.values(this.markers).forEach(m => { try { this.map.removeLayer(m); } catch {} });
    this.markers = {};

    this.complaints.forEach(c => {
      if (c.latitude == null || c.longitude == null) return;
      const color = this.statusColor(c.status);
      const ring = c.status !== 'RESOLVED' && c.status !== 'CLOSED';
      const html = `
        <div style="position:relative;width:14px;height:14px;cursor:pointer;">
          <div style="position:absolute;inset:0;background:${color};border-radius:50%;border:2px solid #FAF9F5;box-shadow:0 1px 3px rgba(0,0,0,0.3);transition:transform 300ms cubic-bezier(0.32,0.72,0,1);"></div>
          ${ring ? `<div style="position:absolute;inset:-2px;border-radius:50%;background:${color};opacity:0.4;animation:pin-pulse 2s ease-out infinite;"></div>` : ''}
        </div>`;
      const icon = L.divIcon({ html, className: '', iconSize: [14,14], iconAnchor: [7,7] });
      const m = L.marker([c.latitude, c.longitude], { icon })
        .addTo(this.map)
        .bindTooltip(`${c.categoryName} · ${this.statusLabel(c.status)}`, { direction: 'top', offset: [0,-8] });
      m.on('click', () => this.zone.run(() => this.highlightFromMap(c.id)));
      this.markers[c.id] = m;
    });
  }

  highlightFromCard(c: Complaint) {
    this.highlightedId = c.id;
    const m = this.markers[c.id];
    if (m && this.map) {
      this.map.flyTo([c.latitude, c.longitude], Math.max(this.map.getZoom(), 18), { duration: 0.6 });
      const el = m.getElement();
      if (el) {
        const pin = el.querySelector('div > div:first-child') as HTMLElement;
        if (pin) {
          pin.style.transform = 'scale(1.7)';
          pin.style.boxShadow = '0 0 0 6px rgba(123, 149, 118, 0.45)';
          setTimeout(() => { pin.style.transform = ''; pin.style.boxShadow = ''; }, 2000);
        }
      }
    }
    setTimeout(() => { if (this.highlightedId === c.id) this.highlightedId = null; }, 2200);
  }

  private highlightFromMap(id: number) {
    this.highlightedId = id;
    setTimeout(() => {
      const card = document.querySelector(`[data-card-id="${id}"]`) as HTMLElement;
      if (card) card.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 50);
    setTimeout(() => { if (this.highlightedId === id) this.highlightedId = null; }, 2400);
  }
}
