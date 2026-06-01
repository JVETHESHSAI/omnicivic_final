// // // import { Component, OnInit, OnDestroy } from '@angular/core';
// // // import { CommonModule } from '@angular/common';
// // // import { FormsModule } from '@angular/forms';
// // // import { RouterModule } from '@angular/router';
// // // import { HttpClient } from '@angular/common/http';

// // // interface ServiceRequest {
// // //   id: number;
// // //   organizationName: string;
// // //   ownerName: string;
// // //   ownerEmail: string;
// // //   ownerPhone: string;
// // //   description: string;
// // //   address: string;
// // //   addressLat: number | null;
// // //   addressLng: number | null;
// // //   logoBase64: string | null;
// // //   status: 'PENDING' | 'APPROVED' | 'REJECTED';
// // //   assignedPrefix: string | null;
// // //   rejectionReason: string | null;
// // //   reviewedBy: string | null;
// // //   submittedAt: string;
// // //   reviewedAt: string | null;
// // // }

// // // interface CommunityWithCreds {
// // //   communityPrefix: string;
// // //   name: string;
// // //   logoBase64: string | null;
// // //   themeColor: string | null;
// // //   adminUsername?: string;
// // //   adminTemporaryPassword?: string;
// // //   adminEmail?: string;
// // //   adminFirstLogin?: boolean;
// // // }

// // // @Component({
// // //   selector: 'app-super-admin-dashboard',
// // //   standalone: true,
// // //   imports: [CommonModule, FormsModule, RouterModule],
// // //   templateUrl: './super-admin-dashboard.component.html',
// // //   styleUrls: ['./super-admin-dashboard.component.scss']
// // // })
// // // export class SuperAdminDashboardComponent implements OnInit, OnDestroy {
// // //   activeTab: 'requests' | 'communities' = 'requests';

// // //   requests: ServiceRequest[] = [];
// // //   requestFilter: 'PENDING' | 'APPROVED' | 'REJECTED' | 'ALL' = 'PENDING';
// // //   selectedRequest: ServiceRequest | null = null;
// // //   approvePrefix = '';
// // //   rejectionReason = '';
// // //   approveError = '';
// // //   approving = false;
// // //   rejecting = false;

// // //   communities: CommunityWithCreds[] = [];
// // //   selectedCommunity: CommunityWithCreds | null = null;

// // //   counts: Record<string, number> = { PENDING: 0, APPROVED: 0, REJECTED: 0 };

// // //   loading = true;
// // //   private pollHandle: any;

// // //   constructor(private http: HttpClient) {}

// // //   ngOnInit() {
// // //     this.loadRequests();
// // //     this.loadCommunities();
// // //     this.loadCounts();
// // //     this.pollHandle = setInterval(() => { this.loadRequests(true); this.loadCounts(); }, 15000);
// // //   }

// // //   ngOnDestroy() {
// // //     if (this.pollHandle) clearInterval(this.pollHandle);
// // //   }

// // //   loadRequests(silent = false) {
// // //     if (!silent) this.loading = true;
// // //     const url = this.requestFilter === 'ALL' ? '/api/service-requests' : `/api/service-requests?status=${this.requestFilter}`;
// // //     this.http.get<ServiceRequest[]>(url).subscribe({
// // //       next: list => {
// // //         this.requests = list ?? [];
// // //         this.loading = false;
// // //         if (this.selectedRequest) {
// // //           const upd = this.requests.find(r => r.id === this.selectedRequest!.id);
// // //           if (upd) this.selectedRequest = upd;
// // //         }
// // //       },
// // //       error: () => { this.loading = false; }
// // //     });
// // //   }

// // //   loadCounts() {
// // //     this.http.get<Record<string, number>>('/api/service-requests/counts').subscribe({
// // //       next: c => {
// // //         if (!c) return;
// // //         // Backend returns lowercase keys: pending, approved, rejected, total
// // //         // Normalise to uppercase so the template works with either case
// // //         this.counts = {
// // //           PENDING:  c['PENDING']  ?? c['pending']  ?? 0,
// // //           APPROVED: c['APPROVED'] ?? c['approved'] ?? 0,
// // //           REJECTED: c['REJECTED'] ?? c['rejected'] ?? 0,
// // //           total:    c['total']    ?? 0
// // //         };
// // //       }
// // //     });
// // //   }

