// // // // // // // // // // // // import { Component, OnInit, OnDestroy } from '@angular/core';
// // // // // // // // // // // // import { CommonModule } from '@angular/common';
// // // // // // // // // // // // import { FormsModule } from '@angular/forms';
// // // // // // // // // // // // import { ActivatedRoute, Router, RouterModule } from '@angular/router';
// // // // // // // // // // // // import { Subscription } from 'rxjs';
// // // // // // // // // // // // import { AuthService } from '../../../core/services/auth.service';
// // // // // // // // // // // // import { ApiService } from '../../../core/services/api.service';
// // // // // // // // // // // // import { Complaint, User, ComplaintProof } from '../../../shared/models/models';

// // // // // // // // // // // // @Component({
// // // // // // // // // // // //   selector: 'app-complaint-list',
// // // // // // // // // // // //   standalone: true,
// // // // // // // // // // // //   imports: [CommonModule, FormsModule, RouterModule],
// // // // // // // // // // // //   templateUrl: './complaint-list.component.html',
// // // // // // // // // // // //   styleUrls: ['./complaint-list.component.scss']
// // // // // // // // // // // // })
// // // // // // // // // // // // export class ComplaintListComponent implements OnInit, OnDestroy {
// // // // // // // // // // // //   user: any = null;
// // // // // // // // // // // //   role: string | null = null;

// // // // // // // // // // // //   complaints: Complaint[] = [];
// // // // // // // // // // // //   loading = true;

// // // // // // // // // // // //   activeFilter: 'all' | 'OPEN' | 'IN_PROGRESS' | 'PROOF_SUBMITTED' | 'RESOLVED' = 'all';
// // // // // // // // // // // //   selectedId: number | null = null;
// // // // // // // // // // // //   selected: Complaint | null = null;

// // // // // // // // // // // //   staffList: User[] = [];
// // // // // // // // // // // //   assignStaffId: number | null = null;
// // // // // // // // // // // //   closeNote = '';

// // // // // // // // // // // //   proofNote = '';
// // // // // // // // // // // //   proofImage: string | null = null;
// // // // // // // // // // // //   showProofModal = false;

// // // // // // // // // // // //   reviewReason = '';
// // // // // // // // // // // //   showReviewModal = false;
// // // // // // // // // // // //   reviewMode: 'APPROVE' | 'REJECT' = 'APPROVE';

// // // // // // // // // // // //   errorMsg = '';
// // // // // // // // // // // //   successMsg = '';

// // // // // // // // // // // //   private pollHandle: any;
// // // // // // // // // // // //   private subs: Subscription[] = [];

// // // // // // // // // // // //   constructor(
// // // // // // // // // // // //     private auth: AuthService,
// // // // // // // // // // // //     private api: ApiService,
// // // // // // // // // // // //     private route: ActivatedRoute,
// // // // // // // // // // // //     private router: Router
// // // // // // // // // // // //   ) {}

// // // // // // // // // // // //   ngOnInit() {
// // // // // // // // // // // //     this.user = this.auth.getCurrentUser();
// // // // // // // // // // // //     this.role = this.user?.role;
// // // // // // // // // // // //     this.subs.push(this.route.queryParams.subscribe(p => {
// // // // // // // // // // // //       if (p['id']) this.selectedId = +p['id'];
// // // // // // // // // // // //     }));
// // // // // // // // // // // //     this.load();
// // // // // // // // // // // //     this.pollHandle = setInterval(() => this.load(true), 10000);
// // // // // // // // // // // //     if (this.isAdmin()) {
// // // // // // // // // // // //       this.api.getAllUsers('STAFF').subscribe(s => this.staffList = s ?? []);
// // // // // // // // // // // //     }
// // // // // // // // // // // //   }

// // // // // // // // // // // //   ngOnDestroy() {
// // // // // // // // // // // //     if (this.pollHandle) clearInterval(this.pollHandle);
// // // // // // // // // // // //     this.subs.forEach(s => s.unsubscribe());
// // // // // // // // // // // //   }

// // // // // // // // // // // //   isResident() { return this.role === 'RESIDENT'; }
// // // // // // // // // // // //   isStaff() { return this.role === 'STAFF'; }
// // // // // // // // // // // //   isAdmin() { return this.role === 'ADMIN' || this.role === 'CO_ADMIN'; }

// // // // // // // // // // // //   private load(silent = false) {
// // // // // // // // // // // //     if (!silent) this.loading = true;
// // // // // // // // // // // //     let obs;
// // // // // // // // // // // //     if (this.isResident()) obs = this.api.getMyComplaints();
// // // // // // // // // // // //     else if (this.isStaff()) obs = this.api.getAssignedComplaints();
// // // // // // // // // // // //     else obs = this.api.getAllComplaints();

// // // // // // // // // // // //     obs.subscribe({
// // // // // // // // // // // //       next: list => {
// // // // // // // // // // // //         this.complaints = list ?? [];
// // // // // // // // // // // //         this.loading = false;
// // // // // // // // // // // //         if (this.selectedId) this.selected = this.complaints.find(c => c.id === this.selectedId) ?? null;
// // // // // // // // // // // //       },
// // // // // // // // // // // //       error: () => { this.loading = false; }
// // // // // // // // // // // //     });
// // // // // // // // // // // //   }

// // // // // // // // // // // //   setFilter(f: typeof this.activeFilter) { this.activeFilter = f; }

// // // // // // // // // // // //   get filtered(): Complaint[] {
// // // // // // // // // // // //     if (this.activeFilter === 'all') return this.complaints;
// // // // // // // // // // // //     return this.complaints.filter(c => {
// // // // // // // // // // // //       if (this.activeFilter === 'OPEN') return c.status === 'OPEN' || c.status === 'SUBMITTED' || c.status === 'ASSIGNED';
// // // // // // // // // // // //       if (this.activeFilter === 'IN_PROGRESS') return c.status === 'IN_PROGRESS';
// // // // // // // // // // // //       if (this.activeFilter === 'PROOF_SUBMITTED') return c.status === 'PROOF_SUBMITTED';
// // // // // // // // // // // //       if (this.activeFilter === 'RESOLVED') return c.status === 'RESOLVED' || c.status === 'CLOSED';
// // // // // // // // // // // //       return true;
// // // // // // // // // // // //     });
// // // // // // // // // // // //   }

// // // // // // // // // // // //   get filterCounts() {
// // // // // // // // // // // //     return {
// // // // // // // // // // // //       all: this.complaints.length,
// // // // // // // // // // // //       OPEN: this.complaints.filter(c => c.status === 'OPEN' || c.status === 'SUBMITTED' || c.status === 'ASSIGNED').length,
// // // // // // // // // // // //       IN_PROGRESS: this.complaints.filter(c => c.status === 'IN_PROGRESS').length,
// // // // // // // // // // // //       PROOF_SUBMITTED: this.complaints.filter(c => c.status === 'PROOF_SUBMITTED').length,
// // // // // // // // // // // //       RESOLVED: this.complaints.filter(c => c.status === 'RESOLVED' || c.status === 'CLOSED').length,
// // // // // // // // // // // //     };
// // // // // // // // // // // //   }

// // // // // // // // // // // //   select(c: Complaint) {
// // // // // // // // // // // //     this.selectedId = c.id;
// // // // // // // // // // // //     this.selected = c;  // show immediately with what we have
// // // // // // // // // // // //     this.errorMsg = '';
// // // // // // // // // // // //     this.successMsg = '';
// // // // // // // // // // // //     this.router.navigate([], { queryParams: { id: c.id }, queryParamsHandling: 'merge' });
// // // // // // // // // // // //     // Fetch full detail including images (list response has no images to keep payload small)
// // // // // // // // // // // //     this.api.getComplaintById(c.id).subscribe({
// // // // // // // // // // // //       next: detail => {
// // // // // // // // // // // //         if (this.selectedId === detail.id) this.selected = detail as any;
// // // // // // // // // // // //       },
// // // // // // // // // // // //       error: () => {} // keep basic version if detail fetch fails
// // // // // // // // // // // //     });
// // // // // // // // // // // //   }

// // // // // // // // // // // //   close() {
// // // // // // // // // // // //     this.selectedId = null;
// // // // // // // // // // // //     this.selected = null;
// // // // // // // // // // // //     this.router.navigate([], { queryParams: { id: null }, queryParamsHandling: 'merge' });
// // // // // // // // // // // //   }

// // // // // // // // // // // //   doAssign() {
// // // // // // // // // // // //     if (!this.selected || !this.assignStaffId) return;
// // // // // // // // // // // //     this.api.assignComplaint(this.selected.id, this.assignStaffId).subscribe({
// // // // // // // // // // // //       next: c => { this.selected = c; this.successMsg = 'Assigned.'; this.load(true); },
// // // // // // // // // // // //       error: e => this.errorMsg = e.error?.message || 'Failed to assign.'
// // // // // // // // // // // //     });
// // // // // // // // // // // //   }

// // // // // // // // // // // //   doReassign() {
// // // // // // // // // // // //     if (!this.selected || !this.assignStaffId) return;
// // // // // // // // // // // //     this.api.reassignComplaint(this.selected.id, this.assignStaffId).subscribe({
// // // // // // // // // // // //       next: c => { this.selected = c; this.successMsg = 'Reassigned.'; this.load(true); },
// // // // // // // // // // // //       error: e => this.errorMsg = e.error?.message || 'Failed to reassign.'
// // // // // // // // // // // //     });
// // // // // // // // // // // //   }

// // // // // // // // // // // //   doClose() {
// // // // // // // // // // // //     if (!this.selected) return;
// // // // // // // // // // // //     this.api.closeComplaint(this.selected.id, this.closeNote || '').subscribe({
// // // // // // // // // // // //       next: c => { this.selected = c; this.successMsg = 'Closed.'; this.load(true); this.closeNote = ''; },
// // // // // // // // // // // //       error: e => this.errorMsg = e.error?.message || 'Failed to close.'
// // // // // // // // // // // //     });
// // // // // // // // // // // //   }

// // // // // // // // // // // //   doStart() {
// // // // // // // // // // // //     if (!this.selected) return;
// // // // // // // // // // // //     this.api.startWork(this.selected.id).subscribe({
// // // // // // // // // // // //       next: c => { this.selected = c; this.successMsg = 'Started.'; this.load(true); },
// // // // // // // // // // // //       error: e => this.errorMsg = e.error?.message || 'Failed to start.'
// // // // // // // // // // // //     });
// // // // // // // // // // // //   }

// // // // // // // // // // // //   openProofModal() {
// // // // // // // // // // // //     this.proofNote = '';
// // // // // // // // // // // //     this.proofImage = null;
// // // // // // // // // // // //     this.showProofModal = true;
// // // // // // // // // // // //   }

// // // // // // // // // // // //   doSubmitProof() {
// // // // // // // // // // // //     if (!this.selected || !this.proofNote) return;
// // // // // // // // // // // //     this.api.submitProof(this.selected.id, { workNote: this.proofNote, imageBase64: this.proofImage })
// // // // // // // // // // // //       .subscribe({
// // // // // // // // // // // //         next: c => {
// // // // // // // // // // // //           this.selected = c;
// // // // // // // // // // // //           this.showProofModal = false;
// // // // // // // // // // // //           this.successMsg = 'Proof submitted for review.';
// // // // // // // // // // // //           this.load(true);
// // // // // // // // // // // //         },
// // // // // // // // // // // //         error: e => this.errorMsg = e.error?.message || 'Failed to submit proof.'
// // // // // // // // // // // //       });
// // // // // // // // // // // //   }

// // // // // // // // // // // //   openReviewModal(mode: 'APPROVE' | 'REJECT') {
// // // // // // // // // // // //     this.reviewMode = mode;
// // // // // // // // // // // //     this.reviewReason = '';
// // // // // // // // // // // //     this.showReviewModal = true;
// // // // // // // // // // // //   }

// // // // // // // // // // // //   doReviewProof() {
// // // // // // // // // // // //     if (!this.selected) return;
// // // // // // // // // // // //     const payload: any = { decision: this.reviewMode };
// // // // // // // // // // // //     if (this.reviewMode === 'REJECT') payload.rejectionReason = this.reviewReason || 'Not satisfactory';
// // // // // // // // // // // //     this.api.reviewProof(this.selected.id, payload).subscribe({
// // // // // // // // // // // //       next: c => {
// // // // // // // // // // // //         this.selected = c;
// // // // // // // // // // // //         this.showReviewModal = false;
// // // // // // // // // // // //         this.successMsg = this.reviewMode === 'APPROVE' ? 'Proof approved — marked as resolved.' : 'Proof rejected.';
// // // // // // // // // // // //         this.load(true);
// // // // // // // // // // // //       },
// // // // // // // // // // // //       error: e => this.errorMsg = e.error?.message || 'Failed to review proof.'
// // // // // // // // // // // //     });
// // // // // // // // // // // //   }

// // // // // // // // // // // //   doUpvote(c: Complaint) {
// // // // // // // // // // // //     this.api.upvote(c.id).subscribe({
// // // // // // // // // // // //       next: updated => {
// // // // // // // // // // // //         const i = this.complaints.findIndex(x => x.id === c.id);
// // // // // // // // // // // //         if (i >= 0) this.complaints[i] = updated;
// // // // // // // // // // // //         if (this.selected?.id === c.id) this.selected = updated;
// // // // // // // // // // // //       }
// // // // // // // // // // // //     });
// // // // // // // // // // // //   }

// // // // // // // // // // // //   onProofFile(e: any) {
// // // // // // // // // // // //     const file: File = e.target?.files?.[0];
// // // // // // // // // // // //     if (!file) return;
// // // // // // // // // // // //     const reader = new FileReader();
// // // // // // // // // // // //     reader.onload = () => {
// // // // // // // // // // // //       const result = reader.result as string;
// // // // // // // // // // // //       this.proofImage = result.split(',')[1] ?? '';
// // // // // // // // // // // //     };
// // // // // // // // // // // //     reader.readAsDataURL(file);
// // // // // // // // // // // //   }

// // // // // // // // // // // //   hasPhoto(c: Complaint): boolean { return !!(c.mediaBase64List && c.mediaBase64List.length > 0); }
// // // // // // // // // // // //   photoSrc(c: Complaint, i = 0): string { return 'data:image/jpeg;base64,' + (c.mediaBase64List?.[i] ?? ''); }
// // // // // // // // // // // //   proofPhoto(p: ComplaintProof): string { return 'data:image/jpeg;base64,' + (p.imageBase64 ?? ''); }

// // // // // // // // // // // //   timeAgo(iso: string): string {
// // // // // // // // // // // //     if (!iso) return '';
// // // // // // // // // // // //     const ms = Date.now() - new Date(iso).getTime();
// // // // // // // // // // // //     const m = Math.floor(ms / 60000);
// // // // // // // // // // // //     if (m < 1) return 'just now';
// // // // // // // // // // // //     if (m < 60) return `${m}m ago`;
// // // // // // // // // // // //     const h = Math.floor(m / 60);
// // // // // // // // // // // //     if (h < 24) return `${h}h ago`;
// // // // // // // // // // // //     const d = Math.floor(h / 24);
// // // // // // // // // // // //     if (d < 7) return `${d}d ago`;
// // // // // // // // // // // //     return new Date(iso).toLocaleDateString();
// // // // // // // // // // // //   }

// // // // // // // // // // // //   fullDate(iso: string): string {
// // // // // // // // // // // //     if (!iso) return '';
// // // // // // // // // // // //     return new Date(iso).toLocaleString();
// // // // // // // // // // // //   }

// // // // // // // // // // // //   statusClass(s: string): string { return `status-${s}`; }
// // // // // // // // // // // // }





// // // // // // // // // // // import { Component, OnInit, OnDestroy } from '@angular/core';
// // // // // // // // // // // import { CommonModule } from '@angular/common';
// // // // // // // // // // // import { FormsModule } from '@angular/forms';
// // // // // // // // // // // import { ActivatedRoute, Router, RouterModule } from '@angular/router';
// // // // // // // // // // // import { Subscription } from 'rxjs';
// // // // // // // // // // // import { AuthService } from '../../../core/services/auth.service';
// // // // // // // // // // // import { ApiService } from '../../../core/services/api.service';
// // // // // // // // // // // import { Complaint, User, ComplaintProof } from '../../../shared/models/models';

// // // // // // // // // // // @Component({
// // // // // // // // // // //   selector: 'app-complaint-list',
// // // // // // // // // // //   standalone: true,
// // // // // // // // // // //   imports: [CommonModule, FormsModule, RouterModule],
// // // // // // // // // // //   templateUrl: './complaint-list.component.html',
// // // // // // // // // // //   styleUrls: ['./complaint-list.component.scss']
// // // // // // // // // // // })
// // // // // // // // // // // export class ComplaintListComponent implements OnInit, OnDestroy {
// // // // // // // // // // //   user: any = null;
// // // // // // // // // // //   role: string | null = null;

// // // // // // // // // // //   complaints: Complaint[] = [];
// // // // // // // // // // //   loading = true;

// // // // // // // // // // //   activeFilter: 'all' | 'OPEN' | 'IN_PROGRESS' | 'PROOF_SUBMITTED' | 'RESOLVED' = 'all';
// // // // // // // // // // //   selectedId: number | null = null;
// // // // // // // // // // //   selected: Complaint | null = null;

// // // // // // // // // // //   staffList: User[] = [];          // all staff in community
// // // // // // // // // // //   categoryStaffList: User[] = [];   // staff assigned to selected complaint's category
// // // // // // // // // // //   assignStaffId: number | null = null;
// // // // // // // // // // //   closeNote = '';

// // // // // // // // // // //   proofNote = '';
// // // // // // // // // // //   proofImage: string | null = null;
// // // // // // // // // // //   showProofModal = false;

// // // // // // // // // // //   reviewReason = '';
// // // // // // // // // // //   showReviewModal = false;
// // // // // // // // // // //   reviewMode: 'APPROVE' | 'REJECT' = 'APPROVE';

// // // // // // // // // // //   errorMsg = '';
// // // // // // // // // // //   successMsg = '';

// // // // // // // // // // //   private pollHandle: any;
// // // // // // // // // // //   private subs: Subscription[] = [];

// // // // // // // // // // //   constructor(
// // // // // // // // // // //     private auth: AuthService,
// // // // // // // // // // //     private api: ApiService,
// // // // // // // // // // //     private route: ActivatedRoute,
// // // // // // // // // // //     private router: Router
// // // // // // // // // // //   ) {}

// // // // // // // // // // //   ngOnInit() {
// // // // // // // // // // //     this.user = this.auth.getCurrentUser();
// // // // // // // // // // //     this.role = this.user?.role;
// // // // // // // // // // //     this.subs.push(this.route.queryParams.subscribe(p => {
// // // // // // // // // // //       if (p['id']) this.selectedId = +p['id'];
// // // // // // // // // // //     }));
// // // // // // // // // // //     this.load();
// // // // // // // // // // //     this.pollHandle = setInterval(() => this.load(true), 10000);
// // // // // // // // // // //     if (this.isAdmin()) {
// // // // // // // // // // //       this.api.getAllUsers('STAFF').subscribe(s => this.staffList = s ?? []);
// // // // // // // // // // //     }
// // // // // // // // // // //   }

// // // // // // // // // // //   ngOnDestroy() {
// // // // // // // // // // //     if (this.pollHandle) clearInterval(this.pollHandle);
// // // // // // // // // // //     this.subs.forEach(s => s.unsubscribe());
// // // // // // // // // // //   }

// // // // // // // // // // //   isResident() { return this.role === 'RESIDENT'; }
// // // // // // // // // // //   isStaff() { return this.role === 'STAFF'; }
// // // // // // // // // // //   isAdmin() { return this.role === 'ADMIN' || this.role === 'CO_ADMIN'; }

// // // // // // // // // // //   private load(silent = false) {
// // // // // // // // // // //     if (!silent) this.loading = true;
// // // // // // // // // // //     let obs;
// // // // // // // // // // //     if (this.isResident()) obs = this.api.getMyComplaints();
// // // // // // // // // // //     else if (this.isStaff()) obs = this.api.getAssignedComplaints();
// // // // // // // // // // //     else obs = this.api.getAllComplaints();

// // // // // // // // // // //     obs.subscribe({
// // // // // // // // // // //       next: list => {
// // // // // // // // // // //         this.complaints = list ?? [];
// // // // // // // // // // //         this.loading = false;
// // // // // // // // // // //         if (this.selectedId) this.selected = this.complaints.find(c => c.id === this.selectedId) ?? null;
// // // // // // // // // // //       },
// // // // // // // // // // //       error: () => { this.loading = false; }
// // // // // // // // // // //     });
// // // // // // // // // // //   }

// // // // // // // // // // //   setFilter(f: typeof this.activeFilter) { this.activeFilter = f; }

// // // // // // // // // // //   get filtered(): Complaint[] {
// // // // // // // // // // //     if (this.activeFilter === 'all') return this.complaints;
// // // // // // // // // // //     return this.complaints.filter(c => {
// // // // // // // // // // //       if (this.activeFilter === 'OPEN') return c.status === 'OPEN' || c.status === 'SUBMITTED' || c.status === 'ASSIGNED';
// // // // // // // // // // //       if (this.activeFilter === 'IN_PROGRESS') return c.status === 'IN_PROGRESS';
// // // // // // // // // // //       if (this.activeFilter === 'PROOF_SUBMITTED') return c.status === 'PROOF_SUBMITTED';
// // // // // // // // // // //       if (this.activeFilter === 'RESOLVED') return c.status === 'RESOLVED' || c.status === 'CLOSED';
// // // // // // // // // // //       return true;
// // // // // // // // // // //     });
// // // // // // // // // // //   }

// // // // // // // // // // //   get filterCounts() {
// // // // // // // // // // //     return {
// // // // // // // // // // //       all: this.complaints.length,
// // // // // // // // // // //       OPEN: this.complaints.filter(c => c.status === 'OPEN' || c.status === 'SUBMITTED' || c.status === 'ASSIGNED').length,
// // // // // // // // // // //       IN_PROGRESS: this.complaints.filter(c => c.status === 'IN_PROGRESS').length,
// // // // // // // // // // //       PROOF_SUBMITTED: this.complaints.filter(c => c.status === 'PROOF_SUBMITTED').length,
// // // // // // // // // // //       RESOLVED: this.complaints.filter(c => c.status === 'RESOLVED' || c.status === 'CLOSED').length,
// // // // // // // // // // //     };
// // // // // // // // // // //   }

// // // // // // // // // // //   select(c: Complaint) {
// // // // // // // // // // //     this.selectedId = c.id;
// // // // // // // // // // //     this.selected = c;  // show immediately with what we have
// // // // // // // // // // //     this.errorMsg = '';
// // // // // // // // // // //     this.successMsg = '';
// // // // // // // // // // //     this.assignStaffId = null;
// // // // // // // // // // //     this.categoryStaffList = []; // reset while loading
// // // // // // // // // // //     this.router.navigate([], { queryParams: { id: c.id }, queryParamsHandling: 'merge' });
// // // // // // // // // // //     // Fetch full detail including images
// // // // // // // // // // //     this.api.getComplaintById(c.id).subscribe({
// // // // // // // // // // //       next: detail => {
// // // // // // // // // // //         if (this.selectedId === detail.id) this.selected = detail as any;
// // // // // // // // // // //       },
// // // // // // // // // // //       error: () => {}
// // // // // // // // // // //     });
// // // // // // // // // // //     // Load staff for this complaint's category only
// // // // // // // // // // //     if (c.categoryId) {
// // // // // // // // // // //       this.api.getStaffForCategory(c.categoryId).subscribe({
// // // // // // // // // // //         next: staff => {
// // // // // // // // // // //           this.categoryStaffList = staff ?? [];
// // // // // // // // // // //           // If no staff assigned to category, fall back to all staff
// // // // // // // // // // //           if (this.categoryStaffList.length === 0) {
// // // // // // // // // // //             this.categoryStaffList = this.staffList;
// // // // // // // // // // //           }
// // // // // // // // // // //         },
// // // // // // // // // // //         error: () => { this.categoryStaffList = this.staffList; }
// // // // // // // // // // //       });
// // // // // // // // // // //     } else {
// // // // // // // // // // //       this.categoryStaffList = this.staffList;
// // // // // // // // // // //     }
// // // // // // // // // // //   }

// // // // // // // // // // //   close() {
// // // // // // // // // // //     this.selectedId = null;
// // // // // // // // // // //     this.selected = null;
// // // // // // // // // // //     this.router.navigate([], { queryParams: { id: null }, queryParamsHandling: 'merge' });
// // // // // // // // // // //   }

// // // // // // // // // // //   doAssign() {
// // // // // // // // // // //     if (!this.selected || !this.assignStaffId) return;
// // // // // // // // // // //     this.api.assignComplaint(this.selected.id, this.assignStaffId).subscribe({
// // // // // // // // // // //       next: c => { this.selected = c; this.successMsg = 'Assigned.'; this.load(true); },
// // // // // // // // // // //       error: e => this.errorMsg = e.error?.message || 'Failed to assign.'
// // // // // // // // // // //     });
// // // // // // // // // // //   }

