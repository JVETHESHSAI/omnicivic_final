import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { User, CreateUserResponse, Role } from '../../../shared/models/models';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss']
})
export class UserListComponent implements OnInit {
  users: User[] = [];
  loading = true;
  activeTab: 'ALL' | 'RESIDENT' | 'STAFF' | 'CO_ADMIN' = 'ALL';

  showCreate = false;
  createRole: 'RESIDENT' | 'STAFF' | 'CO_ADMIN' = 'RESIDENT';
  createForm: FormGroup;
  creating = false;
  createdResult: CreateUserResponse | null = null;
  errorMsg = '';

  constructor(private api: ApiService, private fb: FormBuilder) {
    this.createForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['']
    });
  }

  ngOnInit() { this.load(); }

  private load() {
    this.loading = true;
    this.api.getAllUsers().subscribe({
      next: u => { this.users = u ?? []; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  get visibleUsers(): User[] {
    if (this.activeTab === 'ALL') return this.users;
    return this.users.filter(u => u.role === this.activeTab);
  }

  get counts() {
    return {
      ALL: this.users.length,
      RESIDENT: this.users.filter(u => u.role === 'RESIDENT').length,
      STAFF: this.users.filter(u => u.role === 'STAFF').length,
      CO_ADMIN: this.users.filter(u => u.role === 'CO_ADMIN').length,
    };
  }

  openCreate(role: typeof this.createRole) {
    this.createRole = role;
    this.createForm.reset();
    this.createdResult = null;
    this.errorMsg = '';
    this.showCreate = true;
  }

  doCreate() {
    if (this.createForm.invalid) return;
    this.creating = true;
    this.errorMsg = '';
    const payload = this.createForm.value;
    const obs = this.createRole === 'RESIDENT' ? this.api.createResident(payload) :
                this.createRole === 'STAFF' ? this.api.createStaff(payload) :
                this.api.createCoAdmin(payload);
    obs.subscribe({
      next: result => {
        this.creating = false;
        this.createdResult = result;
        this.load();
      },
      error: e => {
        this.creating = false;
        this.errorMsg = e.error?.message || 'Could not create user.';
      }
    });
  }

  closeCreate() {
    this.showCreate = false;
    this.createdResult = null;
    this.createForm.reset();
  }

  deactivate(u: User) {
    if (!confirm(`Deactivate ${u.username}? They will be unable to sign in.`)) return;
    this.api.deactivateUser(u.id).subscribe({
      next: () => this.load(),
      error: e => alert(e.error?.message || 'Failed to deactivate.')
    });
  }

  copyToClipboard(text: string) { navigator.clipboard.writeText(text); }

  formatRole(r: Role): string {
    if (r === 'CO_ADMIN') return 'Co-Admin';
    return r.charAt(0) + r.slice(1).toLowerCase();
  }
}