// // //   setRequestFilter(f: typeof this.requestFilter) {
// // //     this.requestFilter = f;
// // //     this.loadRequests();
// // //   }

// // //   selectRequest(r: ServiceRequest) {
// // //     this.selectedRequest = r;
// // //     this.approvePrefix = this.suggestPrefix(r.organizationName);
// // //     this.rejectionReason = '';
// // //     this.approveError = '';
// // //   }

// // //   suggestPrefix(name: string): string {
// // //     const cleaned = (name || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
// // //     return cleaned.substring(0, 4).padEnd(4, '0');
// // //   }

// // //   lastCredentials: { username: string; temporaryPassword: string; email: string; orgName: string; prefix: string } | null = null;

// // //   approveRequest() {
// // //     if (!this.selectedRequest || !this.approvePrefix || this.approvePrefix.length !== 4) {
// // //       this.approveError = 'Prefix must be exactly 4 uppercase alphanumeric characters.';
// // //       return;
// // //     }
// // //     if (!/^[A-Z0-9]{4}$/.test(this.approvePrefix)) {
// // //       this.approveError = 'Prefix must be 4 uppercase alphanumeric characters (A-Z, 0-9).';
// // //       return;
// // //     }
// // //     this.approving = true;
// // //     this.approveError = '';
// // //     const orgName = this.selectedRequest.organizationName;
// // //     const ownerEmail = this.selectedRequest.ownerEmail;
// // //     this.http.post<any>(`/api/service-requests/${this.selectedRequest.id}/approve`,
// // //       { communityPrefix: this.approvePrefix }).subscribe({
// // //       next: (res) => {
// // //         this.approving = false;
// // //         this.selectedRequest = null;
// // //         // Surface credentials so super admin can manually relay if email failed
// // //         if (res?.credentials) {
// // //           this.lastCredentials = {
// // //             username: res.credentials.username,
// // //             temporaryPassword: res.credentials.temporaryPassword,
// // //             email: ownerEmail,
// // //             orgName,
// // //             prefix: res.credentials.communityPrefix || this.approvePrefix
// // //           };
// // //         }
// // //         this.loadRequests();
// // //         this.loadCommunities();
// // //         this.loadCounts();
// // //       },
// // //       error: e => {
// // //         this.approving = false;
// // //         this.approveError = e.error?.message || 'Approval failed. Try a different prefix.';
// // //       }
// // //     });
// // //   }

// // //   dismissCredentials() { this.lastCredentials = null; }

// // //   rejectRequest() {
// // //     if (!this.selectedRequest || !this.rejectionReason) {
// // //       this.approveError = 'Please provide a rejection reason.';
// // //       return;
// // //     }
// // //     this.rejecting = true;
// // //     this.http.post(`/api/service-requests/${this.selectedRequest.id}/reject?reason=${encodeURIComponent(this.rejectionReason)}`, {}).subscribe({
// // //       next: () => {
// // //         this.rejecting = false;
// // //         this.selectedRequest = null;
// // //         this.loadRequests();
// // //         this.loadCounts();
// // //       },
// // //       error: e => {
// // //         this.rejecting = false;
// // //         this.approveError = e.error?.message || 'Rejection failed.';
// // //       }
// // //     });
// // //   }

// // //   loadCommunities() {
// // //     this.http.get<CommunityWithCreds[]>('/api/communities/with-credentials').subscribe({
// // //       next: list => this.communities = list ?? [],
// // //       error: () => {}
// // //     });
// // //   }

// // //   selectCommunity(c: CommunityWithCreds) {
// // //     this.selectedCommunity = c;
// // //   }

// // //   removeCommunity(c: CommunityWithCreds) {
// // //     if (!confirm(`Soft-delete ${c.name} (${c.communityPrefix})? Their data stays, but they lose access immediately.`)) return;
// // //     this.http.delete(`/api/communities/${c.communityPrefix}`).subscribe({
// // //       next: () => { this.selectedCommunity = null; this.loadCommunities(); },
// // //       error: e => alert(e.error?.message || 'Failed to remove community.')
// // //     });
// // //   }

// // //   copy(text: string) {
// // //     navigator.clipboard.writeText(text);
// // //   }

