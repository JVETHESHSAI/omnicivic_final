import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const AuthGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isLoggedIn()) {
    router.navigate(['/login']);
    return false;
  }

  const user = authService.getCurrentUser();
  if (user?.isFirstLogin && !route.routeConfig?.path?.includes('reset-password')) {
    router.navigate(['/reset-password']);
    return false;
  }

  const roles: string[] = route.data['roles'] ?? [];
  if (roles.length && !authService.hasRole(...roles)) {
    router.navigate(['/dashboard']);
    return false;
  }

  return true;
};