// // // // // // // // // // //   doReassign() {
// // // // // // // // // // //     if (!this.selected || !this.assignStaffId) return;
// // // // // // // // // // //     this.api.reassignComplaint(this.selected.id, this.assignStaffId).subscribe({
// // // // // // // // // // //       next: c => { this.selected = c; this.successMsg = 'Reassigned.'; this.load(true); },
// // // // // // // // // // //       error: e => this.errorMsg = e.error?.message || 'Failed to reassign.'
// // // // // // // // // // //     });
// // // // // // // // // // //   }

// // // // // // // // // // //   doClose() {
// // // // // // // // // // //     if (!this.selected) return;
// // // // // // // // // // //     this.api.closeComplaint(this.selected.id, this.closeNote || '').subscribe({
// // // // // // // // // // //       next: c => { this.selected = c; this.successMsg = 'Closed.'; this.load(true); this.closeNote = ''; },
// // // // // // // // // // //       error: e => this.errorMsg = e.error?.message || 'Failed to close.'
// // // // // // // // // // //     });
// // // // // // // // // // //   }

// // // // // // // // // // //   doStart() {
// // // // // // // // // // //     if (!this.selected) return;
// // // // // // // // // // //     this.api.startWork(this.selected.id).subscribe({
// // // // // // // // // // //       next: c => { this.selected = c; this.successMsg = 'Started.'; this.load(true); },
// // // // // // // // // // //       error: e => this.errorMsg = e.error?.message || 'Failed to start.'
// // // // // // // // // // //     });
// // // // // // // // // // //   }

// // // // // // // // // // //   openProofModal() {
// // // // // // // // // // //     this.proofNote = '';
// // // // // // // // // // //     this.proofImage = null;
// // // // // // // // // // //     this.showProofModal = true;
// // // // // // // // // // //   }

// // // // // // // // // // //   doSubmitProof() {
// // // // // // // // // // //     if (!this.selected || !this.proofNote) return;
// // // // // // // // // // //     this.api.submitProof(this.selected.id, { workNote: this.proofNote, imageBase64: this.proofImage })
// // // // // // // // // // //       .subscribe({
// // // // // // // // // // //         next: c => {
// // // // // // // // // // //           this.selected = c;
// // // // // // // // // // //           this.showProofModal = false;
// // // // // // // // // // //           this.successMsg = 'Proof submitted for review.';
// // // // // // // // // // //           this.load(true);
// // // // // // // // // // //         },
// // // // // // // // // // //         error: e => this.errorMsg = e.error?.message || 'Failed to submit proof.'
// // // // // // // // // // //       });
// // // // // // // // // // //   }

// // // // // // // // // // //   openReviewModal(mode: 'APPROVE' | 'REJECT') {
// // // // // // // // // // //     this.reviewMode = mode;
// // // // // // // // // // //     this.reviewReason = '';
// // // // // // // // // // //     this.showReviewModal = true;
// // // // // // // // // // //   }

// // // // // // // // // // //   doReviewProof() {
// // // // // // // // // // //     if (!this.selected) return;
// // // // // // // // // // //     const payload: any = { decision: this.reviewMode };
// // // // // // // // // // //     if (this.reviewMode === 'REJECT') payload.rejectionReason = this.reviewReason || 'Not satisfactory';
// // // // // // // // // // //     this.api.reviewProof(this.selected.id, payload).subscribe({
// // // // // // // // // // //       next: c => {
// // // // // // // // // // //         this.selected = c;
// // // // // // // // // // //         this.showReviewModal = false;
// // // // // // // // // // //         this.successMsg = this.reviewMode === 'APPROVE' ? 'Proof approved — marked as resolved.' : 'Proof rejected.';
// // // // // // // // // // //         this.load(true);
// // // // // // // // // // //       },
// // // // // // // // // // //       error: e => this.errorMsg = e.error?.message || 'Failed to review proof.'
// // // // // // // // // // //     });
// // // // // // // // // // //   }

// // // // // // // // // // //   doUpvote(c: Complaint) {
// // // // // // // // // // //     this.api.upvote(c.id).subscribe({
// // // // // // // // // // //       next: updated => {
// // // // // // // // // // //         const i = this.complaints.findIndex(x => x.id === c.id);
// // // // // // // // // // //         if (i >= 0) this.complaints[i] = updated;
// // // // // // // // // // //         if (this.selected?.id === c.id) this.selected = updated;
// // // // // // // // // // //       }
// // // // // // // // // // //     });
// // // // // // // // // // //   }

// // // // // // // // // // //   onProofFile(e: any) {
// // // // // // // // // // //     const file: File = e.target?.files?.[0];
// // // // // // // // // // //     if (!file) return;
// // // // // // // // // // //     const reader = new FileReader();
// // // // // // // // // // //     reader.onload = () => {
// // // // // // // // // // //       const result = reader.result as string;
// // // // // // // // // // //       this.proofImage = result.split(',')[1] ?? '';
// // // // // // // // // // //     };
// // // // // // // // // // //     reader.readAsDataURL(file);
// // // // // // // // // // //   }

// // // // // // // // // // //   hasPhoto(c: Complaint): boolean { return !!(c.mediaBase64List && c.mediaBase64List.length > 0); }
// // // // // // // // // // //   photoSrc(c: Complaint, i = 0): string { return 'data:image/jpeg;base64,' + (c.mediaBase64List?.[i] ?? ''); }
// // // // // // // // // // //   proofPhoto(p: ComplaintProof): string { return 'data:image/jpeg;base64,' + (p.imageBase64 ?? ''); }

// // // // // // // // // // //   timeAgo(iso: string): string {
// // // // // // // // // // //     if (!iso) return '';
// // // // // // // // // // //     const ms = Date.now() - new Date(iso).getTime();
// // // // // // // // // // //     const m = Math.floor(ms / 60000);
// // // // // // // // // // //     if (m < 1) return 'just now';
// // // // // // // // // // //     if (m < 60) return `${m}m ago`;
// // // // // // // // // // //     const h = Math.floor(m / 60);
// // // // // // // // // // //     if (h < 24) return `${h}h ago`;
// // // // // // // // // // //     const d = Math.floor(h / 24);
// // // // // // // // // // //     if (d < 7) return `${d}d ago`;
// // // // // // // // // // //     return new Date(iso).toLocaleDateString();
// // // // // // // // // // //   }

// // // // // // // // // // //   fullDate(iso: string): string {
// // // // // // // // // // //     if (!iso) return '';
// // // // // // // // // // //     return new Date(iso).toLocaleString();
// // // // // // // // // // //   }

// // // // // // // // // // //   statusClass(s: string): string { return `status-${s}`; }
// // // // // // // // // // // }


// // // // // // // // // // import { Component, OnInit, OnDestroy } from '@angular/core';
// // // // // // // // // // import { CommonModule } from '@angular/common';
// // // // // // // // // // import { FormsModule } from '@angular/forms';
// // // // // // // // // // import { ActivatedRoute, Router, RouterModule } from '@angular/router';
// // // // // // // // // // import { Subscription } from 'rxjs';
// // // // // // // // // // import { AuthService } from '../../../core/services/auth.service';
// // // // // // // // // // import { ApiService } from '../../../core/services/api.service';
// // // // // // // // // // import { Complaint, User, ComplaintProof } from '../../../shared/models/models';

// // // // // // // // // // @Component({
// // // // // // // // // //   selector: 'app-complaint-list',
// // // // // // // // // //   standalone: true,
// // // // // // // // // //   imports: [CommonModule, FormsModule, RouterModule],
// // // // // // // // // //   templateUrl: './complaint-list.component.html',
// // // // // // // // // //   styleUrls: ['./complaint-list.component.scss']
// // // // // // // // // // })
// // // // // // // // // // export class ComplaintListComponent implements OnInit, OnDestroy {
// // // // // // // // // //   user: any = null;
// // // // // // // // // //   role: string | null = null;

// // // // // // // // // //   complaints: Complaint[] = [];
// // // // // // // // // //   loading = true;

// // // // // // // // // //   activeFilter: 'all' | 'OPEN' | 'IN_PROGRESS' | 'PROOF_SUBMITTED' | 'RESOLVED' = 'all';
// // // // // // // // // //   selectedId: number | null = null;
// // // // // // // // // //   selected: Complaint | null = null;

// // // // // // // // // //   staffList: User[] = [];          // all staff in community
// // // // // // // // // //   categoryStaffList: User[] = [];   // staff assigned to selected complaint's category
// // // // // // // // // //   assignStaffId: number | null = null;
// // // // // // // // // //   closeNote = '';

// // // // // // // // // //   proofNote = '';
// // // // // // // // // //   proofImage: string | null = null;
// // // // // // // // // //   showProofModal = false;

// // // // // // // // // //   reviewReason = '';
// // // // // // // // // //   showReviewModal = false;
// // // // // // // // // //   reviewMode: 'APPROVE' | 'REJECT' = 'APPROVE';

// // // // // // // // // //   errorMsg = '';
// // // // // // // // // //   successMsg = '';

// // // // // // // // // //   private pollHandle: any;
// // // // // // // // // //   private subs: Subscription[] = [];

// // // // // // // // // //   constructor(
// // // // // // // // // //     private auth: AuthService,
// // // // // // // // // //     private api: ApiService,
// // // // // // // // // //     private route: ActivatedRoute,
// // // // // // // // // //     private router: Router
// // // // // // // // // //   ) {}

// // // // // // // // // //   ngOnInit() {
// // // // // // // // // //     this.user = this.auth.getCurrentUser();
// // // // // // // // // //     this.role = this.user?.role;
// // // // // // // // // //     this.subs.push(this.route.queryParams.subscribe(p => {
// // // // // // // // // //       if (p['id']) this.selectedId = +p['id'];
// // // // // // // // // //     }));
// // // // // // // // // //     this.load();
// // // // // // // // // //     this.pollHandle = setInterval(() => this.load(true), 10000);
// // // // // // // // // //     if (this.isAdmin()) {
// // // // // // // // // //       this.api.getAllUsers('STAFF').subscribe(s => this.staffList = s ?? []);
// // // // // // // // // //     }
// // // // // // // // // //   }

// // // // // // // // // //   ngOnDestroy() {
// // // // // // // // // //     if (this.pollHandle) clearInterval(this.pollHandle);
// // // // // // // // // //     this.subs.forEach(s => s.unsubscribe());
// // // // // // // // // //   }

// // // // // // // // // //   isResident() { return this.role === 'RESIDENT'; }
// // // // // // // // // //   isStaff() { return this.role === 'STAFF'; }
// // // // // // // // // //   isAdmin() { return this.role === 'ADMIN' || this.role === 'CO_ADMIN'; }

// // // // // // // // // //   private load(silent = false) {
// // // // // // // // // //     if (!silent) this.loading = true;
// // // // // // // // // //     let obs;
// // // // // // // // // //     if (this.isResident()) obs = this.api.getMyComplaints();
// // // // // // // // // //     else if (this.isStaff()) obs = this.api.getAssignedComplaints();
// // // // // // // // // //     else obs = this.api.getAllComplaints();

// // // // // // // // // //     obs.subscribe({
// // // // // // // // // //       next: list => {
// // // // // // // // // //         this.complaints = list ?? [];
// // // // // // // // // //         this.loading = false;
// // // // // // // // // //         if (this.selectedId) {
// // // // // // // // // //           const found = this.complaints.find(c => c.id === this.selectedId) ?? null;
// // // // // // // // // //           if (found && (!this.selected || this.selected.id !== found.id)) {
// // // // // // // // // //             // Auto-selected from URL (e.g. notification click) — load detail + staff
// // // // // // // // // //             this.selected = found;
// // // // // // // // // //             this.loadDetailAndStaff(found);
// // // // // // // // // //           } else if (this.selected) {
// // // // // // // // // //             // Polling refresh — keep selected but update data
// // // // // // // // // //             const refreshed = this.complaints.find(c => c.id === this.selected!.id);
// // // // // // // // // //             if (refreshed) this.selected = { ...this.selected, ...refreshed };
// // // // // // // // // //           }
// // // // // // // // // //         }
// // // // // // // // // //       },
// // // // // // // // // //       error: () => { this.loading = false; }
// // // // // // // // // //     });
// // // // // // // // // //   }

// // // // // // // // // //   setFilter(f: typeof this.activeFilter) { this.activeFilter = f; }

// // // // // // // // // //   get filtered(): Complaint[] {
// // // // // // // // // //     if (this.activeFilter === 'all') return this.complaints;
// // // // // // // // // //     return this.complaints.filter(c => {
// // // // // // // // // //       if (this.activeFilter === 'OPEN') return c.status === 'OPEN' || c.status === 'SUBMITTED' || c.status === 'ASSIGNED';
// // // // // // // // // //       if (this.activeFilter === 'IN_PROGRESS') return c.status === 'IN_PROGRESS';
// // // // // // // // // //       if (this.activeFilter === 'PROOF_SUBMITTED') return c.status === 'PROOF_SUBMITTED';
// // // // // // // // // //       if (this.activeFilter === 'RESOLVED') return c.status === 'RESOLVED' || c.status === 'CLOSED';
// // // // // // // // // //       return true;
// // // // // // // // // //     });
// // // // // // // // // //   }

// // // // // // // // // //   get filterCounts() {
// // // // // // // // // //     return {
// // // // // // // // // //       all: this.complaints.length,
// // // // // // // // // //       OPEN: this.complaints.filter(c => c.status === 'OPEN' || c.status === 'SUBMITTED' || c.status === 'ASSIGNED').length,
// // // // // // // // // //       IN_PROGRESS: this.complaints.filter(c => c.status === 'IN_PROGRESS').length,
// // // // // // // // // //       PROOF_SUBMITTED: this.complaints.filter(c => c.status === 'PROOF_SUBMITTED').length,
// // // // // // // // // //       RESOLVED: this.complaints.filter(c => c.status === 'RESOLVED' || c.status === 'CLOSED').length,
// // // // // // // // // //     };
// // // // // // // // // //   }

// // // // // // // // // //   /** Loads full complaint detail (with images) and category-specific staff list */
// // // // // // // // // //   private loadDetailAndStaff(c: Complaint) {
// // // // // // // // // //     // Fetch full detail with images
// // // // // // // // // //     this.api.getComplaintById(c.id).subscribe({
// // // // // // // // // //       next: detail => {
// // // // // // // // // //         if (this.selectedId === detail.id) this.selected = detail as any;
// // // // // // // // // //       },
// // // // // // // // // //       error: () => {}
// // // // // // // // // //     });
// // // // // // // // // //     // Load staff for this complaint's category
// // // // // // // // // //     if (c.categoryId) {
// // // // // // // // // //       this.api.getStaffForCategory(c.categoryId).subscribe({
// // // // // // // // // //         next: staff => {
// // // // // // // // // //           this.categoryStaffList = (staff && staff.length > 0) ? staff : this.staffList;
// // // // // // // // // //         },
// // // // // // // // // //         error: () => { this.categoryStaffList = this.staffList; }
// // // // // // // // // //       });
// // // // // // // // // //     } else {
// // // // // // // // // //       this.categoryStaffList = this.staffList;
// // // // // // // // // //     }
// // // // // // // // // //   }

// // // // // // // // // //   select(c: Complaint) {
// // // // // // // // // //     this.selectedId = c.id;
// // // // // // // // // //     this.selected = c;  // show immediately with what we have
// // // // // // // // // //     this.errorMsg = '';
// // // // // // // // // //     this.successMsg = '';
// // // // // // // // // //     this.assignStaffId = null;
// // // // // // // // // //     this.categoryStaffList = []; // reset while loading
// // // // // // // // // //     this.router.navigate([], { queryParams: { id: c.id }, queryParamsHandling: 'merge' });
// // // // // // // // // //     this.loadDetailAndStaff(c);
// // // // // // // // // //   }

// // // // // // // // // //   close() {
// // // // // // // // // //     this.selectedId = null;
// // // // // // // // // //     this.selected = null;
// // // // // // // // // //     this.router.navigate([], { queryParams: { id: null }, queryParamsHandling: 'merge' });
// // // // // // // // // //   }

// // // // // // // // // //   doAssign() {
// // // // // // // // // //     if (!this.selected || !this.assignStaffId) return;
// // // // // // // // // //     this.api.assignComplaint(this.selected.id, this.assignStaffId).subscribe({
// // // // // // // // // //       next: c => { this.selected = c; this.successMsg = 'Assigned.'; this.load(true); },
// // // // // // // // // //       error: e => this.errorMsg = e.error?.message || 'Failed to assign.'
// // // // // // // // // //     });
// // // // // // // // // //   }

// // // // // // // // // //   doReassign() {
// // // // // // // // // //     if (!this.selected || !this.assignStaffId) return;
// // // // // // // // // //     this.api.reassignComplaint(this.selected.id, this.assignStaffId).subscribe({
// // // // // // // // // //       next: c => { this.selected = c; this.successMsg = 'Reassigned.'; this.load(true); },
// // // // // // // // // //       error: e => this.errorMsg = e.error?.message || 'Failed to reassign.'
// // // // // // // // // //     });
// // // // // // // // // //   }

// // // // // // // // // //   doClose() {
// // // // // // // // // //     if (!this.selected) return;
// // // // // // // // // //     this.api.closeComplaint(this.selected.id, this.closeNote || '').subscribe({
// // // // // // // // // //       next: c => { this.selected = c; this.successMsg = 'Closed.'; this.load(true); this.closeNote = ''; },
// // // // // // // // // //       error: e => this.errorMsg = e.error?.message || 'Failed to close.'
// // // // // // // // // //     });
// // // // // // // // // //   }

// // // // // // // // // //   doStart() {
// // // // // // // // // //     if (!this.selected) return;
// // // // // // // // // //     this.api.startWork(this.selected.id).subscribe({
// // // // // // // // // //       next: c => { this.selected = c; this.successMsg = 'Started.'; this.load(true); },
// // // // // // // // // //       error: e => this.errorMsg = e.error?.message || 'Failed to start.'
// // // // // // // // // //     });
// // // // // // // // // //   }

// // // // // // // // // //   openProofModal() {
// // // // // // // // // //     this.proofNote = '';
// // // // // // // // // //     this.proofImage = null;
// // // // // // // // // //     this.showProofModal = true;
// // // // // // // // // //   }

// // // // // // // // // //   doSubmitProof() {
// // // // // // // // // //     if (!this.selected || !this.proofNote) return;
// // // // // // // // // //     this.api.submitProof(this.selected.id, { workNote: this.proofNote, imageBase64: this.proofImage })
// // // // // // // // // //       .subscribe({
// // // // // // // // // //         next: c => {
// // // // // // // // // //           this.selected = c;
// // // // // // // // // //           this.showProofModal = false;
// // // // // // // // // //           this.successMsg = 'Proof submitted for review.';
// // // // // // // // // //           this.load(true);
// // // // // // // // // //         },
// // // // // // // // // //         error: e => this.errorMsg = e.error?.message || 'Failed to submit proof.'
// // // // // // // // // //       });
// // // // // // // // // //   }

// // // // // // // // // //   openReviewModal(mode: 'APPROVE' | 'REJECT') {
// // // // // // // // // //     this.reviewMode = mode;
// // // // // // // // // //     this.reviewReason = '';
// // // // // // // // // //     this.showReviewModal = true;
// // // // // // // // // //   }

// // // // // // // // // //   doReviewProof() {
// // // // // // // // // //     if (!this.selected) return;
// // // // // // // // // //     const payload: any = { decision: this.reviewMode };
// // // // // // // // // //     if (this.reviewMode === 'REJECT') payload.rejectionReason = this.reviewReason || 'Not satisfactory';
// // // // // // // // // //     this.api.reviewProof(this.selected.id, payload).subscribe({
// // // // // // // // // //       next: c => {
// // // // // // // // // //         this.selected = c;
// // // // // // // // // //         this.showReviewModal = false;
// // // // // // // // // //         this.successMsg = this.reviewMode === 'APPROVE' ? 'Proof approved — marked as resolved.' : 'Proof rejected.';
// // // // // // // // // //         this.load(true);
// // // // // // // // // //       },
// // // // // // // // // //       error: e => this.errorMsg = e.error?.message || 'Failed to review proof.'
// // // // // // // // // //     });
// // // // // // // // // //   }

// // // // // // // // // //   doUpvote(c: Complaint) {
// // // // // // // // // //     this.api.upvote(c.id).subscribe({
// // // // // // // // // //       next: updated => {
// // // // // // // // // //         const i = this.complaints.findIndex(x => x.id === c.id);
// // // // // // // // // //         if (i >= 0) this.complaints[i] = updated;
// // // // // // // // // //         if (this.selected?.id === c.id) this.selected = updated;
// // // // // // // // // //       }
// // // // // // // // // //     });
// // // // // // // // // //   }

// // // // // // // // // //   onProofFile(e: any) {
// // // // // // // // // //     const file: File = e.target?.files?.[0];
// // // // // // // // // //     if (!file) return;
// // // // // // // // // //     const reader = new FileReader();
// // // // // // // // // //     reader.onload = () => {
// // // // // // // // // //       const result = reader.result as string;
// // // // // // // // // //       this.proofImage = result.split(',')[1] ?? '';
// // // // // // // // // //     };
// // // // // // // // // //     reader.readAsDataURL(file);
// // // // // // // // // //   }

// // // // // // // // // //   hasPhoto(c: Complaint): boolean { return !!(c.mediaBase64List && c.mediaBase64List.length > 0); }
// // // // // // // // // //   photoSrc(c: Complaint, i = 0): string { return 'data:image/jpeg;base64,' + (c.mediaBase64List?.[i] ?? ''); }
// // // // // // // // // //   proofPhoto(p: ComplaintProof): string { return 'data:image/jpeg;base64,' + (p.imageBase64 ?? ''); }

// // // // // // // // // //   timeAgo(iso: string): string {
// // // // // // // // // //     if (!iso) return '';
// // // // // // // // // //     const ms = Date.now() - new Date(iso).getTime();
// // // // // // // // // //     const m = Math.floor(ms / 60000);
// // // // // // // // // //     if (m < 1) return 'just now';
// // // // // // // // // //     if (m < 60) return `${m}m ago`;
// // // // // // // // // //     const h = Math.floor(m / 60);
// // // // // // // // // //     if (h < 24) return `${h}h ago`;
// // // // // // // // // //     const d = Math.floor(h / 24);
// // // // // // // // // //     if (d < 7) return `${d}d ago`;
// // // // // // // // // //     return new Date(iso).toLocaleDateString();
// // // // // // // // // //   }

// // // // // // // // // //   fullDate(iso: string): string {
// // // // // // // // // //     if (!iso) return '';
// // // // // // // // // //     return new Date(iso).toLocaleString();
// // // // // // // // // //   }

// // // // // // // // // //   statusClass(s: string): string { return `status-${s}`; }
// // // // // // // // // // }



// // // // // // // // // import { Component, OnInit, OnDestroy } from '@angular/core';
// // // // // // // // // import { CommonModule } from '@angular/common';
// // // // // // // // // import { FormsModule } from '@angular/forms';
// // // // // // // // // import { ActivatedRoute, Router, RouterModule } from '@angular/router';
// // // // // // // // // import { Subscription } from 'rxjs';
// // // // // // // // // import { AuthService } from '../../../core/services/auth.service';
// // // // // // // // // import { ApiService } from '../../../core/services/api.service';
// // // // // // // // // import { Complaint, User, ComplaintProof } from '../../../shared/models/models';

// // // // // // // // // @Component({
// // // // // // // // //   selector: 'app-complaint-list',
// // // // // // // // //   standalone: true,
// // // // // // // // //   imports: [CommonModule, FormsModule, RouterModule],
// // // // // // // // //   templateUrl: './complaint-list.component.html',
// // // // // // // // //   styleUrls: ['./complaint-list.component.scss']
// // // // // // // // // })
// // // // // // // // // export class ComplaintListComponent implements OnInit, OnDestroy {
// // // // // // // // //   user: any = null;
// // // // // // // // //   role: string | null = null;

// // // // // // // // //   complaints: Complaint[] = [];
// // // // // // // // //   loading = true;

// // // // // // // // //   activeFilter: 'all' | 'OPEN' | 'IN_PROGRESS' | 'PROOF_SUBMITTED' | 'RESOLVED' = 'all';
// // // // // // // // //   selectedId: number | null = null;
// // // // // // // // //   selected: Complaint | null = null;

// // // // // // // // //   staffList: User[] = [];          // all staff in community
// // // // // // // // //   categoryStaffList: User[] = [];   // staff assigned to selected complaint's category
// // // // // // // // //   assignStaffId: number | null = null;
// // // // // // // // //   closeNote = '';

// // // // // // // // //   proofNote = '';
// // // // // // // // //   proofImage: string | null = null;
// // // // // // // // //   showProofModal = false;

// // // // // // // // //   reviewReason = '';
// // // // // // // // //   showReviewModal = false;
// // // // // // // // //   reviewMode: 'APPROVE' | 'REJECT' = 'APPROVE';