// // //   logoSrc(b64: string | null | undefined): string {
// // //     if (!b64) return '';
// // //     if (b64.startsWith('/9j/')) return `data:image/jpeg;base64,${b64}`;
// // //     if (b64.startsWith('iVBOR')) return `data:image/png;base64,${b64}`;
// // //     return `data:image/jpeg;base64,${b64}`;
// // //   }

// // //   fullDate(iso: string): string { return iso ? new Date(iso).toLocaleString() : ''; }

// // //   timeAgo(iso: string): string {
// // //     if (!iso) return '';
// // //     const m = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
// // //     if (m < 1) return 'just now';
// // //     if (m < 60) return `${m}m ago`;
// // //     const h = Math.floor(m / 60);
// // //     if (h < 24) return `${h}h ago`;
// // //     const d = Math.floor(h / 24);
// // //     return `${d}d ago`;
// // //   }
// // // }

// // import { Component, OnInit, OnDestroy } from '@angular/core';
// // import { CommonModule } from '@angular/common';
// // import { FormsModule } from '@angular/forms';
// // import { RouterModule } from '@angular/router';
// // import { HttpClient } from '@angular/common/http';

// // interface ServiceRequest {
// //   id: number;
// //   organizationName: string;
// //   ownerName: string;
// //   ownerEmail: string;
// //   ownerPhone: string;
// //   description: string;
// //   address: string;
// //   addressLat: number | null;
// //   addressLng: number | null;
// //   logoBase64: string | null;
// //   status: 'PENDING' | 'APPROVED' | 'REJECTED';
// //   assignedPrefix: string | null;
// //   rejectionReason: string | null;
// //   reviewedBy: string | null;
// //   submittedAt: string;
// //   reviewedAt: string | null;
// // }

// // interface CommunityWithCreds {
// //   communityPrefix: string;
// //   name: string;
// //   logoBase64: string | null;
// //   themeColor: string | null;
// //   active: boolean;           // false when soft-deleted
// //   adminUsername?: string;
// //   adminTemporaryPassword?: string;
// //   adminEmail?: string;
// //   adminFirstLogin?: boolean;
// // }

// // @Component({
// //   selector: 'app-super-admin-dashboard',
// //   standalone: true,
// //   imports: [CommonModule, FormsModule, RouterModule],
// //   templateUrl: './super-admin-dashboard.component.html',
// //   styleUrls: ['./super-admin-dashboard.component.scss']
// // })
// // export class SuperAdminDashboardComponent implements OnInit, OnDestroy {
// //   activeTab: 'requests' | 'communities' = 'requests';

// //   requests: ServiceRequest[] = [];
// //   requestFilter: 'PENDING' | 'APPROVED' | 'REJECTED' | 'ALL' = 'PENDING';
// //   selectedRequest: ServiceRequest | null = null;
// //   approvePrefix = '';
// //   rejectionReason = '';
// //   approveError = '';
// //   approving = false;
// //   rejecting = false;

// //   communities: CommunityWithCreds[] = [];
// //   selectedCommunity: CommunityWithCreds | null = null;

// //   counts: Record<string, number> = { PENDING: 0, APPROVED: 0, REJECTED: 0 };

// //   loading = true;
// //   private pollHandle: any;

// //   constructor(private http: HttpClient) {}

// //   ngOnInit() {
// //     this.loadRequests();
// //     this.loadCommunities();
// //     this.loadCounts();
// //     this.pollHandle = setInterval(() => { this.loadRequests(true); this.loadCounts(); }, 15000);
// //   }

// //   ngOnDestroy() {
// //     if (this.pollHandle) clearInterval(this.pollHandle);
// //   }

// //   loadRequests(silent = false) {
// //     if (!silent) this.loading = true;
// //     const url = this.requestFilter === 'ALL' ? '/api/service-requests' : `/api/service-requests?status=${this.requestFilter}`;
// //     this.http.get<ServiceRequest[]>(url).subscribe({
// //       next: list => {
// //         this.requests = list ?? [];
// //         this.loading = false;
// //         if (this.selectedRequest) {
// //           const upd = this.requests.find(r => r.id === this.selectedRequest!.id);
// //           if (upd) this.selectedRequest = upd;
// //         }
// //       },
// //       error: () => { this.loading = false; }
// //     });
// //   }

