import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  AssignComplaintRequest, Category, CommunityBranding, Complaint, CreateComplaintRequest,
  CreateUserResponse, MapPin, Notification, ReviewProofRequest,
  SubmitProofRequest, UpdateProfileRequest, User
} from '../../shared/models/models';

const BASE = '/api';

@Injectable({ providedIn: 'root' })
export class ApiService {
  constructor(private http: HttpClient) {}

  // ── Community ──────────────────────────────────────────────────────────────
  getCommunityProfile(): Observable<CommunityBranding> {
    return this.http.get<CommunityBranding>(`${BASE}/community/profile`);
  }
  getPublicBranding(prefix: string): Observable<CommunityBranding> {
    return this.http.get<CommunityBranding>(`${BASE}/community/public/${prefix}`);
  }
  updateBranding(data: Partial<CommunityBranding>): Observable<CommunityBranding> {
    return this.http.put<CommunityBranding>(`${BASE}/community/branding`, data);
  }
  updateMap(data: Partial<CommunityBranding>): Observable<CommunityBranding> {
    return this.http.put<CommunityBranding>(`${BASE}/community/map`, data);
  }

  // ── Users ──────────────────────────────────────────────────────────────────
  getAllUsers(role?: string): Observable<User[]> {
    let params = new HttpParams();
    if (role) params = params.set('role', role);
    return this.http.get<User[]>(`${BASE}/users`, { params });
  }
  getCurrentUser(): Observable<User> {
    return this.http.get<User>(`${BASE}/users/me`);
  }
  updateProfile(data: UpdateProfileRequest): Observable<User> {
    return this.http.put<User>(`${BASE}/users/me`, data);
  }
  createResident(data: any): Observable<CreateUserResponse> {
    return this.http.post<CreateUserResponse>(`${BASE}/users/residents`, data);
  }
  createStaff(data: any): Observable<CreateUserResponse> {
    return this.http.post<CreateUserResponse>(`${BASE}/users/staff`, data);
  }
  createCoAdmin(data: any): Observable<CreateUserResponse> {
    return this.http.post<CreateUserResponse>(`${BASE}/users/admins`, data);
  }
  deactivateUser(id: number): Observable<User> {
    return this.http.put<User>(`${BASE}/users/${id}/deactivate`, {});
  }

  // ── Categories ─────────────────────────────────────────────────────────────
  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${BASE}/categories`);
  }
  createCategory(data: any): Observable<Category> {
    return this.http.post<Category>(`${BASE}/categories`, data);
  }
  updateCategory(id: number, data: any): Observable<Category> {
    return this.http.put<Category>(`${BASE}/categories/${id}`, data);
  }
  deleteCategory(id: number): Observable<void> {
    return this.http.delete<void>(`${BASE}/categories/${id}`);
  }
  assignStaffToCategory(catId: number, staffId: number): Observable<any> {
    return this.http.post(`${BASE}/categories/${catId}/staff/${staffId}`, {});
  }
  getStaffForCategory(catId: number): Observable<User[]> {
    return this.http.get<User[]>(`${BASE}/categories/${catId}/staff`);
  }
  removeStaffFromCategory(catId: number, staffId: number): Observable<any> {
    return this.http.delete(`${BASE}/categories/${catId}/staff/${staffId}`);
  }

  // ── Complaints ─────────────────────────────────────────────────────────────
  getAllComplaints(): Observable<Complaint[]> {
    return this.http.get<Complaint[]>(`${BASE}/complaints`);
  }
  getMyComplaints(): Observable<Complaint[]> {
    return this.http.get<Complaint[]>(`${BASE}/complaints/my`);
  }
  /** Community feed — all complaints for resident home feed */
  getCommunityFeed(): Observable<Complaint[]> {
    return this.http.get<Complaint[]>(`${BASE}/complaints/community-feed`);
  }
  getAssignedComplaints(): Observable<Complaint[]> {
    return this.http.get<Complaint[]>(`${BASE}/complaints/assigned`);
  }
  /** All complaints this staff ever worked on — for dashboard stats */
  getMyWorkHistory(): Observable<Complaint[]> {
    return this.http.get<Complaint[]>(`${BASE}/complaints/my-work-history`);
  }
  getComplaintById(id: number): Observable<Complaint> {
    return this.http.get<Complaint>(`${BASE}/complaints/${id}`);
  }
  submitComplaint(data: CreateComplaintRequest): Observable<any> {
    return this.http.post<any>(`${BASE}/complaints`, data);
  }
  deleteComplaint(id: number): Observable<void> {
    return this.http.delete<void>(`${BASE}/complaints/${id}`);
  }
  assignComplaint(id: number, data: AssignComplaintRequest): Observable<Complaint> {
    return this.http.put<Complaint>(`${BASE}/complaints/${id}/assign`, data);
  }
  reassignComplaint(id: number, data: AssignComplaintRequest): Observable<Complaint> {
    return this.http.put<Complaint>(`${BASE}/complaints/${id}/reassign`, data);
  }

  /** Staff: ASSIGNED → IN_PROGRESS */
  startWork(id: number): Observable<Complaint> {
    return this.http.put<Complaint>(`${BASE}/complaints/${id}/start`, {});
  }

  /** Staff: IN_PROGRESS → PROOF_SUBMITTED */
  submitProof(id: number, data: SubmitProofRequest): Observable<Complaint> {
    return this.http.post<Complaint>(`${BASE}/complaints/${id}/proof`, data);
  }

  /** Admin: PROOF_SUBMITTED → RESOLVED or back to ASSIGNED */
  reviewProof(id: number, data: ReviewProofRequest): Observable<Complaint> {
    return this.http.post<Complaint>(`${BASE}/complaints/${id}/proof/review`, data);
  }

  /** Admin: RESOLVED → CLOSED */
  closeComplaint(id: number, note: string): Observable<Complaint> {
    return this.http.put<Complaint>(
      `${BASE}/complaints/${id}/close?resolutionNote=${encodeURIComponent(note)}`, {});
  }

  upvote(id: number): Observable<Complaint> {
    return this.http.post<Complaint>(`${BASE}/complaints/${id}/upvote`, {});
  }
  getMapPins(): Observable<MapPin[]> {
    return this.http.get<MapPin[]>(`${BASE}/complaints/map/pins`);
  }

  // ── Notifications ──────────────────────────────────────────────────────────
  getNotifications(): Observable<Notification[]> {
    return this.http.get<Notification[]>(`${BASE}/notifications`);
  }
  getUnreadCount(): Observable<{ count: number }> {
    return this.http.get<{ count: number }>(`${BASE}/notifications/unread-count`);
  }
  markNotificationRead(id: number): Observable<Notification> {
    return this.http.put<Notification>(`${BASE}/notifications/${id}/read`, {});
  }
  markAllNotificationsRead(): Observable<void> {
    return this.http.put<void>(`${BASE}/notifications/read-all`, {});
  }
}