// // // // // // // // //   errorMsg = '';
// // // // // // // // //   successMsg = '';

// // // // // // // // //   private pollHandle: any;
// // // // // // // // //   private subs: Subscription[] = [];

// // // // // // // // //   constructor(
// // // // // // // // //     private auth: AuthService,
// // // // // // // // //     private api: ApiService,
// // // // // // // // //     private route: ActivatedRoute,
// // // // // // // // //     private router: Router
// // // // // // // // //   ) {}

// // // // // // // // //   ngOnInit() {
// // // // // // // // //     this.user = this.auth.getCurrentUser();
// // // // // // // // //     this.role = this.user?.role;
// // // // // // // // //     this.subs.push(this.route.queryParams.subscribe(p => {
// // // // // // // // //       if (p['id']) this.selectedId = +p['id'];
// // // // // // // // //     }));
// // // // // // // // //     this.load();
// // // // // // // // //     this.pollHandle = setInterval(() => this.load(true), 10000);
// // // // // // // // //     if (this.isAdmin()) {
// // // // // // // // //       this.api.getAllUsers('STAFF').subscribe(s => this.staffList = s ?? []);
// // // // // // // // //     }
// // // // // // // // //   }

// // // // // // // // //   ngOnDestroy() {
// // // // // // // // //     if (this.pollHandle) clearInterval(this.pollHandle);
// // // // // // // // //     this.subs.forEach(s => s.unsubscribe());
// // // // // // // // //   }

// // // // // // // // //   isResident() { return this.role === 'RESIDENT'; }
// // // // // // // // //   isStaff() { return this.role === 'STAFF'; }
// // // // // // // // //   isAdmin() { return this.role === 'ADMIN' || this.role === 'CO_ADMIN'; }

// // // // // // // // //   private load(silent = false) {
// // // // // // // // //     if (!silent) this.loading = true;
// // // // // // // // //     let obs;
// // // // // // // // //     if (this.isResident()) obs = this.api.getMyComplaints();
// // // // // // // // //     else if (this.isStaff()) obs = this.api.getAssignedComplaints();
// // // // // // // // //     else obs = this.api.getAllComplaints();

// // // // // // // // //     obs.subscribe({
// // // // // // // // //       next: list => {
// // // // // // // // //         this.complaints = list ?? [];
// // // // // // // // //         this.loading = false;
// // // // // // // // //         if (this.selectedId) {
// // // // // // // // //           const found = this.complaints.find(c => c.id === this.selectedId) ?? null;
// // // // // // // // //           if (found && (!this.selected || this.selected.id !== found.id)) {
// // // // // // // // //             // Auto-selected from URL (e.g. notification click) — load detail + staff
// // // // // // // // //             this.selected = found;
// // // // // // // // //             this.loadDetailAndStaff(found);
// // // // // // // // //           } else if (this.selected) {
// // // // // // // // //             // Polling refresh — keep selected but update data
// // // // // // // // //             const refreshed = this.complaints.find(c => c.id === this.selected!.id);
// // // // // // // // //             if (refreshed) this.selected = { ...this.selected, ...refreshed };
// // // // // // // // //           }
// // // // // // // // //         }
// // // // // // // // //       },
// // // // // // // // //       error: () => { this.loading = false; }
// // // // // // // // //     });
// // // // // // // // //   }

// // // // // // // // //   setFilter(f: typeof this.activeFilter) { this.activeFilter = f; }

// // // // // // // // //   get filtered(): Complaint[] {
// // // // // // // // //     if (this.activeFilter === 'all') return this.complaints;
// // // // // // // // //     return this.complaints.filter(c => {
// // // // // // // // //       if (this.activeFilter === 'OPEN') return c.status === 'OPEN' || c.status === 'SUBMITTED' || c.status === 'ASSIGNED';
// // // // // // // // //       if (this.activeFilter === 'IN_PROGRESS') return c.status === 'IN_PROGRESS';
// // // // // // // // //       if (this.activeFilter === 'PROOF_SUBMITTED') return c.status === 'PROOF_SUBMITTED';
// // // // // // // // //       if (this.activeFilter === 'RESOLVED') return c.status === 'RESOLVED' || c.status === 'CLOSED';
// // // // // // // // //       return true;
// // // // // // // // //     });
// // // // // // // // //   }

// // // // // // // // //   get filterCounts() {
// // // // // // // // //     return {
// // // // // // // // //       all: this.complaints.length,
// // // // // // // // //       OPEN: this.complaints.filter(c => c.status === 'OPEN' || c.status === 'SUBMITTED' || c.status === 'ASSIGNED').length,
// // // // // // // // //       IN_PROGRESS: this.complaints.filter(c => c.status === 'IN_PROGRESS').length,
// // // // // // // // //       PROOF_SUBMITTED: this.complaints.filter(c => c.status === 'PROOF_SUBMITTED').length,
// // // // // // // // //       RESOLVED: this.complaints.filter(c => c.status === 'RESOLVED' || c.status === 'CLOSED').length,
// // // // // // // // //     };
// // // // // // // // //   }

// // // // // // // // //   /** Loads full complaint detail (with images) and category-specific staff list */
// // // // // // // // //   private loadDetailAndStaff(c: Complaint) {
// // // // // // // // //     // Fetch full detail with images
// // // // // // // // //     this.api.getComplaintById(c.id).subscribe({
// // // // // // // // //       next: detail => {
// // // // // // // // //         if (this.selectedId === detail.id) this.selected = detail as any;
// // // // // // // // //       },
// // // // // // // // //       error: () => {}
// // // // // // // // //     });
// // // // // // // // //     // Load staff for this complaint's category
// // // // // // // // //     if (c.categoryId) {
// // // // // // // // //       this.api.getStaffForCategory(c.categoryId).subscribe({
// // // // // // // // //         next: staff => {
// // // // // // // // //           this.categoryStaffList = (staff && staff.length > 0) ? staff : this.staffList;
// // // // // // // // //         },
// // // // // // // // //         error: () => { this.categoryStaffList = this.staffList; }
// // // // // // // // //       });
// // // // // // // // //     } else {
// // // // // // // // //       this.categoryStaffList = this.staffList;
// // // // // // // // //     }
// // // // // // // // //   }

// // // // // // // // //   select(c: Complaint) {
// // // // // // // // //     this.selectedId = c.id;
// // // // // // // // //     this.selected = c;  // show immediately with what we have
// // // // // // // // //     this.errorMsg = '';
// // // // // // // // //     this.successMsg = '';
// // // // // // // // //     this.assignStaffId = null;
// // // // // // // // //     this.categoryStaffList = []; // reset while loading
// // // // // // // // //     this.router.navigate([], { queryParams: { id: c.id }, queryParamsHandling: 'merge' });
// // // // // // // // //     this.loadDetailAndStaff(c);
// // // // // // // // //   }

// // // // // // // // //   close() {
// // // // // // // // //     this.selectedId = null;
// // // // // // // // //     this.selected = null;
// // // // // // // // //     this.router.navigate([], { queryParams: { id: null }, queryParamsHandling: 'merge' });
// // // // // // // // //   }

// // // // // // // // //   doAssign() {
// // // // // // // // //     if (!this.selected || !this.assignStaffId) return;
// // // // // // // // //     this.api.assignComplaint(this.selected.id, this.assignStaffId).subscribe({
// // // // // // // // //       next: c => { this.selected = c; this.successMsg = 'Assigned.'; this.load(true); },
// // // // // // // // //       error: e => this.errorMsg = e.error?.message || 'Failed to assign.'
// // // // // // // // //     });
// // // // // // // // //   }

// // // // // // // // //   doReassign() {
// // // // // // // // //     if (!this.selected || !this.assignStaffId) return;
// // // // // // // // //     this.api.reassignComplaint(this.selected.id, this.assignStaffId).subscribe({
// // // // // // // // //       next: c => { this.selected = c; this.successMsg = 'Reassigned.'; this.load(true); },
// // // // // // // // //       error: e => this.errorMsg = e.error?.message || 'Failed to reassign.'
// // // // // // // // //     });
// // // // // // // // //   }

// // // // // // // // //   doClose() {
// // // // // // // // //     if (!this.selected) return;
// // // // // // // // //     this.api.closeComplaint(this.selected.id, this.closeNote || '').subscribe({
// // // // // // // // //       next: c => { this.selected = c; this.successMsg = 'Closed.'; this.load(true); this.closeNote = ''; },
// // // // // // // // //       error: e => this.errorMsg = e.error?.message || 'Failed to close.'
// // // // // // // // //     });
// // // // // // // // //   }

// // // // // // // // //   doStart() {
// // // // // // // // //     if (!this.selected) return;
// // // // // // // // //     this.api.startWork(this.selected.id).subscribe({
// // // // // // // // //       next: c => { this.selected = c; this.successMsg = 'Started.'; this.load(true); },
// // // // // // // // //       error: e => this.errorMsg = e.error?.message || 'Failed to start.'
// // // // // // // // //     });
// // // // // // // // //   }

// // // // // // // // //   openProofModal() {
// // // // // // // // //     this.proofNote = '';
// // // // // // // // //     this.proofImage = null;
// // // // // // // // //     this.showProofModal = true;
// // // // // // // // //   }

// // // // // // // // //   doSubmitProof() {
// // // // // // // // //     if (!this.selected || !this.proofNote) return;
// // // // // // // // //     this.api.submitProof(this.selected.id, { workNote: this.proofNote, imageBase64: this.proofImage })
// // // // // // // // //       .subscribe({
// // // // // // // // //         next: c => {
// // // // // // // // //           this.selected = c;
// // // // // // // // //           this.showProofModal = false;
// // // // // // // // //           this.successMsg = 'Proof submitted for review.';
// // // // // // // // //           this.load(true);
// // // // // // // // //         },
// // // // // // // // //         error: e => this.errorMsg = e.error?.message || 'Failed to submit proof.'
// // // // // // // // //       });
// // // // // // // // //   }

// // // // // // // // //   openReviewModal(mode: 'APPROVE' | 'REJECT') {
// // // // // // // // //     this.reviewMode = mode;
// // // // // // // // //     this.reviewReason = '';
// // // // // // // // //     this.showReviewModal = true;
// // // // // // // // //   }

// // // // // // // // //   doReviewProof() {
// // // // // // // // //     if (!this.selected) return;
// // // // // // // // //     const payload: any = { decision: this.reviewMode };
// // // // // // // // //     if (this.reviewMode === 'REJECT') payload.rejectionReason = this.reviewReason || 'Not satisfactory';
// // // // // // // // //     this.api.reviewProof(this.selected.id, payload).subscribe({
// // // // // // // // //       next: c => {
// // // // // // // // //         this.selected = c;
// // // // // // // // //         this.showReviewModal = false;
// // // // // // // // //         this.successMsg = this.reviewMode === 'APPROVE' ? 'Proof approved — marked as resolved.' : 'Proof rejected.';
// // // // // // // // //         this.load(true);
// // // // // // // // //       },
// // // // // // // // //       error: e => this.errorMsg = e.error?.message || 'Failed to review proof.'
// // // // // // // // //     });
// // // // // // // // //   }

// // // // // // // // //   doUpvote(c: Complaint) {
// // // // // // // // //     this.api.upvote(c.id).subscribe({
// // // // // // // // //       next: updated => {
// // // // // // // // //         const i = this.complaints.findIndex(x => x.id === c.id);
// // // // // // // // //         if (i >= 0) this.complaints[i] = updated;
// // // // // // // // //         if (this.selected?.id === c.id) this.selected = updated;
// // // // // // // // //       }
// // // // // // // // //     });
// // // // // // // // //   }

// // // // // // // // //   onProofFile(e: any) {
// // // // // // // // //     const file: File = e.target?.files?.[0];
// // // // // // // // //     if (!file) return;
// // // // // // // // //     const reader = new FileReader();
// // // // // // // // //     reader.onload = () => {
// // // // // // // // //       const result = reader.result as string;
// // // // // // // // //       this.proofImage = result.split(',')[1] ?? '';
// // // // // // // // //     };
// // // // // // // // //     reader.readAsDataURL(file);
// // // // // // // // //   }

// // // // // // // // //   hasPhoto(c: Complaint): boolean {
// // // // // // // // //     return !!(c.thumbnailBase64 || (c.mediaBase64List && c.mediaBase64List.length > 0));
// // // // // // // // //   }
// // // // // // // // //   photoSrc(c: Complaint, i = 0): string {
// // // // // // // // //     const b64 = i === 0
// // // // // // // // //       ? (c.mediaBase64List?.[0] ?? c.thumbnailBase64 ?? '')
// // // // // // // // //       : (c.mediaBase64List?.[i] ?? '');
// // // // // // // // //     if (!b64) return '';
// // // // // // // // //     if (b64.startsWith('/9j/')) return 'data:image/jpeg;base64,' + b64;
// // // // // // // // //     if (b64.startsWith('iVBOR')) return 'data:image/png;base64,' + b64;
// // // // // // // // //     return 'data:image/jpeg;base64,' + b64;
// // // // // // // // //   }
// // // // // // // // //   proofPhoto(p: ComplaintProof): string { return 'data:image/jpeg;base64,' + (p.imageBase64 ?? ''); }

// // // // // // // // //   timeAgo(iso: string): string {
// // // // // // // // //     if (!iso) return '';
// // // // // // // // //     const ms = Date.now() - new Date(iso).getTime();
// // // // // // // // //     const m = Math.floor(ms / 60000);
// // // // // // // // //     if (m < 1) return 'just now';
// // // // // // // // //     if (m < 60) return `${m}m ago`;
// // // // // // // // //     const h = Math.floor(m / 60);
// // // // // // // // //     if (h < 24) return `${h}h ago`;
// // // // // // // // //     const d = Math.floor(h / 24);
// // // // // // // // //     if (d < 7) return `${d}d ago`;
// // // // // // // // //     return new Date(iso).toLocaleDateString();
// // // // // // // // //   }

// // // // // // // // //   fullDate(iso: string): string {
// // // // // // // // //     if (!iso) return '';
// // // // // // // // //     return new Date(iso).toLocaleString();
// // // // // // // // //   }

// // // // // // // // //   statusClass(s: string): string { return `status-${s}`; }
// // // // // // // // // }


// // // // // // // // import { Component, OnInit, OnDestroy } from '@angular/core';
// // // // // // // // import { CommonModule } from '@angular/common';
// // // // // // // // import { FormsModule } from '@angular/forms';
// // // // // // // // import { ActivatedRoute, Router, RouterModule } from '@angular/router';
// // // // // // // // import { Subscription } from 'rxjs';
// // // // // // // // import { AuthService } from '../../../core/services/auth.service';
// // // // // // // // import { ApiService } from '../../../core/services/api.service';
// // // // // // // // import { Complaint, User, ComplaintProof } from '../../../shared/models/models';

// // // // // // // // @Component({
// // // // // // // //   selector: 'app-complaint-list',
// // // // // // // //   standalone: true,
// // // // // // // //   imports: [CommonModule, FormsModule, RouterModule],
// // // // // // // //   templateUrl: './complaint-list.component.html',
// // // // // // // //   styleUrls: ['./complaint-list.component.scss']
// // // // // // // // })
// // // // // // // // export class ComplaintListComponent implements OnInit, OnDestroy {
// // // // // // // //   user: any = null;
// // // // // // // //   role: string | null = null;
// // // // // // // //   currentUsername = '';

// // // // // // // //   complaints: Complaint[] = [];
// // // // // // // //   loading = true;

// // // // // // // //   activeFilter: 'all' | 'OPEN' | 'IN_PROGRESS' | 'PROOF_SUBMITTED' | 'RESOLVED' = 'all';
// // // // // // // //   selectedId: number | null = null;
// // // // // // // //   selected: Complaint | null = null;

// // // // // // // //   staffList: User[] = [];          // all staff in community
// // // // // // // //   categoryStaffList: User[] = [];   // staff assigned to selected complaint's category
// // // // // // // //   assignStaffId: number | null = null;
// // // // // // // //   closeNote = '';

// // // // // // // //   proofNote = '';
// // // // // // // //   proofImage: string | null = null;
// // // // // // // //   showProofModal = false;

// // // // // // // //   reviewReason = '';
// // // // // // // //   showReviewModal = false;
// // // // // // // //   reviewMode: 'APPROVE' | 'REJECT' = 'APPROVE';

// // // // // // // //   errorMsg = '';
// // // // // // // //   successMsg = '';

// // // // // // // //   private pollHandle: any;
// // // // // // // //   private subs: Subscription[] = [];

// // // // // // // //   constructor(
// // // // // // // //     private auth: AuthService,
// // // // // // // //     private api: ApiService,
// // // // // // // //     private route: ActivatedRoute,
// // // // // // // //     private router: Router
// // // // // // // //   ) {}

// // // // // // // //   ngOnInit() {
// // // // // // // //     this.user = this.auth.getCurrentUser();
// // // // // // // //     this.role = this.user?.role;
// // // // // // // //     this.currentUsername = this.user?.username ?? '';
// // // // // // // //     this.subs.push(this.route.queryParams.subscribe(p => {
// // // // // // // //       if (p['id']) this.selectedId = +p['id'];
// // // // // // // //     }));
// // // // // // // //     this.load();
// // // // // // // //     this.pollHandle = setInterval(() => this.load(true), 10000);
// // // // // // // //     if (this.isAdmin()) {
// // // // // // // //       this.api.getAllUsers('STAFF').subscribe(s => this.staffList = s ?? []);
// // // // // // // //     }
// // // // // // // //   }

// // // // // // // //   ngOnDestroy() {
// // // // // // // //     if (this.pollHandle) clearInterval(this.pollHandle);
// // // // // // // //     this.subs.forEach(s => s.unsubscribe());
// // // // // // // //   }

// // // // // // // //   isResident() { return this.role === 'RESIDENT'; }
// // // // // // // //   isStaff() { return this.role === 'STAFF'; }

// // // // // // // //   /** Returns the most recent rejected proof submitted by this staff member */
// // // // // // // //   myRejectedProof(c: any): any {
// // // // // // // //     if (!c?.proofs?.length) return null;
// // // // // // // //     return c.proofs.find((p: any) =>
// // // // // // // //       p.submittedByUsername === this.currentUsername && p.status === 'REJECTED'
// // // // // // // //     ) ?? null;
// // // // // // // //   }

// // // // // // // //   /** True when this complaint was rejected and reassigned back to this staff */
// // // // // // // //   isRework(c: any): boolean {
// // // // // // // //     if (!c || c.status !== 'ASSIGNED') return false;
// // // // // // // //     return !!(c.assignedToUsername === this.currentUsername && this.myRejectedProof(c));
// // // // // // // //   }

// // // // // // // //   /** True when staff has a rejected proof but complaint is now assigned to someone else */
// // // // // // // //   isReassignedAway(c: any): boolean {
// // // // // // // //     if (!c) return false;
// // // // // // // //     if (c.assignedToUsername === this.currentUsername) return false;
// // // // // // // //     return !!(c.proofs?.some((p: any) =>
// // // // // // // //       p.submittedByUsername === this.currentUsername && p.status === 'REJECTED'
// // // // // // // //     ));
// // // // // // // //   }
// // // // // // // //   isAdmin() { return this.role === 'ADMIN' || this.role === 'CO_ADMIN'; }

// // // // // // // //   private load(silent = false) {
// // // // // // // //     if (!silent) this.loading = true;
// // // // // // // //     let obs;
// // // // // // // //     if (this.isResident()) obs = this.api.getMyComplaints();
// // // // // // // //     else if (this.isStaff()) obs = this.api.getMyWorkHistory(); // full history including rejected/reassigned
// // // // // // // //     else obs = this.api.getAllComplaints();

// // // // // // // //     obs.subscribe({
// // // // // // // //       next: list => {
// // // // // // // //         this.complaints = list ?? [];
// // // // // // // //         this.loading = false;
// // // // // // // //         if (this.selectedId) {
// // // // // // // //           const found = this.complaints.find(c => c.id === this.selectedId) ?? null;
// // // // // // // //           if (found && (!this.selected || this.selected.id !== found.id)) {
// // // // // // // //             // Auto-selected from URL (e.g. notification click) — load detail + staff
// // // // // // // //             this.selected = found;
// // // // // // // //             this.loadDetailAndStaff(found);
// // // // // // // //           } else if (this.selected) {
// // // // // // // //             // Polling refresh — keep selected but update data
// // // // // // // //             const refreshed = this.complaints.find(c => c.id === this.selected!.id);
// // // // // // // //             if (refreshed) this.selected = { ...this.selected, ...refreshed };
// // // // // // // //           }
// // // // // // // //         }
// // // // // // // //       },
// // // // // // // //       error: () => { this.loading = false; }
// // // // // // // //     });
// // // // // // // //   }

// // // // // // // //   setFilter(f: typeof this.activeFilter) { this.activeFilter = f; }

// // // // // // // //   get filtered(): Complaint[] {
// // // // // // // //     if (this.activeFilter === 'all') return this.complaints;
// // // // // // // //     return this.complaints.filter(c => {
// // // // // // // //       if (this.activeFilter === 'OPEN') return c.status === 'OPEN' || c.status === 'SUBMITTED' || c.status === 'ASSIGNED';
// // // // // // // //       if (this.activeFilter === 'IN_PROGRESS') return c.status === 'IN_PROGRESS';
// // // // // // // //       if (this.activeFilter === 'PROOF_SUBMITTED') return c.status === 'PROOF_SUBMITTED';
// // // // // // // //       if (this.activeFilter === 'RESOLVED') return c.status === 'RESOLVED' || c.status === 'CLOSED';
// // // // // // // //       return true;
// // // // // // // //     });
// // // // // // // //   }

// // // // // // // //   get filterCounts() {
// // // // // // // //     return {
// // // // // // // //       all: this.complaints.length,
// // // // // // // //       OPEN: this.complaints.filter(c => c.status === 'OPEN' || c.status === 'SUBMITTED' || c.status === 'ASSIGNED').length,
// // // // // // // //       IN_PROGRESS: this.complaints.filter(c => c.status === 'IN_PROGRESS').length,
// // // // // // // //       PROOF_SUBMITTED: this.complaints.filter(c => c.status === 'PROOF_SUBMITTED').length,
// // // // // // // //       RESOLVED: this.complaints.filter(c => c.status === 'RESOLVED' || c.status === 'CLOSED').length,
// // // // // // // //     };
// // // // // // // //   }

// // // // // // // //   /** Loads full complaint detail (with images) and category-specific staff list */
// // // // // // // //   private loadDetailAndStaff(c: Complaint) {
// // // // // // // //     // Fetch full detail with images
// // // // // // // //     this.api.getComplaintById(c.id).subscribe({
// // // // // // // //       next: detail => {
// // // // // // // //         if (this.selectedId === detail.id) this.selected = detail as any;
// // // // // // // //       },
// // // // // // // //       error: () => {}
// // // // // // // //     });
// // // // // // // //     // Load staff for this complaint's category
// // // // // // // //     if (c.categoryId) {
// // // // // // // //       this.api.getStaffForCategory(c.categoryId).subscribe({
// // // // // // // //         next: staff => {
// // // // // // // //           this.categoryStaffList = (staff && staff.length > 0) ? staff : this.staffList;
// // // // // // // //         },
// // // // // // // //         error: () => { this.categoryStaffList = this.staffList; }
// // // // // // // //       });
// // // // // // // //     } else {
// // // // // // // //       this.categoryStaffList = this.staffList;
// // // // // // // //     }
// // // // // // // //   }

// // // // // // // //   select(c: Complaint) {
// // // // // // // //     this.selectedId = c.id;
// // // // // // // //     this.selected = c;  // show immediately with what we have
// // // // // // // //     this.errorMsg = '';
// // // // // // // //     this.successMsg = '';
// // // // // // // //     this.assignStaffId = null;
// // // // // // // //     this.categoryStaffList = []; // reset while loading
// // // // // // // //     this.router.navigate([], { queryParams: { id: c.id }, queryParamsHandling: 'merge' });
// // // // // // // //     this.loadDetailAndStaff(c);
// // // // // // // //   }

// // // // // // // //   close() {
// // // // // // // //     this.selectedId = null;
// // // // // // // //     this.selected = null;
// // // // // // // //     this.router.navigate([], { queryParams: { id: null }, queryParamsHandling: 'merge' });
// // // // // // // //   }

// // // // // // // //   doAssign() {
// // // // // // // //     if (!this.selected || !this.assignStaffId) return;
// // // // // // // //     this.api.assignComplaint(this.selected.id, this.assignStaffId).subscribe({
// // // // // // // //       next: c => { this.selected = c; this.successMsg = 'Assigned.'; this.load(true); },
// // // // // // // //       error: e => this.errorMsg = e.error?.message || 'Failed to assign.'
// // // // // // // //     });
// // // // // // // //   }

// // // // // // // //   doReassign() {
// // // // // // // //     if (!this.selected || !this.assignStaffId) return;
// // // // // // // //     this.api.reassignComplaint(this.selected.id, this.assignStaffId).subscribe({
// // // // // // // //       next: c => { this.selected = c; this.successMsg = 'Reassigned.'; this.load(true); },
// // // // // // // //       error: e => this.errorMsg = e.error?.message || 'Failed to reassign.'
// // // // // // // //     });
// // // // // // // //   }