// //   loadCounts() {
// //     this.http.get<Record<string, number>>('/api/service-requests/counts').subscribe({
// //       next: c => {
// //         if (!c) return;
// //         // Backend returns lowercase keys: pending, approved, rejected, total
// //         // Normalise to uppercase so the template works with either case
// //         this.counts = {
// //           PENDING:  c['PENDING']  ?? c['pending']  ?? 0,
// //           APPROVED: c['APPROVED'] ?? c['approved'] ?? 0,
// //           REJECTED: c['REJECTED'] ?? c['rejected'] ?? 0,
// //           total:    c['total']    ?? 0
// //         };
// //       }
// //     });
// //   }

// //   setRequestFilter(f: typeof this.requestFilter) {
// //     this.requestFilter = f;
// //     this.loadRequests();
// //   }

// //   selectRequest(r: ServiceRequest) {
// //     this.selectedRequest = r;
// //     this.approvePrefix = this.suggestPrefix(r.organizationName);
// //     this.rejectionReason = '';
// //     this.approveError = '';
// //   }

// //   suggestPrefix(name: string): string {
// //     const cleaned = (name || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
// //     return cleaned.substring(0, 4).padEnd(4, '0');
// //   }

// //   lastCredentials: { username: string; temporaryPassword: string; email: string; orgName: string; prefix: string } | null = null;

// //   approveRequest() {
// //     if (!this.selectedRequest || !this.approvePrefix || this.approvePrefix.length !== 4) {
// //       this.approveError = 'Prefix must be exactly 4 uppercase alphanumeric characters.';
// //       return;
// //     }
// //     if (!/^[A-Z0-9]{4}$/.test(this.approvePrefix)) {
// //       this.approveError = 'Prefix must be 4 uppercase alphanumeric characters (A-Z, 0-9).';
// //       return;
// //     }
// //     this.approving = true;
// //     this.approveError = '';
// //     const orgName = this.selectedRequest.organizationName;
// //     const ownerEmail = this.selectedRequest.ownerEmail;
// //     this.http.post<any>(`/api/service-requests/${this.selectedRequest.id}/approve`,
// //       { communityPrefix: this.approvePrefix }).subscribe({
// //       next: (res) => {
// //         this.approving = false;
// //         this.selectedRequest = null;
// //         // Surface credentials so super admin can manually relay if email failed
// //         if (res?.credentials) {
// //           this.lastCredentials = {
// //             username: res.credentials.username,
// //             temporaryPassword: res.credentials.temporaryPassword,
// //             email: ownerEmail,
// //             orgName,
// //             prefix: res.credentials.communityPrefix || this.approvePrefix
// //           };
// //         }
// //         this.loadRequests();
// //         this.loadCommunities();
// //         this.loadCounts();
// //       },
// //       error: e => {
// //         this.approving = false;
// //         this.approveError = e.error?.message || 'Approval failed. Try a different prefix.';
// //       }
// //     });
// //   }

// //   dismissCredentials() { this.lastCredentials = null; }

// //   rejectRequest() {
// //     if (!this.selectedRequest || !this.rejectionReason) {
// //       this.approveError = 'Please provide a rejection reason.';
// //       return;
// //     }
// //     this.rejecting = true;
// //     this.http.post(`/api/service-requests/${this.selectedRequest.id}/reject?reason=${encodeURIComponent(this.rejectionReason)}`, {}).subscribe({
// //       next: () => {
// //         this.rejecting = false;
// //         this.selectedRequest = null;
// //         this.loadRequests();
// //         this.loadCounts();
// //       },
// //       error: e => {
// //         this.rejecting = false;
// //         this.approveError = e.error?.message || 'Rejection failed.';
// //       }
// //     });
// //   }

// //   loadCommunities() {
// //     this.http.get<CommunityWithCreds[]>('/api/communities/with-credentials').subscribe({
// //       next: list => this.communities = list ?? [],
// //       error: () => {}
// //     });
// //   }

// //   selectCommunity(c: CommunityWithCreds) {
// //     this.selectedCommunity = c;
// //   }

// //   /** Only communities that are still active (not soft-deleted) */
// //   get activeCommunities(): CommunityWithCreds[] {
// //     return this.communities.filter(c => c.active !== false);
// //   }

