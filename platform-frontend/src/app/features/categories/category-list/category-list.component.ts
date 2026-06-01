import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { Category, User } from '../../../shared/models/models';

@Component({
  selector: 'app-category-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './category-list.component.html',
  styleUrls: ['./category-list.component.scss']
})
export class CategoryListComponent implements OnInit {
  categories: Category[] = [];
  staff: User[] = [];
  staffByCategory: Record<number, User[]> = {}; // categoryId -> assigned staff list
  loading = true;

  showCreate = false;
  editingId: number | null = null;
  form: FormGroup;
  errorMsg = '';
  submitting = false;

  showAssign = false;
  assignCategory: Category | null = null;
  assignStaffId: number | null = null;

  constructor(private api: ApiService, private fb: FormBuilder) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      iconName: ['']
    });
  }

  ngOnInit() {
    this.load();
    this.api.getAllUsers('STAFF').subscribe(s => this.staff = s ?? []);
  }

  /** Returns staff assigned specifically to this category */
  getStaffForCategory(catId: number): User[] {
    return this.staffByCategory[catId] ?? [];
  }

  private loadStaffForCategory(catId: number) {
    this.api.getStaffForCategory(catId).subscribe({
      next: staff => {
        this.staffByCategory = { ...this.staffByCategory, [catId]: staff ?? [] };
      }
    });
  }

  private load() {
    this.loading = true;
    this.api.getCategories().subscribe({
      next: cats => {
        this.categories = cats ?? [];
        this.loading = false;
        // Load staff for each category so assign modal shows correct staff
        this.categories.forEach(c => this.loadStaffForCategory(c.id));
      },
      error: () => { this.loading = false; }
    });
  }

  openCreate() {
    this.editingId = null;
    this.form.reset({ name: '', description: '', iconName: '' });
    this.errorMsg = '';
    this.showCreate = true;
  }

  openEdit(c: Category) {
    this.editingId = c.id;
    this.form.reset({ name: c.name, description: c.description, iconName: c.iconName });
    this.errorMsg = '';
    this.showCreate = true;
  }

  saveCategory() {
    if (this.form.invalid) return;
    this.submitting = true;
    this.errorMsg = '';
    const obs = this.editingId
      ? this.api.updateCategory(this.editingId, this.form.value)
      : this.api.createCategory(this.form.value);
    obs.subscribe({
      next: () => { this.submitting = false; this.showCreate = false; this.load(); },
      error: e => {
        this.submitting = false;
        this.errorMsg = e.error?.message || 'Failed to save.';
      }
    });
  }

  doDelete(c: Category) {
    if (!confirm(`Delete category "${c.name}"? Existing complaints will keep their category name.`)) return;
    this.api.deleteCategory(c.id).subscribe({
      next: () => this.load(),
      error: e => alert(e.error?.message || 'Failed to delete.')
    });
  }

  openAssign(c: Category) {
    this.assignCategory = c;
    this.assignStaffId = null;
    this.errorMsg = '';
    this.showAssign = true;
  }

  /** Returns staff NOT already assigned to this category — for the assign dropdown */
  getUnassignedStaff(cat: Category | null): User[] {
    if (!cat) return this.staff;
    const assigned = new Set((this.staffByCategory[cat.id] ?? []).map(s => s.id));
    return this.staff.filter(s => !assigned.has(s.id));
  }

  removeStaff(cat: Category, staffMember: User) {
    if (!confirm(`Remove ${staffMember.firstName || staffMember.username} from "${cat.name}"?`)) return;
    this.api.removeStaffFromCategory(cat.id, staffMember.id).subscribe({
      next: () => this.loadStaffForCategory(cat.id),
      error: e => alert(e.error?.message || 'Failed to remove staff.')
    });
  }

  doAssign() {
    if (!this.assignCategory || !this.assignStaffId) return;
    const catId = this.assignCategory.id;
    this.api.assignStaffToCategory(catId, this.assignStaffId).subscribe({
      next: () => {
        this.showAssign = false;
        this.loadStaffForCategory(catId); // refresh only this category's staff list
      },
      error: e => this.errorMsg = e.error?.message || 'Failed to assign.'
    });
  }
}