// // // // // // // //   doClose() {
// // // // // // // //     if (!this.selected) return;
// // // // // // // //     this.api.closeComplaint(this.selected.id, this.closeNote || '').subscribe({
// // // // // // // //       next: c => { this.selected = c; this.successMsg = 'Closed.'; this.load(true); this.closeNote = ''; },
// // // // // // // //       error: e => this.errorMsg = e.error?.message || 'Failed to close.'
// // // // // // // //     });
// // // // // // // //   }

// // // // // // // //   doStart() {
// // // // // // // //     if (!this.selected) return;
// // // // // // // //     this.api.startWork(this.selected.id).subscribe({
// // // // // // // //       next: c => { this.selected = c; this.successMsg = 'Started.'; this.load(true); },
// // // // // // // //       error: e => this.errorMsg = e.error?.message || 'Failed to start.'
// // // // // // // //     });
// // // // // // // //   }

// // // // // // // //   openProofModal() {
// // // // // // // //     this.proofNote = '';
// // // // // // // //     this.proofImage = null;
// // // // // // // //     this.showProofModal = true;
// // // // // // // //   }

// // // // // // // //   doSubmitProof() {
// // // // // // // //     if (!this.selected || !this.proofNote) return;
// // // // // // // //     this.api.submitProof(this.selected.id, { workNote: this.proofNote, imageBase64: this.proofImage })
// // // // // // // //       .subscribe({
// // // // // // // //         next: c => {
// // // // // // // //           this.selected = c;
// // // // // // // //           this.showProofModal = false;
// // // // // // // //           this.successMsg = 'Proof submitted for review.';
// // // // // // // //           this.load(true);
// // // // // // // //         },
// // // // // // // //         error: e => this.errorMsg = e.error?.message || 'Failed to submit proof.'
// // // // // // // //       });
// // // // // // // //   }

// // // // // // // //   openReviewModal(mode: 'APPROVE' | 'REJECT') {
// // // // // // // //     this.reviewMode = mode;
// // // // // // // //     this.reviewReason = '';
// // // // // // // //     this.showReviewModal = true;
// // // // // // // //   }

// // // // // // // //   doReviewProof() {
// // // // // // // //     if (!this.selected) return;
// // // // // // // //     const payload: any = { decision: this.reviewMode };
// // // // // // // //     if (this.reviewMode === 'REJECT') payload.rejectionReason = this.reviewReason || 'Not satisfactory';
// // // // // // // //     this.api.reviewProof(this.selected.id, payload).subscribe({
// // // // // // // //       next: c => {
// // // // // // // //         this.selected = c;
// // // // // // // //         this.showReviewModal = false;
// // // // // // // //         this.successMsg = this.reviewMode === 'APPROVE' ? 'Proof approved — marked as resolved.' : 'Proof rejected.';
// // // // // // // //         this.load(true);
// // // // // // // //       },
// // // // // // // //       error: e => this.errorMsg = e.error?.message || 'Failed to review proof.'
// // // // // // // //     });
// // // // // // // //   }

// // // // // // // //   doUpvote(c: Complaint) {
// // // // // // // //     this.api.upvote(c.id).subscribe({
// // // // // // // //       next: updated => {
// // // // // // // //         const i = this.complaints.findIndex(x => x.id === c.id);
// // // // // // // //         if (i >= 0) this.complaints[i] = updated;
// // // // // // // //         if (this.selected?.id === c.id) this.selected = updated;
// // // // // // // //       }
// // // // // // // //     });
// // // // // // // //   }

// // // // // // // //   onProofFile(e: any) {
// // // // // // // //     const file: File = e.target?.files?.[0];
// // // // // // // //     if (!file) return;
// // // // // // // //     const reader = new FileReader();
// // // // // // // //     reader.onload = () => {
// // // // // // // //       const result = reader.result as string;
// // // // // // // //       this.proofImage = result.split(',')[1] ?? '';
// // // // // // // //     };
// // // // // // // //     reader.readAsDataURL(file);
// // // // // // // //   }

// // // // // // // //   hasPhoto(c: Complaint): boolean {
// // // // // // // //     return !!(c.thumbnailBase64 || (c.mediaBase64List && c.mediaBase64List.length > 0));
// // // // // // // //   }
// // // // // // // //   photoSrc(c: Complaint, i = 0): string {
// // // // // // // //     const b64 = i === 0
// // // // // // // //       ? (c.mediaBase64List?.[0] ?? c.thumbnailBase64 ?? '')
// // // // // // // //       : (c.mediaBase64List?.[i] ?? '');
// // // // // // // //     if (!b64) return '';
// // // // // // // //     if (b64.startsWith('/9j/')) return 'data:image/jpeg;base64,' + b64;
// // // // // // // //     if (b64.startsWith('iVBOR')) return 'data:image/png;base64,' + b64;
// // // // // // // //     return 'data:image/jpeg;base64,' + b64;
// // // // // // // //   }
// // // // // // // //   proofPhoto(p: ComplaintProof): string { return 'data:image/jpeg;base64,' + (p.imageBase64 ?? ''); }

// // // // // // // //   timeAgo(iso: string): string {
// // // // // // // //     if (!iso) return '';
// // // // // // // //     const ms = Date.now() - new Date(iso).getTime();
// // // // // // // //     const m = Math.floor(ms / 60000);
// // // // // // // //     if (m < 1) return 'just now';
// // // // // // // //     if (m < 60) return `${m}m ago`;
// // // // // // // //     const h = Math.floor(m / 60);
// // // // // // // //     if (h < 24) return `${h}h ago`;
// // // // // // // //     const d = Math.floor(h / 24);
// // // // // // // //     if (d < 7) return `${d}d ago`;
// // // // // // // //     return new Date(iso).toLocaleDateString();
// // // // // // // //   }

// // // // // // // //   fullDate(iso: string): string {
// // // // // // // //     if (!iso) return '';
// // // // // // // //     return new Date(iso).toLocaleString();
// // // // // // // //   }

// // // // // // // //   statusClass(s: string): string { return `status-${s}`; }
// // // // // // // // }


// // // // // // // import { Component, OnInit, OnDestroy } from '@angular/core';
// // // // // // // import { CommonModule } from '@angular/common';
// // // // // // // import { FormsModule } from '@angular/forms';
// // // // // // // import { ActivatedRoute, Router, RouterModule } from '@angular/router';
// // // // // // // import { Subscription } from 'rxjs';
// // // // // // // import { AuthService } from '../../../core/services/auth.service';
// // // // // // // import { ApiService } from '../../../core/services/api.service';
// // // // // // // import { Complaint, User, ComplaintProof } from '../../../shared/models/models';

// // // // // // // @Component({
// // // // // // //   selector: 'app-complaint-list',
// // // // // // //   standalone: true,
// // // // // // //   imports: [CommonModule, FormsModule, RouterModule],
// // // // // // //   templateUrl: './complaint-list.component.html',
// // // // // // //   styleUrls: ['./complaint-list.component.scss']
// // // // // // // })
// // // // // // // export class ComplaintListComponent implements OnInit, OnDestroy {
// // // // // // //   user: any = null;
// // // // // // //   role: string | null = null;
// // // // // // //   currentUsername = '';

// // // // // // //   complaints: Complaint[] = [];
// // // // // // //   loading = true;

// // // // // // //   activeFilter: 'all' | 'OPEN' | 'IN_PROGRESS' | 'PROOF_SUBMITTED' | 'RESOLVED' = 'all';
// // // // // // //   selectedId: number | null = null;
// // // // // // //   selected: Complaint | null = null;

// // // // // // //   staffList: User[] = [];          // all staff in community
// // // // // // //   categoryStaffList: User[] = [];   // staff assigned to selected complaint's category
// // // // // // //   assignStaffId: number | null = null;
// // // // // // //   closeNote = '';

// // // // // // //   proofNote = '';
// // // // // // //   proofImage: string | null = null;
// // // // // // //   showProofModal = false;

// // // // // // //   reviewReason = '';
// // // // // // //   showReviewModal = false;
// // // // // // //   reviewMode: 'APPROVE' | 'REJECT' = 'APPROVE';

// // // // // // //   errorMsg = '';
// // // // // // //   successMsg = '';

// // // // // // //   private pollHandle: any;
// // // // // // //   private subs: Subscription[] = [];

// // // // // // //   constructor(
// // // // // // //     private auth: AuthService,
// // // // // // //     private api: ApiService,
// // // // // // //     private route: ActivatedRoute,
// // // // // // //     private router: Router
// // // // // // //   ) {}

// // // // // // //   ngOnInit() {
// // // // // // //     this.user = this.auth.getCurrentUser();
// // // // // // //     this.role = this.user?.role;
// // // // // // //     this.currentUsername = this.user?.username ?? '';
// // // // // // //     this.subs.push(this.route.queryParams.subscribe(p => {
// // // // // // //       if (p['id']) this.selectedId = +p['id'];
// // // // // // //     }));
// // // // // // //     this.load();
// // // // // // //     this.pollHandle = setInterval(() => this.load(true), 10000);
// // // // // // //     if (this.isAdmin()) {
// // // // // // //       this.api.getAllUsers('STAFF').subscribe(s => this.staffList = s ?? []);
// // // // // // //     }
// // // // // // //   }

// // // // // // //   ngOnDestroy() {
// // // // // // //     if (this.pollHandle) clearInterval(this.pollHandle);
// // // // // // //     this.subs.forEach(s => s.unsubscribe());
// // // // // // //   }

// // // // // // //   isResident() { return this.role === 'RESIDENT'; }
// // // // // // //   isStaff() { return this.role === 'STAFF'; }

// // // // // // //   /** Returns the most recent rejected proof submitted by this staff member */
// // // // // // //   myRejectedProof(c: any): any {
// // // // // // //     if (!c?.proofs?.length) return null;
// // // // // // //     return c.proofs.find((p: any) =>
// // // // // // //       p.submittedByUsername === this.currentUsername && p.status === 'REJECTED'
// // // // // // //     ) ?? null;
// // // // // // //   }

// // // // // // //   /** True when this complaint was rejected and reassigned back to this staff */
// // // // // // //   isRework(c: any): boolean {
// // // // // // //     if (!c || c.status !== 'ASSIGNED') return false;
// // // // // // //     return !!(c.assignedToUsername === this.currentUsername && this.myRejectedProof(c));
// // // // // // //   }

// // // // // // //   /** True when staff has a rejected proof but complaint is now assigned to someone else */
// // // // // // //   isReassignedAway(c: any): boolean {
// // // // // // //     if (!c) return false;
// // // // // // //     if (c.assignedToUsername === this.currentUsername) return false;
// // // // // // //     return !!(c.proofs?.some((p: any) =>
// // // // // // //       p.submittedByUsername === this.currentUsername && p.status === 'REJECTED'
// // // // // // //     ));
// // // // // // //   }
// // // // // // //   isAdmin() { return this.role === 'ADMIN' || this.role === 'CO_ADMIN'; }

// // // // // // //   private load(silent = false) {
// // // // // // //     if (!silent) this.loading = true;
// // // // // // //     let obs;
// // // // // // //     if (this.isResident()) obs = this.api.getMyComplaints();
// // // // // // //     else if (this.isStaff()) obs = this.api.getMyWorkHistory(); // full history including rejected/reassigned
// // // // // // //     else obs = this.api.getAllComplaints();

// // // // // // //     obs.subscribe({
// // // // // // //       next: list => {
// // // // // // //         this.complaints = list ?? [];
// // // // // // //         this.loading = false;
// // // // // // //         if (this.selectedId) {
// // // // // // //           const found = this.complaints.find(c => c.id === this.selectedId) ?? null;
// // // // // // //           if (found && (!this.selected || this.selected.id !== found.id)) {
// // // // // // //             // Auto-selected from URL (e.g. notification click) — load detail + staff
// // // // // // //             this.selected = found;
// // // // // // //             this.loadDetailAndStaff(found);
// // // // // // //           } else if (this.selected) {
// // // // // // //             // Polling refresh — keep selected but update data
// // // // // // //             const refreshed = this.complaints.find(c => c.id === this.selected!.id);
// // // // // // //             if (refreshed) this.selected = { ...this.selected, ...refreshed };
// // // // // // //           }
// // // // // // //         }
// // // // // // //       },
// // // // // // //       error: () => { this.loading = false; }
// // // // // // //     });
// // // // // // //   }

// // // // // // //   setFilter(f: typeof this.activeFilter) { this.activeFilter = f; }

// // // // // // //   get filtered(): Complaint[] {
// // // // // // //     if (this.activeFilter === 'all') return this.complaints;
// // // // // // //     return this.complaints.filter(c => {
// // // // // // //       if (this.activeFilter === 'OPEN') return c.status === 'OPEN' || c.status === 'SUBMITTED' || c.status === 'ASSIGNED';
// // // // // // //       if (this.activeFilter === 'IN_PROGRESS') return c.status === 'IN_PROGRESS';
// // // // // // //       if (this.activeFilter === 'PROOF_SUBMITTED') return c.status === 'PROOF_SUBMITTED';
// // // // // // //       if (this.activeFilter === 'RESOLVED') return c.status === 'RESOLVED' || c.status === 'CLOSED';
// // // // // // //       return true;
// // // // // // //     });
// // // // // // //   }

// // // // // // //   get filterCounts() {
// // // // // // //     return {
// // // // // // //       all: this.complaints.length,
// // // // // // //       OPEN: this.complaints.filter(c => c.status === 'OPEN' || c.status === 'SUBMITTED' || c.status === 'ASSIGNED').length,
// // // // // // //       IN_PROGRESS: this.complaints.filter(c => c.status === 'IN_PROGRESS').length,
// // // // // // //       PROOF_SUBMITTED: this.complaints.filter(c => c.status === 'PROOF_SUBMITTED').length,
// // // // // // //       RESOLVED: this.complaints.filter(c => c.status === 'RESOLVED' || c.status === 'CLOSED').length,
// // // // // // //     };
// // // // // // //   }

// // // // // // //   /** Loads full complaint detail (with images) and category-specific staff list */
// // // // // // //   private loadDetailAndStaff(c: Complaint) {
// // // // // // //     // Fetch full detail with images
// // // // // // //     this.api.getComplaintById(c.id).subscribe({
// // // // // // //       next: detail => {
// // // // // // //         if (this.selectedId === detail.id) this.selected = detail as any;
// // // // // // //       },
// // // // // // //       error: () => {}
// // // // // // //     });
// // // // // // //     // Load staff for this complaint's category
// // // // // // //     if (c.categoryId) {
// // // // // // //       this.api.getStaffForCategory(c.categoryId).subscribe({
// // // // // // //         next: staff => {
// // // // // // //           this.categoryStaffList = (staff && staff.length > 0) ? staff : this.staffList;
// // // // // // //         },
// // // // // // //         error: () => { this.categoryStaffList = this.staffList; }
// // // // // // //       });
// // // // // // //     } else {
// // // // // // //       this.categoryStaffList = this.staffList;
// // // // // // //     }
// // // // // // //   }

// // // // // // //   select(c: Complaint) {
// // // // // // //     this.selectedId = c.id;
// // // // // // //     this.selected = c;  // show immediately with what we have
// // // // // // //     this.errorMsg = '';
// // // // // // //     this.successMsg = '';
// // // // // // //     this.assignStaffId = null;
// // // // // // //     this.categoryStaffList = []; // reset while loading
// // // // // // //     this.router.navigate([], { queryParams: { id: c.id }, queryParamsHandling: 'merge' });
// // // // // // //     this.loadDetailAndStaff(c);
// // // // // // //   }

// // // // // // //   close() {
// // // // // // //     this.selectedId = null;
// // // // // // //     this.selected = null;
// // // // // // //     this.router.navigate([], { queryParams: { id: null }, queryParamsHandling: 'merge' });
// // // // // // //   }

// // // // // // //   doAssign() {
// // // // // // //     if (!this.selected || !this.assignStaffId) return;
// // // // // // //     this.api.assignComplaint(this.selected.id, this.assignStaffId).subscribe({
// // // // // // //       next: c => { this.selected = c; this.successMsg = 'Assigned.'; this.load(true); },
// // // // // // //       error: e => this.errorMsg = e.error?.message || 'Failed to assign.'
// // // // // // //     });
// // // // // // //   }

// // // // // // //   doReassign() {
// // // // // // //     if (!this.selected || !this.assignStaffId) return;
// // // // // // //     this.api.reassignComplaint(this.selected.id, this.assignStaffId).subscribe({
// // // // // // //       next: c => { this.selected = c; this.successMsg = 'Reassigned.'; this.load(true); },
// // // // // // //       error: e => this.errorMsg = e.error?.message || 'Failed to reassign.'
// // // // // // //     });
// // // // // // //   }

// // // // // // //   doClose() {
// // // // // // //     if (!this.selected) return;
// // // // // // //     this.api.closeComplaint(this.selected.id, this.closeNote || '').subscribe({
// // // // // // //       next: c => { this.selected = c; this.successMsg = 'Closed.'; this.load(true); this.closeNote = ''; },
// // // // // // //       error: e => this.errorMsg = e.error?.message || 'Failed to close.'
// // // // // // //     });
// // // // // // //   }

// // // // // // //   doStart() {
// // // // // // //     if (!this.selected) return;
// // // // // // //     this.api.startWork(this.selected.id).subscribe({
// // // // // // //       next: c => { this.selected = c; this.successMsg = 'Started.'; this.load(true); },
// // // // // // //       error: e => this.errorMsg = e.error?.message || 'Failed to start.'
// // // // // // //     });
// // // // // // //   }

// // // // // // //   openProofModal() {
// // // // // // //     this.proofNote = '';
// // // // // // //     this.proofImage = null;
// // // // // // //     this.showProofModal = true;
// // // // // // //   }

// // // // // // //   doSubmitProof() {
// // // // // // //     if (!this.selected || !this.proofNote) return;
// // // // // // //     this.api.submitProof(this.selected.id, { workNote: this.proofNote, imageBase64: this.proofImage })
// // // // // // //       .subscribe({
// // // // // // //         next: c => {
// // // // // // //           this.selected = c;
// // // // // // //           this.showProofModal = false;
// // // // // // //           this.successMsg = 'Proof submitted for review.';
// // // // // // //           this.load(true);
// // // // // // //         },
// // // // // // //         error: e => this.errorMsg = e.error?.message || 'Failed to submit proof.'
// // // // // // //       });
// // // // // // //   }

// // // // // // //   openReviewModal(mode: 'APPROVE' | 'REJECT') {
// // // // // // //     this.reviewMode = mode;
// // // // // // //     this.reviewReason = '';
// // // // // // //     this.reassignStaffId = null; // reset staff selection each time modal opens
// // // // // // //     this.showReviewModal = true;
// // // // // // //   }

// // // // // // //   doReviewProof() {
// // // // // // //     if (!this.selected) return;
// // // // // // //     const payload: any = { decision: this.reviewMode };
// // // // // // //     if (this.reviewMode === 'REJECT') {
// // // // // // //       payload.rejectionReason = this.reviewReason || 'Not satisfactory';
// // // // // // //       // Pass reassignToStaffId only if a different staff was explicitly selected
// // // // // // //       if (this.reassignStaffId) {
// // // // // // //         payload.reassignToStaffId = this.reassignStaffId;
// // // // // // //       }
// // // // // // //     }
// // // // // // //     this.api.reviewProof(this.selected.id, payload).subscribe({
// // // // // // //       next: c => {
// // // // // // //         this.selected = c;
// // // // // // //         this.showReviewModal = false;
// // // // // // //         this.reassignStaffId = null; // reset after submit
// // // // // // //         this.successMsg = this.reviewMode === 'APPROVE' ? 'Proof approved — marked as resolved.' : 'Proof rejected.';
// // // // // // //         this.load(true);
// // // // // // //       },
// // // // // // //       error: e => this.errorMsg = e.error?.message || 'Failed to review proof.'
// // // // // // //     });
// // // // // // //   }

// // // // // // //   doUpvote(c: Complaint) {
// // // // // // //     this.api.upvote(c.id).subscribe({
// // // // // // //       next: updated => {
// // // // // // //         const i = this.complaints.findIndex(x => x.id === c.id);
// // // // // // //         if (i >= 0) this.complaints[i] = updated;
// // // // // // //         if (this.selected?.id === c.id) this.selected = updated;
// // // // // // //       }
// // // // // // //     });
// // // // // // //   }

// // // // // // //   onProofFile(e: any) {
// // // // // // //     const file: File = e.target?.files?.[0];
// // // // // // //     if (!file) return;
// // // // // // //     const reader = new FileReader();
// // // // // // //     reader.onload = () => {
// // // // // // //       const result = reader.result as string;
// // // // // // //       this.proofImage = result.split(',')[1] ?? '';
// // // // // // //     };
// // // // // // //     reader.readAsDataURL(file);
// // // // // // //   }

// // // // // // //   hasPhoto(c: Complaint): boolean {
// // // // // // //     return !!(c.thumbnailBase64 || (c.mediaBase64List && c.mediaBase64List.length > 0));
// // // // // // //   }
// // // // // // //   photoSrc(c: Complaint, i = 0): string {
// // // // // // //     const b64 = i === 0
// // // // // // //       ? (c.mediaBase64List?.[0] ?? c.thumbnailBase64 ?? '')
// // // // // // //       : (c.mediaBase64List?.[i] ?? '');
// // // // // // //     if (!b64) return '';
// // // // // // //     if (b64.startsWith('/9j/')) return 'data:image/jpeg;base64,' + b64;
// // // // // // //     if (b64.startsWith('iVBOR')) return 'data:image/png;base64,' + b64;
// // // // // // //     return 'data:image/jpeg;base64,' + b64;
// // // // // // //   }
// // // // // // //   proofPhoto(p: ComplaintProof): string { return 'data:image/jpeg;base64,' + (p.imageBase64 ?? ''); }

// // // // // // //   timeAgo(iso: string): string {
// // // // // // //     if (!iso) return '';
// // // // // // //     const ms = Date.now() - new Date(iso).getTime();
// // // // // // //     const m = Math.floor(ms / 60000);
// // // // // // //     if (m < 1) return 'just now';
// // // // // // //     if (m < 60) return `${m}m ago`;
// // // // // // //     const h = Math.floor(m / 60);
// // // // // // //     if (h < 24) return `${h}h ago`;
// // // // // // //     const d = Math.floor(h / 24);
// // // // // // //     if (d < 7) return `${d}d ago`;
// // // // // // //     return new Date(iso).toLocaleDateString();
// // // // // // //   }

// // // // // // //   fullDate(iso: string): string {
// // // // // // //     if (!iso) return '';
// // // // // // //     return new Date(iso).toLocaleString();
// // // // // // //   }

// // // // // // //   statusClass(s: string): string { return `status-${s}`; }
// // // // // // // }


// // // // // // import { Component, OnInit, OnDestroy } from '@angular/core';
// // // // // // import { CommonModule } from '@angular/common';
// // // // // // import { FormsModule } from '@angular/forms';
// // // // // // import { ActivatedRoute, Router, RouterModule } from '@angular/router';
// // // // // // import { Subscription } from 'rxjs';
// // // // // // import { AuthService } from '../../../core/services/auth.service';
// // // // // // import { ApiService } from '../../../core/services/api.service';
// // // // // // import { Complaint, User, ComplaintProof } from '../../../shared/models/models';

// // // // // // @Component({
// // // // // //   selector: 'app-complaint-list',
// // // // // //   standalone: true,
// // // // // //   imports: [CommonModule, FormsModule, RouterModule],
// // // // // //   templateUrl: './complaint-list.component.html',
// // // // // //   styleUrls: ['./complaint-list.component.scss']
// // // // // // })
// // // // // // export class ComplaintListComponent implements OnInit, OnDestroy {
// // // // // //   user: any = null;
// // // // // //   role: string | null = null;
// // // // // //   currentUsername = '';

// // // // // //   complaints: Complaint[] = [];
// // // // // //   loading = true;

// // // // // //   activeFilter: 'all' | 'OPEN' | 'IN_PROGRESS' | 'PROOF_SUBMITTED' | 'RESOLVED' = 'all';
// // // // // //   selectedId: number | null = null;
// // // // // //   selected: Complaint | null = null;

// // // // // //   staffList: User[] = [];          // all staff in community
// // // // // //   categoryStaffList: User[] = [];   // staff assigned to selected complaint's category
// // // // // //   assignStaffId: number | null = null;
// // // // // //   closeNote = '';

// // // // // //   proofNote = '';
// // // // // //   proofImage: string | null = null;
// // // // // //   showProofModal = false;

// // // // // //   reviewReason = '';
// // // // // //   showReviewModal = false;
// // // // // //   reviewMode: 'APPROVE' | 'REJECT' = 'APPROVE';

// // // // // //   errorMsg = '';
// // // // // //   successMsg = '';

// // // // // //   private pollHandle: any;
// // // // // //   private subs: Subscription[] = [];