// //   removeCommunity(c: CommunityWithCreds) {
// //     if (!confirm(`Soft-delete ${c.name} (${c.communityPrefix})? Their data stays, but they lose access immediately.`)) return;
// //     this.http.delete(`/api/communities/${c.communityPrefix}`).subscribe({
// //       next: () => { this.selectedCommunity = null; this.loadCommunities(); },
// //       error: e => alert(e.error?.message || 'Failed to remove community.')
// //     });
// //   }

// //   copy(text: string) {
// //     navigator.clipboard.writeText(text);
// //   }

// //   logoSrc(b64: string | null | undefined): string {
// //     if (!b64) return '';
// //     if (b64.startsWith('/9j/')) return `data:image/jpeg;base64,${b64}`;
// //     if (b64.startsWith('iVBOR')) return `data:image/png;base64,${b64}`;
// //     return `data:image/jpeg;base64,${b64}`;
// //   }

// //   fullDate(iso: string): string { return iso ? new Date(iso).toLocaleString() : ''; }

// //   timeAgo(iso: string): string {
// //     if (!iso) return '';
// //     const m = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
// //     if (m < 1) return 'just now';
// //     if (m < 60) return `${m}m ago`;
// //     const h = Math.floor(m / 60);
// //     if (h < 24) return `${h}h ago`;
// //     const d = Math.floor(h / 24);
// //     return `${d}d ago`;
// //   }
// // }


// import { Component, OnInit, OnDestroy } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { FormsModule } from '@angular/forms';
// import { RouterModule } from '@angular/router';
// import { HttpClient } from '@angular/common/http';

// interface ServiceRequest {
//   id: number;
//   organizationName: string;
//   ownerName: string;
//   ownerEmail: string;
//   ownerPhone: string;
//   description: string;
//   address: string;
//   addressLat: number | null;
//   addressLng: number | null;
//   logoBase64: string | null;
//   status: 'PENDING' | 'APPROVED' | 'REJECTED';
//   assignedPrefix: string | null;
//   rejectionReason: string | null;
//   reviewedBy: string | null;
//   submittedAt: string;
//   reviewedAt: string | null;
// }

// interface CommunityWithCreds {
//   communityPrefix: string;
//   name: string;
//   logoBase64: string | null;
//   themeColor: string | null;
//   active: boolean;           // false when soft-deleted
//   adminUsername?: string;
//   adminTemporaryPassword?: string;
//   adminEmail?: string;
//   adminFirstLogin?: boolean;
// }

// @Component({
//   selector: 'app-super-admin-dashboard',
//   standalone: true,
//   imports: [CommonModule, FormsModule, RouterModule],
//   templateUrl: './super-admin-dashboard.component.html',
//   styleUrls: ['./super-admin-dashboard.component.scss']
// })
// export class SuperAdminDashboardComponent implements OnInit, OnDestroy {
//   activeTab: 'requests' | 'communities' = 'requests';

//   requests: ServiceRequest[] = [];
//   requestFilter: 'PENDING' | 'APPROVED' | 'REJECTED' | 'ALL' = 'PENDING';
//   selectedRequest: ServiceRequest | null = null;
//   approvePrefix = '';
//   rejectionReason = '';
//   approveError = '';
//   approving = false;
//   rejecting = false;

//   communities: CommunityWithCreds[] = [];
//   selectedCommunity: CommunityWithCreds | null = null;

//   counts: Record<string, number> = { PENDING: 0, APPROVED: 0, REJECTED: 0 };

//   loading = true;
//   private pollHandle: any;

//   constructor(private http: HttpClient) {}

//   ngOnInit() {
//     this.loadRequests();
//     this.loadCommunities();
//     this.loadCounts();
//     this.pollHandle = setInterval(() => { this.loadRequests(true); this.loadCounts(); }, 15000);
//   }

//   ngOnDestroy() {
//     if (this.pollHandle) clearInterval(this.pollHandle);
//   }

//   loadRequests(silent = false) {
//     if (!silent) this.loading = true;
//     const url = this.requestFilter === 'ALL' ? '/api/service-requests' : `/api/service-requests?status=${this.requestFilter}`;
//     this.http.get<ServiceRequest[]>(url).subscribe({
//       next: list => {
//         this.requests = list ?? [];
//         this.loading = false;
//         if (this.selectedRequest) {
//           const upd = this.requests.find(r => r.id === this.selectedRequest!.id);
//           if (upd) this.selectedRequest = upd;
//         }
//       },
//       error: () => { this.loading = false; }
//     });
//   }

