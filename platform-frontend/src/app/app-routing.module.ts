import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';

const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  {
    path: 'setup',
    loadComponent: () =>
      import('./features/super-admin/setup/setup.component').then(m => m.SetupComponent)
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'reset-password',
    loadComponent: () =>
      import('./features/auth/reset-password/reset-password.component').then(m => m.ResetPasswordComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'super-admin',
    loadComponent: () =>
      import('./features/super-admin/dashboard/super-admin-dashboard.component').then(m => m.SuperAdminDashboardComponent),
    canActivate: [AuthGuard],
    data: { roles: ['SUPER_ADMIN'] }
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'complaints',
    loadComponent: () =>
      import('./features/complaints/complaint-list/complaint-list.component').then(m => m.ComplaintListComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'complaints/new',
    loadComponent: () =>
      import('./features/complaints/submit-complaint/submit-complaint.component').then(m => m.SubmitComplaintComponent),
    canActivate: [AuthGuard],
    data: { roles: ['RESIDENT'] }
  },
  {
    path: 'map',
    loadComponent: () =>
      import('./features/map/map.component').then(m => m.MapComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'users',
    loadComponent: () =>
      import('./features/users/user-list/user-list.component').then(m => m.UserListComponent),
    canActivate: [AuthGuard],
    data: { roles: ['ADMIN', 'CO_ADMIN'] }
  },
  {
    path: 'categories',
    loadComponent: () =>
      import('./features/categories/category-list/category-list.component').then(m => m.CategoryListComponent),
    canActivate: [AuthGuard],
    data: { roles: ['ADMIN', 'CO_ADMIN'] }
  },
  {
    path: 'profile',
    loadComponent: () =>
      import('./features/profile/profile.component').then(m => m.ProfileComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'notifications',
    loadComponent: () =>
      import('./features/notifications/notification-list/notification-list.component').then(m => m.NotificationListComponent),
    canActivate: [AuthGuard]
  },
  { path: '**', redirectTo: 'login' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