// // // // // //   constructor(
// // // // // //     private auth: AuthService,
// // // // // //     private api: ApiService,
// // // // // //     private route: ActivatedRoute,
// // // // // //     private router: Router
// // // // // //   ) {}

// // // // // //   ngOnInit() {
// // // // // //     this.user = this.auth.getCurrentUser();
// // // // // //     this.role = this.user?.role;
// // // // // //     this.currentUsername = this.user?.username ?? '';
// // // // // //     this.subs.push(this.route.queryParams.subscribe(p => {
// // // // // //       if (p['id']) this.selectedId = +p['id'];
// // // // // //     }));
// // // // // //     this.load();
// // // // // //     this.pollHandle = setInterval(() => this.load(true), 10000);
// // // // // //     if (this.isAdmin()) {
// // // // // //       this.api.getAllUsers('STAFF').subscribe(s => this.staffList = s ?? []);
// // // // // //     }
// // // // // //   }

// // // // // //   ngOnDestroy() {
// // // // // //     if (this.pollHandle) clearInterval(this.pollHandle);
// // // // // //     this.subs.forEach(s => s.unsubscribe());
// // // // // //   }

// // // // // //   isResident() { return this.role === 'RESIDENT'; }
// // // // // //   isStaff() { return this.role === 'STAFF'; }

// // // // // //   /** Returns the most recent rejected proof submitted by this staff member */
// // // // // //   myRejectedProof(c: any): any {
// // // // // //     if (!c?.proofs?.length) return null;
// // // // // //     return c.proofs.find((p: any) =>
// // // // // //       p.submittedByUsername === this.currentUsername && p.status === 'REJECTED'
// // // // // //     ) ?? null;
// // // // // //   }

// // // // // //   /** True when this complaint was rejected and reassigned back to this staff */
// // // // // //   isRework(c: any): boolean {
// // // // // //     if (!c || c.status !== 'ASSIGNED') return false;
// // // // // //     return !!(c.assignedToUsername === this.currentUsername && this.myRejectedProof(c));
// // // // // //   }

// // // // // //   /** True when staff has a rejected proof but complaint is now assigned to someone else */
// // // // // //   isReassignedAway(c: any): boolean {
// // // // // //     if (!c) return false;
// // // // // //     if (c.assignedToUsername === this.currentUsername) return false;
// // // // // //     return !!(c.proofs?.some((p: any) =>
// // // // // //       p.submittedByUsername === this.currentUsername && p.status === 'REJECTED'
// // // // // //     ));
// // // // // //   }
// // // // // //   isAdmin() { return this.role === 'ADMIN' || this.role === 'CO_ADMIN'; }

// // // // // //   private load(silent = false) {
// // // // // //     if (!silent) this.loading = true;
// // // // // //     let obs;
// // // // // //     if (this.isResident()) obs = this.api.getMyComplaints();
// // // // // //     else if (this.isStaff()) obs = this.api.getMyWorkHistory(); // full history including rejected/reassigned
// // // // // //     else obs = this.api.getAllComplaints();

// // // // // //     obs.subscribe({
// // // // // //       next: list => {
// // // // // //         this.complaints = list ?? [];
// // // // // //         this.loading = false;
// // // // // //         if (this.selectedId) {
// // // // // //           const found = this.complaints.find(c => c.id === this.selectedId) ?? null;
// // // // // //           if (found && (!this.selected || this.selected.id !== found.id)) {
// // // // // //             // Auto-selected from URL (e.g. notification click) — load detail + staff
// // // // // //             this.selected = found;
// // // // // //             this.loadDetailAndStaff(found);
// // // // // //           } else if (this.selected) {
// // // // // //             // Polling refresh — keep selected but update data
// // // // // //             const refreshed = this.complaints.find(c => c.id === this.selected!.id);
// // // // // //             if (refreshed) this.selected = { ...this.selected, ...refreshed };
// // // // // //           }
// // // // // //         }
// // // // // //       },
// // // // // //       error: () => { this.loading = false; }
// // // // // //     });
// // // // // //   }

// // // // // //   setFilter(f: typeof this.activeFilter) { this.activeFilter = f; }

// // // // // //   get filtered(): Complaint[] {
// // // // // //     if (this.activeFilter === 'all') return this.complaints;
// // // // // //     return this.complaints.filter(c => {
// // // // // //       if (this.activeFilter === 'OPEN') return c.status === 'OPEN' || c.status === 'SUBMITTED' || c.status === 'ASSIGNED';
// // // // // //       if (this.activeFilter === 'IN_PROGRESS') return c.status === 'IN_PROGRESS';
// // // // // //       if (this.activeFilter === 'PROOF_SUBMITTED') return c.status === 'PROOF_SUBMITTED';
// // // // // //       if (this.activeFilter === 'RESOLVED') return c.status === 'RESOLVED' || c.status === 'CLOSED';
// // // // // //       return true;
// // // // // //     });
// // // // // //   }

// // // // // //   get filterCounts() {
// // // // // //     return {
// // // // // //       all: this.complaints.length,
// // // // // //       OPEN: this.complaints.filter(c => c.status === 'OPEN' || c.status === 'SUBMITTED' || c.status === 'ASSIGNED').length,
// // // // // //       IN_PROGRESS: this.complaints.filter(c => c.status === 'IN_PROGRESS').length,
// // // // // //       PROOF_SUBMITTED: this.complaints.filter(c => c.status === 'PROOF_SUBMITTED').length,
// // // // // //       RESOLVED: this.complaints.filter(c => c.status === 'RESOLVED' || c.status === 'CLOSED').length,
// // // // // //     };
// // // // // //   }

// // // // // //   /** Loads full complaint detail (with images) and category-specific staff list */
// // // // // //   private loadDetailAndStaff(c: Complaint) {
// // // // // //     // Fetch full detail with images
// // // // // //     this.api.getComplaintById(c.id).subscribe({
// // // // // //       next: detail => {
// // // // // //         if (this.selectedId === detail.id) this.selected = detail as any;
// // // // // //       },
// // // // // //       error: () => {}
// // // // // //     });
// // // // // //     // Load staff for this complaint's category
// // // // // //     if (c.categoryId) {
// // // // // //       this.api.getStaffForCategory(c.categoryId).subscribe({
// // // // // //         next: staff => {
// // // // // //           this.categoryStaffList = (staff && staff.length > 0) ? staff : this.staffList;
// // // // // //         },
// // // // // //         error: () => { this.categoryStaffList = this.staffList; }
// // // // // //       });
// // // // // //     } else {
// // // // // //       this.categoryStaffList = this.staffList;
// // // // // //     }
// // // // // //   }

// // // // // //   select(c: Complaint) {
// // // // // //     this.selectedId = c.id;
// // // // // //     this.selected = c;  // show immediately with what we have
// // // // // //     this.errorMsg = '';
// // // // // //     this.successMsg = '';
// // // // // //     this.assignStaffId = null;
// // // // // //     this.categoryStaffList = []; // reset while loading
// // // // // //     this.router.navigate([], { queryParams: { id: c.id }, queryParamsHandling: 'merge' });
// // // // // //     this.loadDetailAndStaff(c);
// // // // // //   }

// // // // // //   close() {
// // // // // //     this.selectedId = null;
// // // // // //     this.selected = null;
// // // // // //     this.router.navigate([], { queryParams: { id: null }, queryParamsHandling: 'merge' });
// // // // // //   }

// // // // // //   doAssign() {
// // // // // //     if (!this.selected || !this.assignStaffId) return;
// // // // // //     this.api.assignComplaint(this.selected.id, this.assignStaffId).subscribe({
// // // // // //       next: c => { this.selected = c; this.successMsg = 'Assigned.'; this.load(true); },
// // // // // //       error: e => this.errorMsg = e.error?.message || 'Failed to assign.'
// // // // // //     });
// // // // // //   }

// // // // // //   doReassign() {
// // // // // //     if (!this.selected || !this.assignStaffId) return;
// // // // // //     this.api.reassignComplaint(this.selected.id, this.assignStaffId).subscribe({
// // // // // //       next: c => { this.selected = c; this.successMsg = 'Reassigned.'; this.load(true); },
// // // // // //       error: e => this.errorMsg = e.error?.message || 'Failed to reassign.'
// // // // // //     });
// // // // // //   }

// // // // // //   doClose() {
// // // // // //     if (!this.selected) return;
// // // // // //     this.api.closeComplaint(this.selected.id, this.closeNote || '').subscribe({
// // // // // //       next: c => { this.selected = c; this.successMsg = 'Closed.'; this.load(true); this.closeNote = ''; },
// // // // // //       error: e => this.errorMsg = e.error?.message || 'Failed to close.'
// // // // // //     });
// // // // // //   }

// // // // // //   doStart() {
// // // // // //     if (!this.selected) return;
// // // // // //     this.api.startWork(this.selected.id).subscribe({
// // // // // //       next: c => { this.selected = c; this.successMsg = 'Started.'; this.load(true); },
// // // // // //       error: e => this.errorMsg = e.error?.message || 'Failed to start.'
// // // // // //     });
// // // // // //   }

// // // // // //   openProofModal() {
// // // // // //     this.proofNote = '';
// // // // // //     this.proofImage = null;
// // // // // //     this.showProofModal = true;
// // // // // //   }

// // // // // //   doSubmitProof() {
// // // // // //     if (!this.selected || !this.proofNote) return;
// // // // // //     this.api.submitProof(this.selected.id, { workNote: this.proofNote, imageBase64: this.proofImage })
// // // // // //       .subscribe({
// // // // // //         next: c => {
// // // // // //           this.selected = c;
// // // // // //           this.showProofModal = false;
// // // // // //           this.successMsg = 'Proof submitted for review.';
// // // // // //           this.load(true);
// // // // // //         },
// // // // // //         error: e => this.errorMsg = e.error?.message || 'Failed to submit proof.'
// // // // // //       });
// // // // // //   }

// // // // // //   openReviewModal(mode: 'APPROVE' | 'REJECT') {
// // // // // //     this.reviewMode = mode;
// // // // // //     this.reviewReason = '';
// // // // // //     this.assignStaffId = null; // reset staff selection each time modal opens
// // // // // //     this.showReviewModal = true;
// // // // // //   }

// // // // // //   doReviewProof() {
// // // // // //     if (!this.selected) return;
// // // // // //     const payload: any = { decision: this.reviewMode };
// // // // // //     if (this.reviewMode === 'REJECT') {
// // // // // //       payload.rejectionReason = this.reviewReason || 'Not satisfactory';
// // // // // //       // Pass reassignToStaffId only if a different staff was explicitly selected
// // // // // //       if (this.assignStaffId) {
// // // // // //         payload.reassignToStaffId = this.assignStaffId;
// // // // // //       }
// // // // // //     }
// // // // // //     this.api.reviewProof(this.selected.id, payload).subscribe({
// // // // // //       next: c => {
// // // // // //         this.selected = c;
// // // // // //         this.showReviewModal = false;
// // // // // //         this.assignStaffId = null; // reset after submit
// // // // // //         this.successMsg = this.reviewMode === 'APPROVE' ? 'Proof approved — marked as resolved.' : 'Proof rejected.';
// // // // // //         this.load(true);
// // // // // //       },
// // // // // //       error: e => this.errorMsg = e.error?.message || 'Failed to review proof.'
// // // // // //     });
// // // // // //   }

// // // // // //   doUpvote(c: Complaint) {
// // // // // //     this.api.upvote(c.id).subscribe({
// // // // // //       next: updated => {
// // // // // //         const i = this.complaints.findIndex(x => x.id === c.id);
// // // // // //         if (i >= 0) this.complaints[i] = updated;
// // // // // //         if (this.selected?.id === c.id) this.selected = updated;
// // // // // //       }
// // // // // //     });
// // // // // //   }

// // // // // //   onProofFile(e: any) {
// // // // // //     const file: File = e.target?.files?.[0];
// // // // // //     if (!file) return;
// // // // // //     const reader = new FileReader();
// // // // // //     reader.onload = () => {
// // // // // //       const result = reader.result as string;
// // // // // //       this.proofImage = result.split(',')[1] ?? '';
// // // // // //     };
// // // // // //     reader.readAsDataURL(file);
// // // // // //   }

// // // // // //   hasPhoto(c: Complaint): boolean {
// // // // // //     return !!(c.thumbnailBase64 || (c.mediaBase64List && c.mediaBase64List.length > 0));
// // // // // //   }
// // // // // //   photoSrc(c: Complaint, i = 0): string {
// // // // // //     const b64 = i === 0
// // // // // //       ? (c.mediaBase64List?.[0] ?? c.thumbnailBase64 ?? '')
// // // // // //       : (c.mediaBase64List?.[i] ?? '');
// // // // // //     if (!b64) return '';
// // // // // //     if (b64.startsWith('/9j/')) return 'data:image/jpeg;base64,' + b64;
// // // // // //     if (b64.startsWith('iVBOR')) return 'data:image/png;base64,' + b64;
// // // // // //     return 'data:image/jpeg;base64,' + b64;
// // // // // //   }
// // // // // //   proofPhoto(p: ComplaintProof): string { return 'data:image/jpeg;base64,' + (p.imageBase64 ?? ''); }

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
// // // // // //     return new Date(iso).toLocaleDateString();
// // // // // //   }

// // // // // //   fullDate(iso: string): string {
// // // // // //     if (!iso) return '';
// // // // // //     return new Date(iso).toLocaleString();
// // // // // //   }

// // // // // //   statusClass(s: string): string { return `status-${s}`; }
// // // // // // }


// // // // // import { Component, OnInit, OnDestroy } from '@angular/core';
// // // // // import { CommonModule } from '@angular/common';
// // // // // import { FormsModule } from '@angular/forms';
// // // // // import { ActivatedRoute, Router, RouterModule } from '@angular/router';
// // // // // import { Subscription } from 'rxjs';
// // // // // import { AuthService } from '../../../core/services/auth.service';
// // // // // import { ApiService } from '../../../core/services/api.service';
// // // // // import { Complaint, User, ComplaintProof } from '../../../shared/models/models';

// // // // // @Component({
// // // // //   selector: 'app-complaint-list',
// // // // //   standalone: true,
// // // // //   imports: [CommonModule, FormsModule, RouterModule],
// // // // //   templateUrl: './complaint-list.component.html',
// // // // //   styleUrls: ['./complaint-list.component.scss']
// // // // // })
// // // // // export class ComplaintListComponent implements OnInit, OnDestroy {
// // // // //   user: any = null;
// // // // //   role: string | null = null;
// // // // //   currentUsername = '';

// // // // //   complaints: Complaint[] = [];
// // // // //   loading = true;

// // // // //   activeFilter: 'all' | 'OPEN' | 'IN_PROGRESS' | 'PROOF_SUBMITTED' | 'RESOLVED' = 'all';
// // // // //   selectedId: number | null = null;
// // // // //   selected: Complaint | null = null;

// // // // //   staffList: User[] = [];          // all staff in community
// // // // //   categoryStaffList: User[] = [];   // staff assigned to selected complaint's category
// // // // //   assignStaffId: number | null = null;
// // // // //   closeNote = '';

// // // // //   proofNote = '';
// // // // //   proofImage: string | null = null;
// // // // //   showProofModal = false;

// // // // //   reviewReason = '';
// // // // //   showReviewModal = false;
// // // // //   reviewMode: 'APPROVE' | 'REJECT' = 'APPROVE';

// // // // //   errorMsg = '';
// // // // //   successMsg = '';

// // // // //   private pollHandle: any;
// // // // //   private subs: Subscription[] = [];

// // // // //   constructor(
// // // // //     private auth: AuthService,
// // // // //     private api: ApiService,
// // // // //     private route: ActivatedRoute,
// // // // //     private router: Router
// // // // //   ) {}

// // // // //   ngOnInit() {
// // // // //     this.user = this.auth.getCurrentUser();
// // // // //     this.role = this.user?.role;
// // // // //     this.currentUsername = this.user?.username ?? '';
// // // // //     this.subs.push(this.route.queryParams.subscribe(p => {
// // // // //       if (p['id']) this.selectedId = +p['id'];
// // // // //     }));
// // // // //     this.load();
// // // // //     this.pollHandle = setInterval(() => this.load(true), 10000);
// // // // //     if (this.isAdmin()) {
// // // // //       this.api.getAllUsers('STAFF').subscribe(s => this.staffList = s ?? []);
// // // // //     }
// // // // //   }

// // // // //   ngOnDestroy() {
// // // // //     if (this.pollHandle) clearInterval(this.pollHandle);
// // // // //     this.subs.forEach(s => s.unsubscribe());
// // // // //   }

// // // // //   isResident() { return this.role === 'RESIDENT'; }
// // // // //   isStaff() { return this.role === 'STAFF'; }

// // // // //   /** Returns the most recent rejected proof submitted by this staff member */
// // // // //   myRejectedProof(c: any): any {
// // // // //     if (!c?.proofs?.length) return null;
// // // // //     return c.proofs.find((p: any) =>
// // // // //       p.submittedByUsername === this.currentUsername && p.status === 'REJECTED'
// // // // //     ) ?? null;
// // // // //   }

// // // // //   /** True when this complaint was rejected and reassigned back to this staff */
// // // // //   isRework(c: any): boolean {
// // // // //     if (!c || c.status !== 'ASSIGNED') return false;
// // // // //     return !!(c.assignedToUsername === this.currentUsername && this.myRejectedProof(c));
// // // // //   }

// // // // //   /** True when staff has a rejected proof but complaint is now assigned to someone else */
// // // // //   isReassignedAway(c: any): boolean {
// // // // //     if (!c) return false;
// // // // //     if (c.assignedToUsername === this.currentUsername) return false;
// // // // //     return !!(c.proofs?.some((p: any) =>
// // // // //       p.submittedByUsername === this.currentUsername && p.status === 'REJECTED'
// // // // //     ));
// // // // //   }
// // // // //   isAdmin() { return this.role === 'ADMIN' || this.role === 'CO_ADMIN'; }

// // // // //   private load(silent = false) {
// // // // //     if (!silent) this.loading = true;
// // // // //     let obs;
// // // // //     if (this.isResident()) obs = this.api.getMyComplaints();
// // // // //     else if (this.isStaff()) obs = this.api.getMyWorkHistory(); // full history including rejected/reassigned
// // // // //     else obs = this.api.getAllComplaints();

// // // // //     obs.subscribe({
// // // // //       next: list => {
// // // // //         this.complaints = list ?? [];
// // // // //         this.loading = false;
// // // // //         if (this.selectedId) {
// // // // //           const found = this.complaints.find(c => c.id === this.selectedId) ?? null;
// // // // //           if (found && (!this.selected || this.selected.id !== found.id)) {
// // // // //             // Auto-selected from URL (e.g. notification click) — load detail + staff
// // // // //             this.selected = found;
// // // // //             this.loadDetailAndStaff(found);
// // // // //           } else if (this.selected) {
// // // // //             // Polling refresh — keep selected but update data
// // // // //             const refreshed = this.complaints.find(c => c.id === this.selected!.id);
// // // // //             if (refreshed) this.selected = { ...this.selected, ...refreshed };
// // // // //           }
// // // // //         }
// // // // //       },
// // // // //       error: () => { this.loading = false; }
// // // // //     });
// // // // //   }

// // // // //   setFilter(f: typeof this.activeFilter) { this.activeFilter = f; }

// // // // //   get filtered(): Complaint[] {
// // // // //     if (this.activeFilter === 'all') return this.complaints;
// // // // //     return this.complaints.filter(c => {
// // // // //       if (this.activeFilter === 'OPEN') return c.status === 'OPEN' || c.status === 'SUBMITTED' || c.status === 'ASSIGNED';
// // // // //       if (this.activeFilter === 'IN_PROGRESS') return c.status === 'IN_PROGRESS';
// // // // //       if (this.activeFilter === 'PROOF_SUBMITTED') return c.status === 'PROOF_SUBMITTED';
// // // // //       if (this.activeFilter === 'RESOLVED') return c.status === 'RESOLVED' || c.status === 'CLOSED';
// // // // //       return true;
// // // // //     });
// // // // //   }

// // // // //   get filterCounts() {
// // // // //     return {
// // // // //       all: this.complaints.length,
// // // // //       OPEN: this.complaints.filter(c => c.status === 'OPEN' || c.status === 'SUBMITTED' || c.status === 'ASSIGNED').length,
// // // // //       IN_PROGRESS: this.complaints.filter(c => c.status === 'IN_PROGRESS').length,
// // // // //       PROOF_SUBMITTED: this.complaints.filter(c => c.status === 'PROOF_SUBMITTED').length,
// // // // //       RESOLVED: this.complaints.filter(c => c.status === 'RESOLVED' || c.status === 'CLOSED').length,
// // // // //     };
// // // // //   }

// // // // //   /** Count of complaints where this staff's proof was rejected and handed to another staff */
// // // // //   get rejectedAwayCount(): number {
// // // // //     if (!this.isStaff()) return 0;
// // // // //     return this.complaints.filter(c => this.isReassignedAway(c)).length;
// // // // //   }

// // // // //   /** Loads full complaint detail (with images) and category-specific staff list */
// // // // //   private loadDetailAndStaff(c: Complaint) {
// // // // //     // Fetch full detail with images
// // // // //     this.api.getComplaintById(c.id).subscribe({
// // // // //       next: detail => {
// // // // //         if (this.selectedId === detail.id) this.selected = detail as any;
// // // // //       },
// // // // //       error: () => {}
// // // // //     });
// // // // //     // Load staff for this complaint's category
// // // // //     if (c.categoryId) {
// // // // //       this.api.getStaffForCategory(c.categoryId).subscribe({
// // // // //         next: staff => {
// // // // //           this.categoryStaffList = (staff && staff.length > 0) ? staff : this.staffList;
// // // // //         },
// // // // //         error: () => { this.categoryStaffList = this.staffList; }
// // // // //       });
// // // // //     } else {
// // // // //       this.categoryStaffList = this.staffList;
// // // // //     }
// // // // //   }

// // // // //   select(c: Complaint) {
// // // // //     this.selectedId = c.id;
// // // // //     this.selected = c;  // show immediately with what we have
// // // // //     this.errorMsg = '';
// // // // //     this.successMsg = '';
// // // // //     this.assignStaffId = null;
// // // // //     this.categoryStaffList = []; // reset while loading
// // // // //     this.router.navigate([], { queryParams: { id: c.id }, queryParamsHandling: 'merge' });
// // // // //     this.loadDetailAndStaff(c);
// // // // //   }

// // // // //   close() {
// // // // //     this.selectedId = null;
// // // // //     this.selected = null;
// // // // //     this.router.navigate([], { queryParams: { id: null }, queryParamsHandling: 'merge' });
// // // // //   }

// // // // //   doAssign() {
// // // // //     if (!this.selected || !this.assignStaffId) return;
// // // // //     this.api.assignComplaint(this.selected.id, this.assignStaffId).subscribe({
// // // // //       next: c => { this.selected = c; this.successMsg = 'Assigned.'; this.load(true); },
// // // // //       error: e => this.errorMsg = e.error?.message || 'Failed to assign.'
// // // // //     });
// // // // //   }

// // // // //   doReassign() {
// // // // //     if (!this.selected || !this.assignStaffId) return;
// // // // //     this.api.reassignComplaint(this.selected.id, this.assignStaffId).subscribe({
// // // // //       next: c => { this.selected = c; this.successMsg = 'Reassigned.'; this.load(true); },
// // // // //       error: e => this.errorMsg = e.error?.message || 'Failed to reassign.'
// // // // //     });
// // // // //   }

// // // // //   doClose() {
// // // // //     if (!this.selected) return;
// // // // //     this.api.closeComplaint(this.selected.id, this.closeNote || '').subscribe({
// // // // //       next: c => { this.selected = c; this.successMsg = 'Closed.'; this.load(true); this.closeNote = ''; },
// // // // //       error: e => this.errorMsg = e.error?.message || 'Failed to close.'
// // // // //     });
// // // // //   }

// // // // //   doStart() {
// // // // //     if (!this.selected) return;
// // // // //     this.api.startWork(this.selected.id).subscribe({
// // // // //       next: c => { this.selected = c; this.successMsg = 'Started.'; this.load(true); },
// // // // //       error: e => this.errorMsg = e.error?.message || 'Failed to start.'
// // // // //     });
// // // // //   }

// // // // //   openProofModal() {
// // // // //     this.proofNote = '';
// // // // //     this.proofImage = null;
// // // // //     this.showProofModal = true;
// // // // //   }

// // // // //   doSubmitProof() {
// // // // //     if (!this.selected || !this.proofNote) return;
// // // // //     this.api.submitProof(this.selected.id, { workNote: this.proofNote, imageBase64: this.proofImage })
// // // // //       .subscribe({
// // // // //         next: c => {
// // // // //           this.selected = c;
// // // // //           this.showProofModal = false;
// // // // //           this.successMsg = 'Proof submitted for review.';
// // // // //           this.load(true);
// // // // //         },
// // // // //         error: e => this.errorMsg = e.error?.message || 'Failed to submit proof.'
// // // // //       });
// // // // //   }