//   loadCounts() {
//     this.http.get<Record<string, number>>('/api/service-requests/counts').subscribe({
//       next: c => {
//         if (!c) return;
//         // Backend returns lowercase keys: pending, approved, rejected, total
//         // Normalise to uppercase so the template works with either case
//         this.counts = {
//           PENDING:  c['PENDING']  ?? c['pending']  ?? 0,
//           APPROVED: c['APPROVED'] ?? c['approved'] ?? 0,
//           REJECTED: c['REJECTED'] ?? c['rejected'] ?? 0,
//           total:    c['total']    ?? 0
//         };
//       }
//     });
//   }

//   setRequestFilter(f: typeof this.requestFilter) {
//     this.requestFilter = f;
//     this.loadRequests();
//   }

//   selectRequest(r: ServiceRequest) {
//     this.selectedRequest = r;
//     this.approvePrefix = this.suggestPrefix(r.organizationName);
//     this.rejectionReason = '';
//     this.approveError = '';
//   }

//   suggestPrefix(name: string): string {
//     const cleaned = (name || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
//     return cleaned.substring(0, 4).padEnd(4, '0');
//   }

//   lastCredentials: { username: string; temporaryPassword: string; email: string; orgName: string; prefix: string } | null = null;

//   approveRequest() {
//     if (!this.selectedRequest || !this.approvePrefix || this.approvePrefix.length !== 4) {
//       this.approveError = 'Prefix must be exactly 4 uppercase alphanumeric characters.';
//       return;
//     }
//     if (!/^[A-Z0-9]{4}$/.test(this.approvePrefix)) {
//       this.approveError = 'Prefix must be 4 uppercase alphanumeric characters (A-Z, 0-9).';
//       return;
//     }
//     this.approving = true;
//     this.approveError = '';
//     const orgName = this.selectedRequest.organizationName;
//     const ownerEmail = this.selectedRequest.ownerEmail;
//     this.http.post<any>(`/api/service-requests/${this.selectedRequest.id}/approve`,
//       { communityPrefix: this.approvePrefix }).subscribe({
//       next: (res) => {
//         this.approving = false;
//         this.selectedRequest = null;
//         // Surface credentials so super admin can manually relay if email failed
//         if (res?.credentials) {
//           this.lastCredentials = {
//             username: res.credentials.username,
//             temporaryPassword: res.credentials.temporaryPassword,
//             email: ownerEmail,
//             orgName,
//             prefix: res.credentials.communityPrefix || this.approvePrefix
//           };
//         }
//         this.loadRequests();
//         this.loadCommunities();
//         this.loadCounts();
//       },
//       error: e => {
//         this.approving = false;
//         this.approveError = e.error?.message || 'Approval failed. Try a different prefix.';
//       }
//     });
//   }

//   dismissCredentials() { this.lastCredentials = null; }

//   rejectRequest() {
//     if (!this.selectedRequest || !this.rejectionReason) {
//       this.approveError = 'Please provide a rejection reason.';
//       return;
//     }
//     this.rejecting = true;
//     this.http.post(`/api/service-requests/${this.selectedRequest.id}/reject?reason=${encodeURIComponent(this.rejectionReason)}`, {}).subscribe({
//       next: () => {
//         this.rejecting = false;
//         this.selectedRequest = null;
//         this.loadRequests();
//         this.loadCounts();
//       },
//       error: e => {
//         this.rejecting = false;
//         this.approveError = e.error?.message || 'Rejection failed.';
//       }
//     });
//   }

//   loadCommunities() {
//     this.http.get<CommunityWithCreds[]>('/api/communities/with-credentials').subscribe({
//       next: list => this.communities = list ?? [],
//       error: () => {}
//     });
//   }

//   selectCommunity(c: CommunityWithCreds) {
//     this.selectedCommunity = c;
//   }

//   /** Only communities that are still active (not soft-deleted) */
//   get activeCommunities(): CommunityWithCreds[] {
//     return this.communities.filter(c => c.active !== false);
//   }

//   removeCommunity(c: CommunityWithCreds) {
//     if (!confirm(`Soft-delete ${c.name} (${c.communityPrefix})? Their data stays, but they lose access immediately.`)) return;
//     this.http.delete(`/api/communities/${c.communityPrefix}`).subscribe({
//       next: () => { this.selectedCommunity = null; this.loadCommunities(); },
//       error: e => alert(e.error?.message || 'Failed to remove community.')
//     });
//   }

//   copy(text: string) {
//     navigator.clipboard.writeText(text);
//   }

//   logoSrc(b64: string | null | undefined): string {
//     if (!b64) return '';
//     if (b64.startsWith('/9j/')) return `data:image/jpeg;base64,${b64}`;
//     if (b64.startsWith('iVBOR')) return `data:image/png;base64,${b64}`;
//     return `data:image/jpeg;base64,${b64}`;
//   }

//   fullDate(iso: string): string { return iso ? new Date(iso).toLocaleString() : ''; }

//   timeAgo(iso: string): string {
//     if (!iso) return '';
//     const m = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
//     if (m < 1) return 'just now';
//     if (m < 60) return `${m}m ago`;
//     const h = Math.floor(m / 60);
//     if (h < 24) return `${h}h ago`;
//     const d = Math.floor(h / 24);
//     return `${d}d ago`;
//   }
// }


import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';

interface ServiceRequest {
  id: number;
  organizationName: string;
  ownerName: string;
  ownerEmail: string;
  ownerPhone: string;
  description: string;
  address: string;
  addressLat: number | null;
  addressLng: number | null;
  logoBase64: string | null;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  assignedPrefix: string | null;
  rejectionReason: string | null;
  reviewedBy: string | null;
  submittedAt: string;
  reviewedAt: string | null;
}

interface CommunityWithCreds {
  communityPrefix: string;
  name: string;
  logoBase64: string | null;
  themeColor: string | null;
  active: boolean;           // false when soft-deleted
  adminUsername?: string;
  adminTemporaryPassword?: string;
  adminEmail?: string;
  adminFirstLogin?: boolean;
}

@Component({
  selector: 'app-super-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './super-admin-dashboard.component.html',
  styleUrls: ['./super-admin-dashboard.component.scss']
})
export class SuperAdminDashboardComponent implements OnInit, OnDestroy {
  activeTab: 'requests' | 'communities' | 'notifications' = 'requests';

  requests: ServiceRequest[] = [];
  requestFilter: 'PENDING' | 'APPROVED' | 'REJECTED' | 'ALL' = 'PENDING';
  selectedRequest: ServiceRequest | null = null;
  approvePrefix = '';
  rejectionReason = '';
  approveError = '';
  approving = false;
  rejecting = false;

  communities: CommunityWithCreds[] = [];
  selectedCommunity: CommunityWithCreds | null = null;

  counts: Record<string, number> = { PENDING: 0, APPROVED: 0, REJECTED: 0 };