// // // // //   openReviewModal(mode: 'APPROVE' | 'REJECT') {
// // // // //     this.reviewMode = mode;
// // // // //     this.reviewReason = '';
// // // // //     this.assignStaffId = null; // reset staff selection each time modal opens
// // // // //     this.showReviewModal = true;
// // // // //   }

// // // // //   doReviewProof() {
// // // // //     if (!this.selected) return;
// // // // //     const payload: any = { decision: this.reviewMode };
// // // // //     if (this.reviewMode === 'REJECT') {
// // // // //       payload.rejectionReason = this.reviewReason || 'Not satisfactory';
// // // // //       // Pass reassignToStaffId only if a different staff was explicitly selected
// // // // //       if (this.assignStaffId) {
// // // // //         payload.reassignToStaffId = this.assignStaffId;
// // // // //       }
// // // // //     }
// // // // //     this.api.reviewProof(this.selected.id, payload).subscribe({
// // // // //       next: c => {
// // // // //         this.selected = c;
// // // // //         this.showReviewModal = false;
// // // // //         this.assignStaffId = null; // reset after submit
// // // // //         this.successMsg = this.reviewMode === 'APPROVE' ? 'Proof approved — marked as resolved.' : 'Proof rejected.';
// // // // //         this.load(true);
// // // // //       },
// // // // //       error: e => this.errorMsg = e.error?.message || 'Failed to review proof.'
// // // // //     });
// // // // //   }

// // // // //   doUpvote(c: Complaint) {
// // // // //     this.api.upvote(c.id).subscribe({
// // // // //       next: updated => {
// // // // //         const i = this.complaints.findIndex(x => x.id === c.id);
// // // // //         if (i >= 0) this.complaints[i] = updated;
// // // // //         if (this.selected?.id === c.id) this.selected = updated;
// // // // //       }
// // // // //     });
// // // // //   }

// // // // //   onProofFile(e: any) {
// // // // //     const file: File = e.target?.files?.[0];
// // // // //     if (!file) return;
// // // // //     const reader = new FileReader();
// // // // //     reader.onload = () => {
// // // // //       const result = reader.result as string;
// // // // //       this.proofImage = result.split(',')[1] ?? '';
// // // // //     };
// // // // //     reader.readAsDataURL(file);
// // // // //   }

// // // // //   hasPhoto(c: Complaint): boolean {
// // // // //     return !!(c.thumbnailBase64 || (c.mediaBase64List && c.mediaBase64List.length > 0));
// // // // //   }
// // // // //   photoSrc(c: Complaint, i = 0): string {
// // // // //     const b64 = i === 0
// // // // //       ? (c.mediaBase64List?.[0] ?? c.thumbnailBase64 ?? '')
// // // // //       : (c.mediaBase64List?.[i] ?? '');
// // // // //     if (!b64) return '';
// // // // //     if (b64.startsWith('/9j/')) return 'data:image/jpeg;base64,' + b64;
// // // // //     if (b64.startsWith('iVBOR')) return 'data:image/png;base64,' + b64;
// // // // //     return 'data:image/jpeg;base64,' + b64;
// // // // //   }
// // // // //   proofPhoto(p: ComplaintProof): string { return 'data:image/jpeg;base64,' + (p.imageBase64 ?? ''); }

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
// // // // //     return new Date(iso).toLocaleDateString();
// // // // //   }

// // // // //   fullDate(iso: string): string {
// // // // //     if (!iso) return '';
// // // // //     return new Date(iso).toLocaleString();
// // // // //   }

// // // // //   statusClass(s: string): string { return `status-${s}`; }
// // // // // }


// // // // import { Component, OnInit, OnDestroy } from '@angular/core';
// // // // import { CommonModule } from '@angular/common';
// // // // import { FormsModule } from '@angular/forms';
// // // // import { ActivatedRoute, Router, RouterModule } from '@angular/router';
// // // // import { Subscription } from 'rxjs';
// // // // import { AuthService } from '../../../core/services/auth.service';
// // // // import { ApiService } from '../../../core/services/api.service';
// // // // import { Complaint, User, ComplaintProof } from '../../../shared/models/models';

// // // // @Component({
// // // //   selector: 'app-complaint-list',
// // // //   standalone: true,
// // // //   imports: [CommonModule, FormsModule, RouterModule],
// // // //   templateUrl: './complaint-list.component.html',
// // // //   styleUrls: ['./complaint-list.component.scss']
// // // // })
// // // // export class ComplaintListComponent implements OnInit, OnDestroy {
// // // //   user: any = null;
// // // //   role: string | null = null;
// // // //   currentUsername = '';

// // // //   complaints: Complaint[] = [];
// // // //   loading = true;

// // // //   activeFilter: 'all' | 'OPEN' | 'IN_PROGRESS' | 'PROOF_SUBMITTED' | 'RESOLVED' | 'REJECTED' = 'all';
// // // //   selectedId: number | null = null;
// // // //   selected: Complaint | null = null;

// // // //   staffList: User[] = [];          // all staff in community
// // // //   categoryStaffList: User[] = [];   // staff assigned to selected complaint's category
// // // //   assignStaffId: number | null = null;
// // // //   closeNote = '';

// // // //   proofNote = '';
// // // //   proofImage: string | null = null;
// // // //   showProofModal = false;

// // // //   reviewReason = '';
// // // //   showReviewModal = false;
// // // //   reviewMode: 'APPROVE' | 'REJECT' = 'APPROVE';

// // // //   errorMsg = '';
// // // //   successMsg = '';

// // // //   private pollHandle: any;
// // // //   private subs: Subscription[] = [];

// // // //   constructor(
// // // //     private auth: AuthService,
// // // //     private api: ApiService,
// // // //     private route: ActivatedRoute,
// // // //     private router: Router
// // // //   ) {}

// // // //   ngOnInit() {
// // // //     this.user = this.auth.getCurrentUser();
// // // //     this.role = this.user?.role;
// // // //     this.currentUsername = this.user?.username ?? '';
// // // //     this.subs.push(this.route.queryParams.subscribe(p => {
// // // //       if (p['id']) this.selectedId = +p['id'];
// // // //     }));
// // // //     this.load();
// // // //     this.pollHandle = setInterval(() => this.load(true), 10000);
// // // //     if (this.isAdmin()) {
// // // //       this.api.getAllUsers('STAFF').subscribe(s => this.staffList = s ?? []);
// // // //     }
// // // //   }

// // // //   ngOnDestroy() {
// // // //     if (this.pollHandle) clearInterval(this.pollHandle);
// // // //     this.subs.forEach(s => s.unsubscribe());
// // // //   }

// // // //   isResident() { return this.role === 'RESIDENT'; }
// // // //   isStaff() { return this.role === 'STAFF'; }

// // // //   /** Returns the most recent rejected proof submitted by this staff member */
// // // //   myRejectedProof(c: any): any {
// // // //     if (!c?.proofs?.length) return null;
// // // //     return c.proofs.find((p: any) =>
// // // //       p.submittedByUsername === this.currentUsername && p.status === 'REJECTED'
// // // //     ) ?? null;
// // // //   }

// // // //   /** True when this complaint was rejected and reassigned back to this staff */
// // // //   isRework(c: any): boolean {
// // // //     if (!c || c.status !== 'ASSIGNED') return false;
// // // //     return !!(c.assignedToUsername === this.currentUsername && this.myRejectedProof(c));
// // // //   }

// // // //   /** True when staff has a rejected proof but complaint is now assigned to someone else */
// // // //   isReassignedAway(c: any): boolean {
// // // //     if (!c) return false;
// // // //     if (c.assignedToUsername === this.currentUsername) return false;
// // // //     return !!(c.proofs?.some((p: any) =>
// // // //       p.submittedByUsername === this.currentUsername && p.status === 'REJECTED'
// // // //     ));
// // // //   }
// // // //   isAdmin() { return this.role === 'ADMIN' || this.role === 'CO_ADMIN'; }

// // // //   private load(silent = false) {
// // // //     if (!silent) this.loading = true;
// // // //     let obs;
// // // //     if (this.isResident()) obs = this.api.getMyComplaints();
// // // //     else if (this.isStaff()) obs = this.api.getMyWorkHistory(); // full history including rejected/reassigned
// // // //     else obs = this.api.getAllComplaints();

// // // //     obs.subscribe({
// // // //       next: list => {
// // // //         this.complaints = list ?? [];
// // // //         this.loading = false;
// // // //         if (this.selectedId) {
// // // //           const found = this.complaints.find(c => c.id === this.selectedId) ?? null;
// // // //           if (found && (!this.selected || this.selected.id !== found.id)) {
// // // //             // Auto-selected from URL (e.g. notification click) — load detail + staff
// // // //             this.selected = found;
// // // //             this.loadDetailAndStaff(found);
// // // //           } else if (this.selected) {
// // // //             // Polling refresh — keep selected but update data
// // // //             const refreshed = this.complaints.find(c => c.id === this.selected!.id);
// // // //             if (refreshed) this.selected = { ...this.selected, ...refreshed };
// // // //           }
// // // //         }
// // // //       },
// // // //       error: () => { this.loading = false; }
// // // //     });
// // // //   }

// // // //   setFilter(f: typeof this.activeFilter) { this.activeFilter = f; }

// // // //   get filtered(): Complaint[] {
// // // //     if (this.activeFilter === 'all') return this.complaints;
// // // //     return this.complaints.filter(c => {
// // // //       if (this.activeFilter === 'OPEN') return c.status === 'OPEN' || c.status === 'SUBMITTED' || c.status === 'ASSIGNED';
// // // //       if (this.activeFilter === 'IN_PROGRESS') return c.status === 'IN_PROGRESS';
// // // //       if (this.activeFilter === 'PROOF_SUBMITTED') return c.status === 'PROOF_SUBMITTED';
// // // //       if (this.activeFilter === 'RESOLVED') return c.status === 'RESOLVED' || c.status === 'CLOSED';
// // // //       return true;
// // // //     });
// // // //   }

// // // //   get filterCounts() {
// // // //     return {
// // // //       all: this.complaints.length,
// // // //       OPEN: this.complaints.filter(c =>
// // // //         (c.status === 'OPEN' || c.status === 'SUBMITTED' || c.status === 'ASSIGNED')
// // // //         && !this.isReassignedAway(c)).length,
// // // //       IN_PROGRESS: this.complaints.filter(c => c.status === 'IN_PROGRESS' && !this.isReassignedAway(c)).length,
// // // //       PROOF_SUBMITTED: this.complaints.filter(c => c.status === 'PROOF_SUBMITTED').length,
// // // //       RESOLVED: this.complaints.filter(c => c.status === 'RESOLVED' || c.status === 'CLOSED').length,
// // // //       REJECTED: this.complaints.filter(c => this.isReassignedAway(c)).length,
// // // //     };
// // // //   }

// // // //   /** Count of complaints where this staff's proof was rejected and handed to another staff */
// // // //   get rejectedAwayCount(): number {
// // // //     if (!this.isStaff()) return 0;
// // // //     return this.complaints.filter(c => this.isReassignedAway(c)).length;
// // // //   }

// // // //   /** Loads full complaint detail (with images) and category-specific staff list */
// // // //   private loadDetailAndStaff(c: Complaint) {
// // // //     // Fetch full detail with images
// // // //     this.api.getComplaintById(c.id).subscribe({
// // // //       next: detail => {
// // // //         if (this.selectedId === detail.id) this.selected = detail as any;
// // // //       },
// // // //       error: () => {}
// // // //     });
// // // //     // Load staff for this complaint's category
// // // //     if (c.categoryId) {
// // // //       this.api.getStaffForCategory(c.categoryId).subscribe({
// // // //         next: staff => {
// // // //           this.categoryStaffList = (staff && staff.length > 0) ? staff : this.staffList;
// // // //         },
// // // //         error: () => { this.categoryStaffList = this.staffList; }
// // // //       });
// // // //     } else {
// // // //       this.categoryStaffList = this.staffList;
// // // //     }
// // // //   }

// // // //   select(c: Complaint) {
// // // //     this.selectedId = c.id;
// // // //     this.selected = c;  // show immediately with what we have
// // // //     this.errorMsg = '';
// // // //     this.successMsg = '';
// // // //     this.assignStaffId = null;
// // // //     this.categoryStaffList = []; // reset while loading
// // // //     this.router.navigate([], { queryParams: { id: c.id }, queryParamsHandling: 'merge' });
// // // //     this.loadDetailAndStaff(c);
// // // //   }

// // // //   close() {
// // // //     this.selectedId = null;
// // // //     this.selected = null;
// // // //     this.router.navigate([], { queryParams: { id: null }, queryParamsHandling: 'merge' });
// // // //   }

// // // //   doAssign() {
// // // //     if (!this.selected || !this.assignStaffId) return;
// // // //     this.api.assignComplaint(this.selected.id, this.assignStaffId).subscribe({
// // // //       next: c => { this.selected = c; this.successMsg = 'Assigned.'; this.load(true); },
// // // //       error: e => this.errorMsg = e.error?.message || 'Failed to assign.'
// // // //     });
// // // //   }

// // // //   doReassign() {
// // // //     if (!this.selected || !this.assignStaffId) return;
// // // //     this.api.reassignComplaint(this.selected.id, this.assignStaffId).subscribe({
// // // //       next: c => { this.selected = c; this.successMsg = 'Reassigned.'; this.load(true); },
// // // //       error: e => this.errorMsg = e.error?.message || 'Failed to reassign.'
// // // //     });
// // // //   }

// // // //   doClose() {
// // // //     if (!this.selected) return;
// // // //     this.api.closeComplaint(this.selected.id, this.closeNote || '').subscribe({
// // // //       next: c => { this.selected = c; this.successMsg = 'Closed.'; this.load(true); this.closeNote = ''; },
// // // //       error: e => this.errorMsg = e.error?.message || 'Failed to close.'
// // // //     });
// // // //   }

// // // //   doStart() {
// // // //     if (!this.selected) return;
// // // //     this.api.startWork(this.selected.id).subscribe({
// // // //       next: c => { this.selected = c; this.successMsg = 'Started.'; this.load(true); },
// // // //       error: e => this.errorMsg = e.error?.message || 'Failed to start.'
// // // //     });
// // // //   }

// // // //   openProofModal() {
// // // //     this.proofNote = '';
// // // //     this.proofImage = null;
// // // //     this.showProofModal = true;
// // // //   }

// // // //   doSubmitProof() {
// // // //     if (!this.selected || !this.proofNote) return;
// // // //     this.api.submitProof(this.selected.id, { workNote: this.proofNote, imageBase64: this.proofImage })
// // // //       .subscribe({
// // // //         next: c => {
// // // //           this.selected = c;
// // // //           this.showProofModal = false;
// // // //           this.successMsg = 'Proof submitted for review.';
// // // //           this.load(true);
// // // //         },
// // // //         error: e => this.errorMsg = e.error?.message || 'Failed to submit proof.'
// // // //       });
// // // //   }

// // // //   openReviewModal(mode: 'APPROVE' | 'REJECT') {
// // // //     this.reviewMode = mode;
// // // //     this.reviewReason = '';
// // // //     this.assignStaffId = null; // reset staff selection each time modal opens
// // // //     this.showReviewModal = true;
// // // //   }

// // // //   doReviewProof() {
// // // //     if (!this.selected) return;
// // // //     const payload: any = { decision: this.reviewMode };
// // // //     if (this.reviewMode === 'REJECT') {
// // // //       payload.rejectionReason = this.reviewReason || 'Not satisfactory';
// // // //       // Pass reassignToStaffId only if a different staff was explicitly selected
// // // //       if (this.assignStaffId) {
// // // //         payload.reassignToStaffId = this.assignStaffId;
// // // //       }
// // // //     }
// // // //     this.api.reviewProof(this.selected.id, payload).subscribe({
// // // //       next: c => {
// // // //         this.selected = c;
// // // //         this.showReviewModal = false;
// // // //         this.assignStaffId = null; // reset after submit
// // // //         this.successMsg = this.reviewMode === 'APPROVE' ? 'Proof approved — marked as resolved.' : 'Proof rejected.';
// // // //         this.load(true);
// // // //       },
// // // //       error: e => this.errorMsg = e.error?.message || 'Failed to review proof.'
// // // //     });
// // // //   }

// // // //   doUpvote(c: Complaint) {
// // // //     this.api.upvote(c.id).subscribe({
// // // //       next: updated => {
// // // //         const i = this.complaints.findIndex(x => x.id === c.id);
// // // //         if (i >= 0) this.complaints[i] = updated;
// // // //         if (this.selected?.id === c.id) this.selected = updated;
// // // //       }
// // // //     });
// // // //   }

// // // //   onProofFile(e: any) {
// // // //     const file: File = e.target?.files?.[0];
// // // //     if (!file) return;
// // // //     const reader = new FileReader();
// // // //     reader.onload = () => {
// // // //       const result = reader.result as string;
// // // //       this.proofImage = result.split(',')[1] ?? '';
// // // //     };
// // // //     reader.readAsDataURL(file);
// // // //   }

// // // //   hasPhoto(c: Complaint): boolean {
// // // //     return !!(c.thumbnailBase64 || (c.mediaBase64List && c.mediaBase64List.length > 0));
// // // //   }
// // // //   photoSrc(c: Complaint, i = 0): string {
// // // //     const b64 = i === 0
// // // //       ? (c.mediaBase64List?.[0] ?? c.thumbnailBase64 ?? '')
// // // //       : (c.mediaBase64List?.[i] ?? '');
// // // //     if (!b64) return '';
// // // //     if (b64.startsWith('/9j/')) return 'data:image/jpeg;base64,' + b64;
// // // //     if (b64.startsWith('iVBOR')) return 'data:image/png;base64,' + b64;
// // // //     return 'data:image/jpeg;base64,' + b64;
// // // //   }
// // // //   proofPhoto(p: ComplaintProof): string { return 'data:image/jpeg;base64,' + (p.imageBase64 ?? ''); }

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
// // // //     return new Date(iso).toLocaleDateString();
// // // //   }

// // // //   fullDate(iso: string): string {
// // // //     if (!iso) return '';
// // // //     return new Date(iso).toLocaleString();
// // // //   }

// // // //   statusClass(s: string): string { return `status-${s}`; }
// // // // }


// // // import { Component, OnInit, OnDestroy } from '@angular/core';
// // // import { CommonModule } from '@angular/common';
// // // import { FormsModule } from '@angular/forms';
// // // import { ActivatedRoute, Router, RouterModule } from '@angular/router';
// // // import { Subscription } from 'rxjs';
// // // import { AuthService } from '../../../core/services/auth.service';
// // // import { ApiService } from '../../../core/services/api.service';
// // // import { Complaint, User, ComplaintProof } from '../../../shared/models/models';

// // // @Component({
// // //   selector: 'app-complaint-list',
// // //   standalone: true,
// // //   imports: [CommonModule, FormsModule, RouterModule],
// // //   templateUrl: './complaint-list.component.html',
// // //   styleUrls: ['./complaint-list.component.scss']
// // // })
// // // export class ComplaintListComponent implements OnInit, OnDestroy {
// // //   user: any = null;
// // //   role: string | null = null;
// // //   currentUsername = '';

// // //   complaints: Complaint[] = [];
// // //   loading = true;

// // //   activeFilter: 'all' | 'OPEN' | 'IN_PROGRESS' | 'PROOF_SUBMITTED' | 'RESOLVED' | 'REJECTED' = 'all';
// // //   selectedId: number | null = null;
// // //   selected: Complaint | null = null;

// // //   staffList: User[] = [];          // all staff in community
// // //   categoryStaffList: User[] = [];   // staff assigned to selected complaint's category
// // //   assignStaffId: number | null = null;
// // //   closeNote = '';

// // //   proofNote = '';
// // //   proofImage: string | null = null;
// // //   showProofModal = false;

// // //   reviewReason = '';
// // //   showReviewModal = false;
// // //   reviewMode: 'APPROVE' | 'REJECT' = 'APPROVE';

// // //   errorMsg = '';
// // //   successMsg = '';

// // //   private pollHandle: any;
// // //   private subs: Subscription[] = [];

// // //   constructor(
// // //     private auth: AuthService,
// // //     private api: ApiService,
// // //     private route: ActivatedRoute,
// // //     private router: Router
// // //   ) {}

// // //   ngOnInit() {
// // //     this.user = this.auth.getCurrentUser();
// // //     this.role = this.user?.role;
// // //     this.currentUsername = this.user?.username ?? '';
// // //     this.subs.push(this.route.queryParams.subscribe(p => {
// // //       if (p['id']) this.selectedId = +p['id'];
// // //     }));
// // //     this.load();
// // //     this.pollHandle = setInterval(() => this.load(true), 10000);
// // //     if (this.isAdmin()) {
// // //       this.api.getAllUsers('STAFF').subscribe(s => this.staffList = s ?? []);
// // //     }
// // //   }

// // //   ngOnDestroy() {
// // //     if (this.pollHandle) clearInterval(this.pollHandle);
// // //     this.subs.forEach(s => s.unsubscribe());
// // //   }

// // //   isResident() { return this.role === 'RESIDENT'; }
// // //   isStaff() { return this.role === 'STAFF'; }

// // //   /** Returns the most recent rejected proof submitted by this staff member */
// // //   myRejectedProof(c: any): any {
// // //     if (!c?.proofs?.length) return null;
// // //     return c.proofs.find((p: any) =>
// // //       p.submittedByUsername === this.currentUsername && p.status === 'REJECTED'
// // //     ) ?? null;
// // //   }

// // //   /** True when this complaint was rejected and reassigned back to this staff */
// // //   isRework(c: any): boolean {
// // //     if (!c || c.status !== 'ASSIGNED') return false;
// // //     return !!(c.assignedToUsername === this.currentUsername && this.myRejectedProof(c));
// // //   }

// // //   /** True when staff has a rejected proof but complaint is now assigned to someone else */
// // //   isReassignedAway(c: any): boolean {
// // //     if (!c) return false;
// // //     if (c.assignedToUsername === this.currentUsername) return false;
// // //     return !!(c.proofs?.some((p: any) =>
// // //       p.submittedByUsername === this.currentUsername && p.status === 'REJECTED'
// // //     ));
// // //   }
// // //   isAdmin() { return this.role === 'ADMIN' || this.role === 'CO_ADMIN'; }

// // //   private load(silent = false) {
// // //     if (!silent) this.loading = true;
// // //     let obs;
// // //     if (this.isResident()) obs = this.api.getMyComplaints();
// // //     else if (this.isStaff()) obs = this.api.getMyWorkHistory(); // full history including rejected/reassigned
// // //     else obs = this.api.getAllComplaints();

// // //     obs.subscribe({
// // //       next: list => {
// // //         this.complaints = list ?? [];
// // //         this.loading = false;
// // //         if (this.selectedId) {
// // //           const found = this.complaints.find(c => c.id === this.selectedId) ?? null;
// // //           if (found && (!this.selected || this.selected.id !== found.id)) {
// // //             // Auto-selected from URL (e.g. notification click) — load detail + staff
// // //             this.selected = found;
// // //             this.loadDetailAndStaff(found);
// // //           } else if (this.selected) {
// // //             // Polling refresh — keep selected but update data
// // //             const refreshed = this.complaints.find(c => c.id === this.selected!.id);
// // //             if (refreshed) this.selected = { ...this.selected, ...refreshed };
// // //           }
// // //         }
// // //       },
// // //       error: () => { this.loading = false; }
// // //     });
// // //   }

// // //   setFilter(f: typeof this.activeFilter) { this.activeFilter = f; }

// // //   get filtered(): Complaint[] {
// // //     if (this.activeFilter === 'all') return this.complaints;
// // //     return this.complaints.filter(c => {
// // //       if (this.activeFilter === 'OPEN') return c.status === 'OPEN' || c.status === 'SUBMITTED' || c.status === 'ASSIGNED';
// // //       if (this.activeFilter === 'IN_PROGRESS') return c.status === 'IN_PROGRESS';
// // //       if (this.activeFilter === 'PROOF_SUBMITTED') return c.status === 'PROOF_SUBMITTED';
// // //       if (this.activeFilter === 'RESOLVED') return c.status === 'RESOLVED' || c.status === 'CLOSED';
// // //       return true;
// // //     });
// // //   }

// // //   get filterCounts() {
// // //     return {
// // //       all: this.complaints.length,
// // //       OPEN: this.complaints.filter(c =>
// // //         (c.status === 'OPEN' || c.status === 'SUBMITTED' || c.status === 'ASSIGNED')
// // //         && !this.isReassignedAway(c)).length,
// // //       IN_PROGRESS: this.complaints.filter(c => c.status === 'IN_PROGRESS' && !this.isReassignedAway(c)).length,
// // //       PROOF_SUBMITTED: this.complaints.filter(c => c.status === 'PROOF_SUBMITTED').length,
// // //       RESOLVED: this.complaints.filter(c =>
// // //         (c.status === 'RESOLVED' || c.status === 'CLOSED') && !this.isReassignedAway(c)).length,
// // //       REJECTED: this.complaints.filter(c => this.isReassignedAway(c)).length,
// // //     };
// // //   }

// // //   /** Count of complaints where this staff's proof was rejected and handed to another staff */
// // //   get rejectedAwayCount(): number {
// // //     if (!this.isStaff()) return 0;
// // //     return this.complaints.filter(c => this.isReassignedAway(c)).length;
// // //   }

// // //   /** Loads full complaint detail (with images) and category-specific staff list */
// // //   private loadDetailAndStaff(c: Complaint) {
// // //     // Fetch full detail with images
// // //     this.api.getComplaintById(c.id).subscribe({
// // //       next: detail => {
// // //         if (this.selectedId === detail.id) this.selected = detail as any;
// // //       },
// // //       error: () => {}
// // //     });
// // //     // Load staff for this complaint's category
// // //     if (c.categoryId) {
// // //       this.api.getStaffForCategory(c.categoryId).subscribe({
// // //         next: staff => {
// // //           this.categoryStaffList = (staff && staff.length > 0) ? staff : this.staffList;
// // //         },
// // //         error: () => { this.categoryStaffList = this.staffList; }
// // //       });
// // //     } else {
// // //       this.categoryStaffList = this.staffList;
// // //     }
// // //   }

// // //   select(c: Complaint) {
// // //     this.selectedId = c.id;
// // //     this.selected = c;  // show immediately with what we have
// // //     this.errorMsg = '';
// // //     this.successMsg = '';
// // //     this.assignStaffId = null;
// // //     this.categoryStaffList = []; // reset while loading
// // //     this.router.navigate([], { queryParams: { id: c.id }, queryParamsHandling: 'merge' });
// // //     this.loadDetailAndStaff(c);
// // //   }

// // //   close() {
// // //     this.selectedId = null;
// // //     this.selected = null;
// // //     this.router.navigate([], { queryParams: { id: null }, queryParamsHandling: 'merge' });
// // //   }

// // //   doAssign() {
// // //     if (!this.selected || !this.assignStaffId) return;
// // //     this.api.assignComplaint(this.selected.id, this.assignStaffId).subscribe({
// // //       next: c => { this.selected = c; this.successMsg = 'Assigned.'; this.load(true); },
// // //       error: e => this.errorMsg = e.error?.message || 'Failed to assign.'
// // //     });
// // //   }

// // //   doReassign() {
// // //     if (!this.selected || !this.assignStaffId) return;
// // //     this.api.reassignComplaint(this.selected.id, this.assignStaffId).subscribe({
// // //       next: c => { this.selected = c; this.successMsg = 'Reassigned.'; this.load(true); },
// // //       error: e => this.errorMsg = e.error?.message || 'Failed to reassign.'
// // //     });
// // //   }

// // //   doClose() {
// // //     if (!this.selected) return;
// // //     this.api.closeComplaint(this.selected.id, this.closeNote || '').subscribe({
// // //       next: c => { this.selected = c; this.successMsg = 'Closed.'; this.load(true); this.closeNote = ''; },
// // //       error: e => this.errorMsg = e.error?.message || 'Failed to close.'
// // //     });
// // //   }

// // //   doStart() {
// // //     if (!this.selected) return;
// // //     this.api.startWork(this.selected.id).subscribe({
// // //       next: c => { this.selected = c; this.successMsg = 'Started.'; this.load(true); },
// // //       error: e => this.errorMsg = e.error?.message || 'Failed to start.'
// // //     });
// // //   }

// // //   openProofModal() {
// // //     this.proofNote = '';
// // //     this.proofImage = null;
// // //     this.showProofModal = true;
// // //   }

// // //   doSubmitProof() {
// // //     if (!this.selected || !this.proofNote) return;
// // //     this.api.submitProof(this.selected.id, { workNote: this.proofNote, imageBase64: this.proofImage })
// // //       .subscribe({
// // //         next: c => {
// // //           this.selected = c;
// // //           this.showProofModal = false;
// // //           this.successMsg = 'Proof submitted for review.';
// // //           this.load(true);
// // //         },
// // //         error: e => this.errorMsg = e.error?.message || 'Failed to submit proof.'
// // //       });
// // //   }

// // //   openReviewModal(mode: 'APPROVE' | 'REJECT') {
// // //     this.reviewMode = mode;
// // //     this.reviewReason = '';
// // //     this.assignStaffId = null; // reset staff selection each time modal opens
// // //     this.showReviewModal = true;
// // //   }

// // //   doReviewProof() {
// // //     if (!this.selected) return;
// // //     const payload: any = { decision: this.reviewMode };
// // //     if (this.reviewMode === 'REJECT') {
// // //       payload.rejectionReason = this.reviewReason || 'Not satisfactory';
// // //       // Pass reassignToStaffId only if a different staff was explicitly selected
// // //       if (this.assignStaffId) {
// // //         payload.reassignToStaffId = this.assignStaffId;
// // //       }
// // //     }
// // //     this.api.reviewProof(this.selected.id, payload).subscribe({
// // //       next: c => {
// // //         this.selected = c;
// // //         this.showReviewModal = false;
// // //         this.assignStaffId = null; // reset after submit
// // //         this.successMsg = this.reviewMode === 'APPROVE' ? 'Proof approved — marked as resolved.' : 'Proof rejected.';
// // //         this.load(true);
// // //       },
// // //       error: e => this.errorMsg = e.error?.message || 'Failed to review proof.'
// // //     });
// // //   }

// // //   doUpvote(c: Complaint) {
// // //     this.api.upvote(c.id).subscribe({
// // //       next: updated => {
// // //         const i = this.complaints.findIndex(x => x.id === c.id);
// // //         if (i >= 0) this.complaints[i] = updated;
// // //         if (this.selected?.id === c.id) this.selected = updated;
// // //       }
// // //     });
// // //   }

// // //   onProofFile(e: any) {
// // //     const file: File = e.target?.files?.[0];
// // //     if (!file) return;
// // //     const reader = new FileReader();
// // //     reader.onload = () => {
// // //       const result = reader.result as string;
// // //       this.proofImage = result.split(',')[1] ?? '';
// // //     };
// // //     reader.readAsDataURL(file);
// // //   }

// // //   hasPhoto(c: Complaint): boolean {
// // //     return !!(c.thumbnailBase64 || (c.mediaBase64List && c.mediaBase64List.length > 0));
// // //   }
// // //   photoSrc(c: Complaint, i = 0): string {
// // //     const b64 = i === 0
// // //       ? (c.mediaBase64List?.[0] ?? c.thumbnailBase64 ?? '')
// // //       : (c.mediaBase64List?.[i] ?? '');
// // //     if (!b64) return '';
// // //     if (b64.startsWith('/9j/')) return 'data:image/jpeg;base64,' + b64;
// // //     if (b64.startsWith('iVBOR')) return 'data:image/png;base64,' + b64;
// // //     return 'data:image/jpeg;base64,' + b64;
// // //   }
// // //   proofPhoto(p: ComplaintProof): string { return 'data:image/jpeg;base64,' + (p.imageBase64 ?? ''); }

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
// // //     return new Date(iso).toLocaleDateString();
// // //   }

// // //   fullDate(iso: string): string {
// // //     if (!iso) return '';
// // //     return new Date(iso).toLocaleString();
// // //   }

// // //   statusClass(s: string): string { return `status-${s}`; }
// // // }


// // import { Component, OnInit, OnDestroy } from '@angular/core';
// // import { CommonModule } from '@angular/common';
// // import { FormsModule } from '@angular/forms';
// // import { ActivatedRoute, Router, RouterModule } from '@angular/router';
// // import { Subscription } from 'rxjs';
// // import { AuthService } from '../../../core/services/auth.service';
// // import { ApiService } from '../../../core/services/api.service';
// // import { Complaint, User, ComplaintProof } from '../../../shared/models/models';

// // @Component({
// //   selector: 'app-complaint-list',
// //   standalone: true,
// //   imports: [CommonModule, FormsModule, RouterModule],
// //   templateUrl: './complaint-list.component.html',
// //   styleUrls: ['./complaint-list.component.scss']
// // })
// // export class ComplaintListComponent implements OnInit, OnDestroy {
// //   user: any = null;
// //   role: string | null = null;
// //   currentUsername = '';

// //   complaints: Complaint[] = [];
// //   loading = true;

// //   activeFilter: 'all' | 'OPEN' | 'IN_PROGRESS' | 'PROOF_SUBMITTED' | 'RESOLVED' | 'REJECTED' = 'all';
// //   selectedId: number | null = null;
// //   selected: Complaint | null = null;

// //   staffList: User[] = [];          // all staff in community
// //   categoryStaffList: User[] = [];   // staff assigned to selected complaint's category
// //   assignStaffId: number | null = null;
// //   closeNote = '';

// //   proofNote = '';
// //   proofImage: string | null = null;
// //   showProofModal = false;

// //   reviewReason = '';
// //   showReviewModal = false;
// //   reviewMode: 'APPROVE' | 'REJECT' = 'APPROVE';

// //   errorMsg = '';
// //   successMsg = '';

// //   private pollHandle: any;
// //   private subs: Subscription[] = [];

// //   constructor(
// //     private auth: AuthService,
// //     private api: ApiService,
// //     private route: ActivatedRoute,
// //     private router: Router
// //   ) {}

// //   ngOnInit() {
// //     this.user = this.auth.getCurrentUser();
// //     this.role = this.user?.role;
// //     this.currentUsername = this.user?.username ?? '';
// //     this.subs.push(this.route.queryParams.subscribe(p => {
// //       if (p['id']) this.selectedId = +p['id'];
// //     }));
// //     this.load();
// //     this.pollHandle = setInterval(() => this.load(true), 10000);
// //     if (this.isAdmin()) {
// //       this.api.getAllUsers('STAFF').subscribe(s => this.staffList = s ?? []);
// //     }
// //   }

// //   ngOnDestroy() {
// //     if (this.pollHandle) clearInterval(this.pollHandle);
// //     this.subs.forEach(s => s.unsubscribe());
// //   }

// //   isResident() { return this.role === 'RESIDENT'; }
// //   isStaff() { return this.role === 'STAFF'; }

// //   /** Returns the most recent rejected proof submitted by this staff member */
// //   myRejectedProof(c: any): any {
// //     if (!c?.proofs?.length) return null;
// //     return c.proofs.find((p: any) =>
// //       p.submittedByUsername === this.currentUsername && p.status === 'REJECTED'
// //     ) ?? null;
// //   }

// //   /** True when this complaint was rejected and reassigned back to this staff */
// //   isRework(c: any): boolean {
// //     if (!c || c.status !== 'ASSIGNED') return false;
// //     return !!(c.assignedToUsername === this.currentUsername && this.myRejectedProof(c));
// //   }

// //   /** True when staff has a rejected proof but complaint is now assigned to someone else */
// //   isReassignedAway(c: any): boolean {
// //     if (!c) return false;
// //     if (c.assignedToUsername === this.currentUsername) return false;
// //     return !!(c.proofs?.some((p: any) =>
// //       p.submittedByUsername === this.currentUsername && p.status === 'REJECTED'
// //     ));
// //   }
// //   isAdmin() { return this.role === 'ADMIN' || this.role === 'CO_ADMIN'; }

// //   private load(silent = false) {
// //     if (!silent) this.loading = true;
// //     let obs;
// //     if (this.isResident()) obs = this.api.getMyComplaints();
// //     else if (this.isStaff()) obs = this.api.getMyWorkHistory(); // includes current assignments + rejected history
// //     else obs = this.api.getAllComplaints();

// //     obs.subscribe({
// //       next: list => {
// //         this.complaints = list ?? [];
// //         this.loading = false;
// //         if (this.selectedId) {
// //           const found = this.complaints.find(c => c.id === this.selectedId) ?? null;
// //           if (found && (!this.selected || this.selected.id !== found.id)) {
// //             // Auto-selected from URL (e.g. notification click) — load detail + staff
// //             this.selected = found;
// //             this.loadDetailAndStaff(found);
// //           } else if (this.selected) {
// //             // Polling refresh — keep selected but update data
// //             const refreshed = this.complaints.find(c => c.id === this.selected!.id);
// //             if (refreshed) this.selected = { ...this.selected, ...refreshed };
// //           }
// //         }
// //       },
// //       error: () => { this.loading = false; }
// //     });
// //   }

// //   setFilter(f: typeof this.activeFilter) { this.activeFilter = f; }

// //   get filtered(): Complaint[] {
// //     if (this.activeFilter === 'all') return this.complaints;
// //     return this.complaints.filter(c => {
// //       if (this.activeFilter === 'OPEN') return c.status === 'OPEN' || c.status === 'SUBMITTED' || c.status === 'ASSIGNED';
// //       if (this.activeFilter === 'IN_PROGRESS') return c.status === 'IN_PROGRESS';
// //       if (this.activeFilter === 'PROOF_SUBMITTED') return c.status === 'PROOF_SUBMITTED';
// //       if (this.activeFilter === 'RESOLVED') return c.status === 'RESOLVED' || c.status === 'CLOSED';
// //       return true;
// //     });
// //   }

// //   get filterCounts() {
// //     return {
// //       all: this.complaints.length,
// //       OPEN: this.complaints.filter(c =>
// //         (c.status === 'OPEN' || c.status === 'SUBMITTED' || c.status === 'ASSIGNED')
// //         && !this.isReassignedAway(c)).length,
// //       IN_PROGRESS: this.complaints.filter(c => c.status === 'IN_PROGRESS' && !this.isReassignedAway(c)).length,
// //       PROOF_SUBMITTED: this.complaints.filter(c => c.status === 'PROOF_SUBMITTED').length,
// //       RESOLVED: this.complaints.filter(c =>
// //         (c.status === 'RESOLVED' || c.status === 'CLOSED') && !this.isReassignedAway(c)).length,
// //       REJECTED: this.complaints.filter(c => this.isReassignedAway(c)).length,
// //     };
// //   }

// //   /** Count of complaints where this staff's proof was rejected and handed to another staff */
// //   get rejectedAwayCount(): number {
// //     if (!this.isStaff()) return 0;
// //     return this.complaints.filter(c => this.isReassignedAway(c)).length;
// //   }

// //   /** Loads full complaint detail (with images) and category-specific staff list */
// //   private loadDetailAndStaff(c: Complaint) {
// //     // Fetch full detail with images
// //     this.api.getComplaintById(c.id).subscribe({
// //       next: detail => {
// //         if (this.selectedId === detail.id) this.selected = detail as any;
// //       },
// //       error: () => {}
// //     });
// //     // Load staff for this complaint's category
// //     if (c.categoryId) {
// //       this.api.getStaffForCategory(c.categoryId).subscribe({
// //         next: staff => {
// //           this.categoryStaffList = (staff && staff.length > 0) ? staff : this.staffList;
// //         },
// //         error: () => { this.categoryStaffList = this.staffList; }
// //       });
// //     } else {
// //       this.categoryStaffList = this.staffList;
// //     }
// //   }

// //   select(c: Complaint) {
// //     this.selectedId = c.id;
// //     this.selected = c;  // show immediately with what we have
// //     this.errorMsg = '';
// //     this.successMsg = '';
// //     this.assignStaffId = null;
// //     this.categoryStaffList = []; // reset while loading
// //     this.router.navigate([], { queryParams: { id: c.id }, queryParamsHandling: 'merge' });
// //     this.loadDetailAndStaff(c);
// //   }

// //   close() {
// //     this.selectedId = null;
// //     this.selected = null;
// //     this.router.navigate([], { queryParams: { id: null }, queryParamsHandling: 'merge' });
// //   }

// //   doAssign() {
// //     if (!this.selected || !this.assignStaffId) return;
// //     this.api.assignComplaint(this.selected.id, this.assignStaffId).subscribe({
// //       next: c => { this.selected = c; this.successMsg = 'Assigned.'; this.load(true); },
// //       error: e => this.errorMsg = e.error?.message || 'Failed to assign.'
// //     });
// //   }

// //   doReassign() {
// //     if (!this.selected || !this.assignStaffId) return;
// //     this.api.reassignComplaint(this.selected.id, this.assignStaffId).subscribe({
// //       next: c => { this.selected = c; this.successMsg = 'Reassigned.'; this.load(true); },
// //       error: e => this.errorMsg = e.error?.message || 'Failed to reassign.'
// //     });
// //   }

// //   doClose() {
// //     if (!this.selected) return;
// //     this.api.closeComplaint(this.selected.id, this.closeNote || '').subscribe({
// //       next: c => { this.selected = c; this.successMsg = 'Closed.'; this.load(true); this.closeNote = ''; },
// //       error: e => this.errorMsg = e.error?.message || 'Failed to close.'
// //     });
// //   }

// //   doStart() {
// //     if (!this.selected) return;
// //     this.api.startWork(this.selected.id).subscribe({
// //       next: c => { this.selected = c; this.successMsg = 'Started.'; this.load(true); },
// //       error: e => this.errorMsg = e.error?.message || 'Failed to start.'
// //     });
// //   }

// //   openProofModal() {
// //     this.proofNote = '';
// //     this.proofImage = null;
// //     this.showProofModal = true;
// //   }

// //   doSubmitProof() {
// //     if (!this.selected || !this.proofNote) return;
// //     this.api.submitProof(this.selected.id, { workNote: this.proofNote, imageBase64: this.proofImage })
// //       .subscribe({
// //         next: c => {
// //           this.selected = c;
// //           this.showProofModal = false;
// //           this.successMsg = 'Proof submitted for review.';
// //           this.load(true);
// //         },
// //         error: e => this.errorMsg = e.error?.message || 'Failed to submit proof.'
// //       });
// //   }

// //   openReviewModal(mode: 'APPROVE' | 'REJECT') {
// //     this.reviewMode = mode;
// //     this.reviewReason = '';
// //     this.assignStaffId = null; // reset staff selection each time modal opens
// //     this.showReviewModal = true;
// //   }

// //   doReviewProof() {
// //     if (!this.selected) return;
// //     const payload: any = { decision: this.reviewMode };
// //     if (this.reviewMode === 'REJECT') {
// //       payload.rejectionReason = this.reviewReason || 'Not satisfactory';
// //       // Pass reassignToStaffId only if a different staff was explicitly selected
// //       if (this.assignStaffId) {
// //         payload.reassignToStaffId = this.assignStaffId;
// //       }
// //     }
// //     this.api.reviewProof(this.selected.id, payload).subscribe({
// //       next: c => {
// //         this.selected = c;
// //         this.showReviewModal = false;
// //         this.assignStaffId = null; // reset after submit
// //         this.successMsg = this.reviewMode === 'APPROVE' ? 'Proof approved — marked as resolved.' : 'Proof rejected.';
// //         this.load(true);
// //       },
// //       error: e => this.errorMsg = e.error?.message || 'Failed to review proof.'
// //     });
// //   }

// //   doUpvote(c: Complaint) {
// //     this.api.upvote(c.id).subscribe({
// //       next: updated => {
// //         const i = this.complaints.findIndex(x => x.id === c.id);
// //         if (i >= 0) this.complaints[i] = updated;
// //         if (this.selected?.id === c.id) this.selected = updated;
// //       }
// //     });
// //   }

// //   onProofFile(e: any) {
// //     const file: File = e.target?.files?.[0];
// //     if (!file) return;
// //     const reader = new FileReader();
// //     reader.onload = () => {
// //       const result = reader.result as string;
// //       this.proofImage = result.split(',')[1] ?? '';
// //     };
// //     reader.readAsDataURL(file);
// //   }

// //   hasPhoto(c: Complaint): boolean {
// //     return !!(c.thumbnailBase64 || (c.mediaBase64List && c.mediaBase64List.length > 0));
// //   }
// //   photoSrc(c: Complaint, i = 0): string {
// //     const b64 = i === 0
// //       ? (c.mediaBase64List?.[0] ?? c.thumbnailBase64 ?? '')
// //       : (c.mediaBase64List?.[i] ?? '');
// //     if (!b64) return '';
// //     if (b64.startsWith('/9j/')) return 'data:image/jpeg;base64,' + b64;
// //     if (b64.startsWith('iVBOR')) return 'data:image/png;base64,' + b64;
// //     return 'data:image/jpeg;base64,' + b64;
// //   }
// //   proofPhoto(p: ComplaintProof): string { return 'data:image/jpeg;base64,' + (p.imageBase64 ?? ''); }

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
// //     return new Date(iso).toLocaleDateString();
// //   }

// //   fullDate(iso: string): string {
// //     if (!iso) return '';
// //     return new Date(iso).toLocaleString();
// //   }

// //   statusClass(s: string): string { return `status-${s}`; }
// // }


// import { Component, OnInit, OnDestroy } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { FormsModule } from '@angular/forms';
// import { ActivatedRoute, Router, RouterModule } from '@angular/router';
// import { Subscription } from 'rxjs';
// import { AuthService } from '../../../core/services/auth.service';
// import { ApiService } from '../../../core/services/api.service';
// import { Complaint, User, ComplaintProof } from '../../../shared/models/models';

// @Component({
//   selector: 'app-complaint-list',
//   standalone: true,
//   imports: [CommonModule, FormsModule, RouterModule],
//   templateUrl: './complaint-list.component.html',
//   styleUrls: ['./complaint-list.component.scss']
// })
// export class ComplaintListComponent implements OnInit, OnDestroy {
//   user: any = null;
//   role: string | null = null;
//   currentUsername = '';

//   complaints: Complaint[] = [];
//   loading = true;

//   activeFilter: 'all' | 'OPEN' | 'IN_PROGRESS' | 'PROOF_SUBMITTED' | 'RESOLVED' | 'REJECTED' = 'all';
//   selectedId: number | null = null;
//   selected: Complaint | null = null;

//   staffList: User[] = [];          // all staff in community
//   categoryStaffList: User[] = [];   // staff assigned to selected complaint's category
//   assignStaffId: number | null = null;
//   closeNote = '';

//   proofNote = '';
//   proofImage: string | null = null;
//   showProofModal = false;

//   reviewReason = '';
//   showReviewModal = false;
//   reviewMode: 'APPROVE' | 'REJECT' = 'APPROVE';

//   errorMsg = '';
//   successMsg = '';

//   private pollHandle: any;
//   private subs: Subscription[] = [];

//   constructor(
//     private auth: AuthService,
//     private api: ApiService,
//     private route: ActivatedRoute,
//     private router: Router
//   ) {}

//   ngOnInit() {
//     this.user = this.auth.getCurrentUser();
//     this.role = this.user?.role;
//     this.currentUsername = this.user?.username ?? '';
//     this.subs.push(this.route.queryParams.subscribe(p => {
//       if (p['id']) this.selectedId = +p['id'];
//     }));
//     this.load();
//     this.pollHandle = setInterval(() => this.load(true), 10000);
//     if (this.isAdmin()) {
//       this.api.getAllUsers('STAFF').subscribe(s => this.staffList = s ?? []);
//     }
//   }

//   ngOnDestroy() {
//     if (this.pollHandle) clearInterval(this.pollHandle);
//     this.subs.forEach(s => s.unsubscribe());
//   }

//   isResident() { return this.role === 'RESIDENT'; }
//   isStaff() { return this.role === 'STAFF'; }

//   /** Returns rejection reason from backend-computed field */
//   myRejectedProof(c: any): any {
//     if (!c?.myProofRejected) return null;
//     return { rejectionReason: c.myRejectionReason };
//   }

//   /** True when this complaint was rejected and reassigned back to this staff */
//   isRework(c: any): boolean {
//     if (!c || c.status !== 'ASSIGNED') return false;
//     return !!(c.assignedToUsername === this.currentUsername && this.myRejectedProof(c));
//   }

//   /** True when staff has a rejected proof but complaint is now assigned to someone else */
//   isReassignedAway(c: any): boolean {
//     if (!c) return false;
//     if (c.assignedToUsername === this.currentUsername) return false;
//     return !!(c.proofs?.some((p: any) =>
//       p.submittedByUsername === this.currentUsername && p.status === 'REJECTED'
//     ));
//   }
//   isAdmin() { return this.role === 'ADMIN' || this.role === 'CO_ADMIN'; }

//   private load(silent = false) {
//     if (!silent) this.loading = true;
//     let obs;
//     if (this.isResident()) obs = this.api.getMyComplaints();
//     else if (this.isStaff()) obs = this.api.getMyWorkHistory(); // includes current assignments + rejected history
//     else obs = this.api.getAllComplaints();

//     obs.subscribe({
//       next: list => {
//         this.complaints = list ?? [];
//         this.loading = false;
//         if (this.selectedId) {
//           const found = this.complaints.find(c => c.id === this.selectedId) ?? null;
//           if (found && (!this.selected || this.selected.id !== found.id)) {
//             // Auto-selected from URL (e.g. notification click) — load detail + staff
//             this.selected = found;
//             this.loadDetailAndStaff(found);
//           } else if (this.selected) {
//             // Polling refresh — keep selected but update data
//             const refreshed = this.complaints.find(c => c.id === this.selected!.id);
//             if (refreshed) this.selected = { ...this.selected, ...refreshed };
//           }
//         }
//       },
//       error: () => { this.loading = false; }
//     });
//   }