  loading = true;
  private pollHandle: any;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadRequests();
    this.loadCommunities();
    this.loadCounts();
    this.pollHandle = setInterval(() => { this.loadRequests(true); this.loadCounts(); }, 15000);
  }

  ngOnDestroy() {
    if (this.pollHandle) clearInterval(this.pollHandle);
  }

  loadRequests(silent = false) {
    if (!silent) this.loading = true;
    const url = this.requestFilter === 'ALL' ? '/api/service-requests' : `/api/service-requests?status=${this.requestFilter}`;
    this.http.get<ServiceRequest[]>(url).subscribe({
      next: list => {
        this.requests = list ?? [];
        this.loading = false;
        if (this.selectedRequest) {
          const upd = this.requests.find(r => r.id === this.selectedRequest!.id);
          if (upd) this.selectedRequest = upd;
        }
      },
      error: () => { this.loading = false; }
    });
  }

  loadCounts() {
    this.http.get<Record<string, number>>('/api/service-requests/counts').subscribe({
      next: c => {
        if (!c) return;
        // Backend returns lowercase keys: pending, approved, rejected, total
        // Normalise to uppercase so the template works with either case
        this.counts = {
          PENDING:  c['PENDING']  ?? c['pending']  ?? 0,
          APPROVED: c['APPROVED'] ?? c['approved'] ?? 0,
          REJECTED: c['REJECTED'] ?? c['rejected'] ?? 0,
          total:    c['total']    ?? 0
        };
      }
    });
  }

  setRequestFilter(f: typeof this.requestFilter) {
    this.requestFilter = f;
    this.loadRequests();
  }

  selectRequest(r: ServiceRequest) {
    this.selectedRequest = r;
    this.approvePrefix = this.suggestPrefix(r.organizationName);
    this.rejectionReason = '';
    this.approveError = '';
  }

  suggestPrefix(name: string): string {
    const cleaned = (name || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
    return cleaned.substring(0, 4).padEnd(4, '0');
  }

  lastCredentials: { username: string; temporaryPassword: string; email: string; orgName: string; prefix: string } | null = null;

  approveRequest() {
    if (!this.selectedRequest || !this.approvePrefix || this.approvePrefix.length !== 4) {
      this.approveError = 'Prefix must be exactly 4 uppercase alphanumeric characters.';
      return;
    }
    if (!/^[A-Z0-9]{4}$/.test(this.approvePrefix)) {
      this.approveError = 'Prefix must be 4 uppercase alphanumeric characters (A-Z, 0-9).';
      return;
    }
    this.approving = true;
    this.approveError = '';
    const orgName = this.selectedRequest.organizationName;
    const ownerEmail = this.selectedRequest.ownerEmail;
    this.http.post<any>(`/api/service-requests/${this.selectedRequest.id}/approve`,
      { communityPrefix: this.approvePrefix }).subscribe({
      next: (res) => {
        this.approving = false;
        this.selectedRequest = null;
        // Surface credentials so super admin can manually relay if email failed
        if (res?.credentials) {
          this.lastCredentials = {
            username: res.credentials.username,
            temporaryPassword: res.credentials.temporaryPassword,
            email: ownerEmail,
            orgName,
            prefix: res.credentials.communityPrefix || this.approvePrefix
          };
        }
        this.loadRequests();
        this.loadCommunities();
        this.loadCounts();
      },
      error: e => {
        this.approving = false;
        this.approveError = e.error?.message || 'Approval failed. Try a different prefix.';
      }
    });
  }

  dismissCredentials() { this.lastCredentials = null; }

  rejectRequest() {
    if (!this.selectedRequest || !this.rejectionReason) {
      this.approveError = 'Please provide a rejection reason.';
      return;
    }
    this.rejecting = true;
    this.http.post(`/api/service-requests/${this.selectedRequest.id}/reject?reason=${encodeURIComponent(this.rejectionReason)}`, {}).subscribe({
      next: () => {
        this.rejecting = false;
        this.selectedRequest = null;
        this.loadRequests();
        this.loadCounts();
      },
      error: e => {
        this.rejecting = false;
        this.approveError = e.error?.message || 'Rejection failed.';
      }
    });
  }

  loadCommunities() {
    this.http.get<CommunityWithCreds[]>('/api/communities/with-credentials').subscribe({
      next: list => this.communities = list ?? [],
      error: () => {}
    });
  }

  selectCommunity(c: CommunityWithCreds) {
    this.selectedCommunity = c;
  }

  /** Only communities that are still active (not soft-deleted) */
  get activeCommunities(): CommunityWithCreds[] {
    return this.communities.filter(c => c.active !== false);
  }

  removeCommunity(c: CommunityWithCreds) {
    if (!confirm(`Soft-delete ${c.name} (${c.communityPrefix})? Their data stays, but they lose access immediately.`)) return;
    this.http.delete(`/api/communities/${c.communityPrefix}`).subscribe({
      next: () => { this.selectedCommunity = null; this.loadCommunities(); },
      error: e => alert(e.error?.message || 'Failed to remove community.')
    });
  }

  copy(text: string) {
    navigator.clipboard.writeText(text);
  }

  logoSrc(b64: string | null | undefined): string {
    if (!b64) return '';
    if (b64.startsWith('/9j/')) return `data:image/jpeg;base64,${b64}`;
    if (b64.startsWith('iVBOR')) return `data:image/png;base64,${b64}`;
    return `data:image/jpeg;base64,${b64}`;
  }

  fullDate(iso: string): string { return iso ? new Date(iso).toLocaleString() : ''; }

  timeAgo(iso: string): string {
    if (!iso) return '';
    const m = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
    if (m < 1) return 'just now';
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    const d = Math.floor(h / 24);
    return `${d}d ago`;
  }
}