//   setFilter(f: typeof this.activeFilter) { this.activeFilter = f; }

//   get filtered(): Complaint[] {
//     if (this.activeFilter === 'all') return this.complaints;
//     return this.complaints.filter(c => {
//       if (this.activeFilter === 'OPEN') return c.status === 'OPEN' || c.status === 'SUBMITTED' || c.status === 'ASSIGNED';
//       if (this.activeFilter === 'IN_PROGRESS') return c.status === 'IN_PROGRESS';
//       if (this.activeFilter === 'PROOF_SUBMITTED') return c.status === 'PROOF_SUBMITTED';
//       if (this.activeFilter === 'RESOLVED') return c.status === 'RESOLVED' || c.status === 'CLOSED';
//       return true;
//     });
//   }

//   get filterCounts() {
//     return {
//       all: this.complaints.length,
//       OPEN: this.complaints.filter(c =>
//         (c.status === 'OPEN' || c.status === 'SUBMITTED' || c.status === 'ASSIGNED')
//         && !this.isReassignedAway(c)).length,
//       IN_PROGRESS: this.complaints.filter(c => c.status === 'IN_PROGRESS' && !this.isReassignedAway(c)).length,
//       PROOF_SUBMITTED: this.complaints.filter(c => c.status === 'PROOF_SUBMITTED').length,
//       RESOLVED: this.complaints.filter(c =>
//         (c.status === 'RESOLVED' || c.status === 'CLOSED') && !this.isReassignedAway(c)).length,
//       REJECTED: this.complaints.filter(c => this.isReassignedAway(c)).length,
//     };
//   }

//   /** Count of complaints where this staff's proof was rejected and handed to another staff */
//   get rejectedAwayCount(): number {
//     if (!this.isStaff()) return 0;
//     return this.complaints.filter(c => this.isReassignedAway(c)).length;
//   }

//   /** Loads full complaint detail (with images) and category-specific staff list */
//   private loadDetailAndStaff(c: Complaint) {
//     // Fetch full detail with images
//     this.api.getComplaintById(c.id).subscribe({
//       next: detail => {
//         if (this.selectedId === detail.id) this.selected = detail as any;
//       },
//       error: () => {}
//     });
//     // Load staff for this complaint's category
//     if (c.categoryId) {
//       this.api.getStaffForCategory(c.categoryId).subscribe({
//         next: staff => {
//           this.categoryStaffList = (staff && staff.length > 0) ? staff : this.staffList;
//         },
//         error: () => { this.categoryStaffList = this.staffList; }
//       });
//     } else {
//       this.categoryStaffList = this.staffList;
//     }
//   }

//   select(c: Complaint) {
//     this.selectedId = c.id;
//     this.selected = c;  // show immediately with what we have
//     this.errorMsg = '';
//     this.successMsg = '';
//     this.assignStaffId = null;
//     this.categoryStaffList = []; // reset while loading
//     this.router.navigate([], { queryParams: { id: c.id }, queryParamsHandling: 'merge' });
//     this.loadDetailAndStaff(c);
//   }

//   close() {
//     this.selectedId = null;
//     this.selected = null;
//     this.router.navigate([], { queryParams: { id: null }, queryParamsHandling: 'merge' });
//   }

//   doAssign() {
//     if (!this.selected || !this.assignStaffId) return;
//     this.api.assignComplaint(this.selected.id, this.assignStaffId).subscribe({
//       next: c => { this.selected = c; this.successMsg = 'Assigned.'; this.load(true); },
//       error: e => this.errorMsg = e.error?.message || 'Failed to assign.'
//     });
//   }

//   doReassign() {
//     if (!this.selected || !this.assignStaffId) return;
//     this.api.reassignComplaint(this.selected.id, this.assignStaffId).subscribe({
//       next: c => { this.selected = c; this.successMsg = 'Reassigned.'; this.load(true); },
//       error: e => this.errorMsg = e.error?.message || 'Failed to reassign.'
//     });
//   }

//   doClose() {
//     if (!this.selected) return;
//     this.api.closeComplaint(this.selected.id, this.closeNote || '').subscribe({
//       next: c => { this.selected = c; this.successMsg = 'Closed.'; this.load(true); this.closeNote = ''; },
//       error: e => this.errorMsg = e.error?.message || 'Failed to close.'
//     });
//   }

//   doStart() {
//     if (!this.selected) return;
//     this.api.startWork(this.selected.id).subscribe({
//       next: c => { this.selected = c; this.successMsg = 'Started.'; this.load(true); },
//       error: e => this.errorMsg = e.error?.message || 'Failed to start.'
//     });
//   }

//   openProofModal() {
//     this.proofNote = '';
//     this.proofImage = null;
//     this.showProofModal = true;
//   }

//   doSubmitProof() {
//     if (!this.selected || !this.proofNote) return;
//     this.api.submitProof(this.selected.id, { workNote: this.proofNote, imageBase64: this.proofImage })
//       .subscribe({
//         next: c => {
//           this.selected = c;
//           this.showProofModal = false;
//           this.successMsg = 'Proof submitted for review.';
//           this.load(true);
//         },
//         error: e => this.errorMsg = e.error?.message || 'Failed to submit proof.'
//       });
//   }

//   openReviewModal(mode: 'APPROVE' | 'REJECT') {
//     this.reviewMode = mode;
//     this.reviewReason = '';
//     this.assignStaffId = null; // reset staff selection each time modal opens
//     this.showReviewModal = true;
//   }

//   doReviewProof() {
//     if (!this.selected) return;
//     const payload: any = { decision: this.reviewMode };
//     if (this.reviewMode === 'REJECT') {
//       payload.rejectionReason = this.reviewReason || 'Not satisfactory';
//       // Pass reassignToStaffId only if a different staff was explicitly selected
//       if (this.assignStaffId) {
//         payload.reassignToStaffId = this.assignStaffId;
//       }
//     }
//     this.api.reviewProof(this.selected.id, payload).subscribe({
//       next: c => {
//         this.selected = c;
//         this.showReviewModal = false;
//         this.assignStaffId = null; // reset after submit
//         this.successMsg = this.reviewMode === 'APPROVE' ? 'Proof approved — marked as resolved.' : 'Proof rejected.';
//         this.load(true);
//       },
//       error: e => this.errorMsg = e.error?.message || 'Failed to review proof.'
//     });
//   }

//   doUpvote(c: Complaint) {
//     this.api.upvote(c.id).subscribe({
//       next: updated => {
//         const i = this.complaints.findIndex(x => x.id === c.id);
//         if (i >= 0) this.complaints[i] = updated;
//         if (this.selected?.id === c.id) this.selected = updated;
//       }
//     });
//   }

//   onProofFile(e: any) {
//     const file: File = e.target?.files?.[0];
//     if (!file) return;
//     const reader = new FileReader();
//     reader.onload = () => {
//       const result = reader.result as string;
//       this.proofImage = result.split(',')[1] ?? '';
//     };
//     reader.readAsDataURL(file);
//   }

//   hasPhoto(c: Complaint): boolean {
//     return !!(c.thumbnailBase64 || (c.mediaBase64List && c.mediaBase64List.length > 0));
//   }
//   photoSrc(c: Complaint, i = 0): string {
//     const b64 = i === 0
//       ? (c.mediaBase64List?.[0] ?? c.thumbnailBase64 ?? '')
//       : (c.mediaBase64List?.[i] ?? '');
//     if (!b64) return '';
//     if (b64.startsWith('/9j/')) return 'data:image/jpeg;base64,' + b64;
//     if (b64.startsWith('iVBOR')) return 'data:image/png;base64,' + b64;
//     return 'data:image/jpeg;base64,' + b64;
//   }
//   proofPhoto(p: ComplaintProof): string { return 'data:image/jpeg;base64,' + (p.imageBase64 ?? ''); }

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

//   fullDate(iso: string): string {
//     if (!iso) return '';
//     return new Date(iso).toLocaleString();
//   }

//   statusClass(s: string): string { return `status-${s}`; }
// }














import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { ApiService } from '../../../core/services/api.service';
import { AssignComplaintRequest, Complaint, User, ComplaintProof } from '../../../shared/models/models';

@Component({
  selector: 'app-complaint-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './complaint-list.component.html',
  styleUrls: ['./complaint-list.component.scss']
})
export class ComplaintListComponent implements OnInit, OnDestroy {
  @ViewChild('proofCameraVideo') proofCameraVideo?: ElementRef<HTMLVideoElement>;
  user: any = null;
  role: string | null = null;
  currentUsername = '';

  complaints: Complaint[] = [];
  loading = true;

  activeFilter: 'all' | 'OPEN' | 'IN_PROGRESS' | 'PROOF_SUBMITTED' | 'RESOLVED' | 'REJECTED' = 'all';
  selectedId: number | null = null;
  selected: Complaint | null = null;

  staffList: User[] = [];          // all staff in community
  categoryStaffList: User[] = [];   // staff assigned to selected complaint's category
  assignStaffId: number | null = null;
  assignEta = '';
  closeNote = '';

  proofNote = '';
  proofImage: string | null = null;
  showProofModal = false;
  showProofCameraModal = false;
  proofCameraError = '';
  proofCameraStarting = false;

  reviewReason = '';
  showReviewModal = false;
  reviewMode: 'APPROVE' | 'REJECT' = 'APPROVE';

  errorMsg = '';
  successMsg = '';

  private pollHandle: any;
  private subs: Subscription[] = [];
  private proofCameraStream: MediaStream | null = null;

  constructor(
    private auth: AuthService,
    private api: ApiService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    this.user = this.auth.getCurrentUser();
    this.role = this.user?.role;
    this.currentUsername = this.user?.username ?? '';
    this.subs.push(this.route.queryParams.subscribe(p => {
      this.selectedId = p['id'] ? +p['id'] : null;
      if (!this.selectedId) {
        this.selected = null;
      }
    }));
    this.load();
    this.pollHandle = setInterval(() => this.load(true), 10000);
    if (this.isAdmin()) {
      this.api.getAllUsers('STAFF').subscribe(s => this.staffList = s ?? []);
    }
  }

  ngOnDestroy() {
    if (this.pollHandle) clearInterval(this.pollHandle);
    this.stopProofCamera();
    this.subs.forEach(s => s.unsubscribe());
  }

  isResident() { return this.role === 'RESIDENT'; }
  isStaff() { return this.role === 'STAFF'; }

  /** Returns rejection reason from backend-computed field */
  myRejectedProof(c: any): any {
    if (!c?.myProofRejected) return null;
    return { rejectionReason: c.myRejectionReason };
  }

  /** True when this complaint was rejected and reassigned back to this staff */
  isRework(c: any): boolean {
    if (!c || c.status !== 'ASSIGNED') return false;
    return !!(c.assignedToUsername === this.currentUsername && this.myRejectedProof(c));
  }

  /** True when staff has a rejected proof but complaint is now assigned to someone else */
  isReassignedAway(c: any): boolean {
    if (!c) return false;
    if (c.assignedToUsername === this.currentUsername) return false;
    return !!(c.proofs?.some((p: any) =>
      p.submittedByUsername === this.currentUsername && p.status === 'REJECTED'
    ));
  }
  isAdmin() { return this.role === 'ADMIN' || this.role === 'CO_ADMIN'; }

  private load(silent = false) {
    if (!silent) this.loading = true;
    let obs;
    if (this.isResident()) obs = this.api.getMyComplaints();
    else if (this.isStaff()) obs = this.api.getMyWorkHistory(); // includes current assignments + rejected history
    else obs = this.api.getAllComplaints();

    obs.subscribe({
      next: list => {
        this.complaints = list ?? [];
        this.loading = false;
        if (this.selectedId) {
          const found = this.complaints.find(c => c.id === this.selectedId) ?? null;
          if (found && (!this.selected || this.selected.id !== found.id)) {
            // Auto-selected from URL (e.g. notification click) — load detail + staff
            this.selected = found;
            this.assignEta = this.toDateTimeLocalValue(found.estimatedResolutionAt);
            this.loadDetailAndStaff(found);
          } else if (!found) {
            this.loadSelectedComplaintById(this.selectedId);
          } else if (this.selected) {
            // Polling refresh — keep selected but update data
            const refreshed = this.complaints.find(c => c.id === this.selected!.id);
            if (refreshed) this.selected = { ...this.selected, ...refreshed };
            else this.loadSelectedComplaintById(this.selected.id);
          }
        }
      },
      error: () => { this.loading = false; }
    });
  }

  private loadSelectedComplaintById(id: number) {
    this.api.getComplaintById(id).subscribe({
      next: detail => {
        if (this.selectedId !== detail.id) return;
        this.selected = detail as any;
        this.assignEta = this.toDateTimeLocalValue(detail.estimatedResolutionAt);
        if (detail.categoryId && this.isAdmin()) {
          this.api.getStaffForCategory(detail.categoryId).subscribe({
            next: staff => {
              this.categoryStaffList = (staff && staff.length > 0) ? staff : this.staffList;
            },
            error: () => { this.categoryStaffList = this.staffList; }
          });
        }
      },
      error: () => {
        if (this.selectedId === id) {
          this.errorMsg = 'Could not open this complaint.';
          this.selected = null;
        }
      }
    });
  }

  setFilter(f: typeof this.activeFilter) { this.activeFilter = f; }

  get filtered(): Complaint[] {
    if (this.activeFilter === 'all') return this.complaints;
    return this.complaints.filter(c => {
      if (this.activeFilter === 'REJECTED') return this.isReassignedAway(c);
      if (this.activeFilter === 'OPEN')
        return (c.status === 'OPEN' || c.status === 'SUBMITTED' || c.status === 'ASSIGNED')
               && !this.isReassignedAway(c);
      if (this.activeFilter === 'IN_PROGRESS')
        return c.status === 'IN_PROGRESS' && !this.isReassignedAway(c);
      if (this.activeFilter === 'PROOF_SUBMITTED')
        return c.status === 'PROOF_SUBMITTED' && !this.isReassignedAway(c);
      if (this.activeFilter === 'RESOLVED')
        return (c.status === 'RESOLVED' || c.status === 'CLOSED') && !this.isReassignedAway(c);
      return true;
    });
  }

  get filterCounts() {
    return {
      all: this.complaints.length,
      OPEN: this.complaints.filter(c =>
        (c.status === 'OPEN' || c.status === 'SUBMITTED' || c.status === 'ASSIGNED')
        && !this.isReassignedAway(c)).length,
      IN_PROGRESS: this.complaints.filter(c => c.status === 'IN_PROGRESS' && !this.isReassignedAway(c)).length,
      PROOF_SUBMITTED: this.complaints.filter(c => c.status === 'PROOF_SUBMITTED').length,
      RESOLVED: this.complaints.filter(c =>
        (c.status === 'RESOLVED' || c.status === 'CLOSED') && !this.isReassignedAway(c)).length,
      REJECTED: this.complaints.filter(c => this.isReassignedAway(c)).length,
    };
  }

  /** Count of complaints where this staff's proof was rejected and handed to another staff */
  get rejectedAwayCount(): number {
    if (!this.isStaff()) return 0;
    return this.complaints.filter(c => this.isReassignedAway(c)).length;
  }

  /** Loads full complaint detail (with images) and category-specific staff list */
  private loadDetailAndStaff(c: Complaint) {
    // Fetch full detail with images
    this.api.getComplaintById(c.id).subscribe({
      next: detail => {
        if (this.selectedId === detail.id) this.selected = detail as any;
      },
      error: () => {}
    });
    // Load staff for this complaint's category
    if (c.categoryId) {
      this.api.getStaffForCategory(c.categoryId).subscribe({
        next: staff => {
          this.categoryStaffList = (staff && staff.length > 0) ? staff : this.staffList;
        },
        error: () => { this.categoryStaffList = this.staffList; }
      });
    } else {
      this.categoryStaffList = this.staffList;
    }
  }

  select(c: Complaint) {
    this.selectedId = c.id;
    this.selected = c;  // show immediately with what we have
    this.errorMsg = '';
    this.successMsg = '';
    this.assignStaffId = null;
    this.assignEta = this.toDateTimeLocalValue(c.estimatedResolutionAt);
    this.categoryStaffList = []; // reset while loading
    this.router.navigate([], { queryParams: { id: c.id }, queryParamsHandling: 'merge' });
    this.loadDetailAndStaff(c);
  }

  close() {
    this.selectedId = null;
    this.selected = null;
    this.router.navigate([], { queryParams: { id: null }, queryParamsHandling: 'merge' });
  }

  doAssign() {
    if (!this.selected) return;
    const payload = this.buildAssignPayload();
    if (!payload) return;
    this.api.assignComplaint(this.selected.id, payload).subscribe({
      next: c => {
        this.selected = c;
        this.assignEta = this.toDateTimeLocalValue(c.estimatedResolutionAt);
        this.successMsg = 'Assigned with ETA.';
        this.load(true);
      },
      error: e => this.errorMsg = e.error?.message || 'Failed to assign.'
    });
  }

  doReassign() {
    if (!this.selected) return;
    const payload = this.buildAssignPayload();
    if (!payload) return;
    this.api.reassignComplaint(this.selected.id, payload).subscribe({
      next: c => {
        this.selected = c;
        this.assignEta = this.toDateTimeLocalValue(c.estimatedResolutionAt);
        this.successMsg = 'Reassigned with updated ETA.';
        this.load(true);
      },
      error: e => this.errorMsg = e.error?.message || 'Failed to reassign.'
    });
  }

  doClose() {
    if (!this.selected) return;
    this.api.closeComplaint(this.selected.id, this.closeNote || '').subscribe({
      next: c => { this.selected = c; this.successMsg = 'Closed.'; this.load(true); this.closeNote = ''; },
      error: e => this.errorMsg = e.error?.message || 'Failed to close.'
    });
  }

  doStart() {
    if (!this.selected) return;
    this.api.startWork(this.selected.id).subscribe({
      next: c => { this.selected = c; this.successMsg = 'Started.'; this.load(true); },
      error: e => this.errorMsg = e.error?.message || 'Failed to start.'
    });
  }

  openProofModal() {
    this.proofNote = '';
    this.proofImage = null;
    this.proofCameraError = '';
    this.showProofModal = true;
  }

  openProofCamera() {
    this.proofCameraError = '';
    this.showProofCameraModal = true;
    this.proofCameraStarting = true;
    setTimeout(() => void this.startProofCamera(), 0);
  }

  closeProofCamera() {
    this.showProofCameraModal = false;
    this.proofCameraError = '';
    this.stopProofCamera();
  }

  captureProofPhoto() {
    const video = this.proofCameraVideo?.nativeElement;
    if (!video || video.videoWidth === 0 || video.videoHeight === 0) {
      this.proofCameraError = 'Camera preview is not ready yet. Please try again.';
      return;
    }
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      this.proofCameraError = 'Could not capture the photo. Please try again.';
      return;
    }
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const result = canvas.toDataURL('image/jpeg', 0.88);
    this.proofImage = result.split(',')[1] ?? null;
    if (!this.proofImage) {
      this.proofCameraError = 'Could not capture the photo. Please try again.';
      return;
    }
    this.closeProofCamera();
  }

  doSubmitProof() {
    if (!this.selected || !this.proofNote) return;
    this.api.submitProof(this.selected.id, { workNote: this.proofNote, imageBase64: this.proofImage })
      .subscribe({
        next: c => {
          this.selected = c;
          this.closeProofCamera();
          this.showProofModal = false;
          this.successMsg = 'Proof submitted for review.';
          this.load(true);
        },
        error: e => this.errorMsg = e.error?.message || 'Failed to submit proof.'
      });
  }

  openReviewModal(mode: 'APPROVE' | 'REJECT') {
    this.reviewMode = mode;
    this.reviewReason = '';
    this.assignStaffId = null; // reset staff selection each time modal opens
    this.showReviewModal = true;
  }

  doReviewProof() {
    if (!this.selected) return;
    const payload: any = { decision: this.reviewMode };
    if (this.reviewMode === 'REJECT') {
      payload.rejectionReason = this.reviewReason || 'Not satisfactory';
      // Pass reassignToStaffId only if a different staff was explicitly selected
      if (this.assignStaffId) {
        payload.reassignToStaffId = this.assignStaffId;
      }
    }
    this.api.reviewProof(this.selected.id, payload).subscribe({
      next: c => {
        this.selected = c;
        this.showReviewModal = false;
        this.assignStaffId = null; // reset after submit
        this.successMsg = this.reviewMode === 'APPROVE' ? 'Proof approved — marked as resolved.' : 'Proof rejected.';
        this.load(true);
      },
      error: e => this.errorMsg = e.error?.message || 'Failed to review proof.'
    });
  }

  doUpvote(c: Complaint) {
    this.api.upvote(c.id).subscribe({
      next: updated => {
        const i = this.complaints.findIndex(x => x.id === c.id);
        if (i >= 0) this.complaints[i] = updated;
        if (this.selected?.id === c.id) this.selected = updated;
        this.successMsg = 'Marked as affecting you.';
      },
      error: e => this.errorMsg = e.error?.message || 'Could not mark this complaint.'
    });
  }

  canDeleteComplaint(c: Complaint | null | undefined): boolean {
    if (!c || !this.isResident()) return false;
    return c.status === 'SUBMITTED' || c.status === 'OPEN';
  }

  doDeleteComplaint() {
    if (!this.selected || !this.canDeleteComplaint(this.selected)) return;
    const complaintNumber = this.selected.communityComplaintNumber ?? this.selected.id;
    const confirmed = window.confirm(`Delete complaint #${complaintNumber}? This cannot be undone.`);
    if (!confirmed) return;

    this.api.deleteComplaint(this.selected.id).subscribe({
      next: () => {
        this.successMsg = `Complaint #${complaintNumber} deleted.`;
        this.complaints = this.complaints.filter(c => c.id !== this.selected?.id);
        this.close();
        this.load(true);
      },
      error: e => this.errorMsg = e.error?.message || 'Failed to delete complaint.'
    });
  }

  onProofFile(e: any) {
    const file: File = e.target?.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      this.proofImage = result.split(',')[1] ?? '';
    };
    reader.readAsDataURL(file);
  }

  clearProofImage() {
    this.proofImage = null;
  }

  hasPhoto(c: Complaint): boolean {
    return !!(c.thumbnailBase64 || (c.mediaBase64List && c.mediaBase64List.length > 0));
  }
  photoSrc(c: Complaint, i = 0): string {
    const b64 = i === 0
      ? (c.mediaBase64List?.[0] ?? c.thumbnailBase64 ?? '')
      : (c.mediaBase64List?.[i] ?? '');
    if (!b64) return '';
    if (b64.startsWith('/9j/')) return 'data:image/jpeg;base64,' + b64;
    if (b64.startsWith('iVBOR')) return 'data:image/png;base64,' + b64;
    return 'data:image/jpeg;base64,' + b64;
  }
  proofPhoto(p: ComplaintProof): string { return 'data:image/jpeg;base64,' + (p.imageBase64 ?? ''); }

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

  fullDate(iso: string): string {
    if (!iso) return '';
    return new Date(iso).toLocaleString();
  }

  etaLabel(iso: string | null | undefined): string {
    if (!iso) return 'Pending assignment';
    return `ETA ${new Date(iso).toLocaleString([], {
      day: 'numeric',
      month: 'short',
      hour: 'numeric',
      minute: '2-digit'
    })}`;
  }

  private buildAssignPayload(): AssignComplaintRequest | null {
    if (!this.assignStaffId) {
      this.errorMsg = 'Pick a staff member first.';
      return null;
    }
    this.errorMsg = '';
    const payload: AssignComplaintRequest = {
      staffId: this.assignStaffId
    };
    if (this.assignEta) {
      payload.estimatedResolutionAt = this.assignEta.length === 16 ? `${this.assignEta}:00` : this.assignEta;
    }
    return payload;
  }

  private toDateTimeLocalValue(iso: string | null | undefined): string {
    if (!iso) return '';
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return '';
    const offsetMs = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16);
  }

  private async startProofCamera() {
    if (!navigator.mediaDevices?.getUserMedia) {
      this.proofCameraStarting = false;
      this.proofCameraError = 'Camera access is not supported on this device or browser.';
      return;
    }

    this.stopProofCamera();

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' }
        },
        audio: false
      });

      if (!this.showProofCameraModal) {
        stream.getTracks().forEach(track => track.stop());
        return;
      }

      this.proofCameraStream = stream;
      const video = this.proofCameraVideo?.nativeElement;
      if (video) {
        video.srcObject = stream;
        await video.play();
      }
      this.proofCameraStarting = false;
    } catch {
      this.proofCameraStarting = false;
      this.proofCameraError = 'Camera access was blocked. You can still upload a photo from your device.';
    }
  }

  private stopProofCamera() {
    this.proofCameraStream?.getTracks().forEach(track => track.stop());
    this.proofCameraStream = null;
    const video = this.proofCameraVideo?.nativeElement;
    if (video) {
      video.pause();
      video.srcObject = null;
    }
    this.proofCameraStarting = false;
  }

  statusClass(s: string): string { return `status-${s}`; }
}
