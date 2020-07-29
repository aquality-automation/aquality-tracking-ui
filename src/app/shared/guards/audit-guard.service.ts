import { Injectable } from '@angular/core';
import { CanActivate } from '@angular/router';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { GuardService } from 'src/app/services/guard.service';
import { EGlobalPermissions, ELocalPermissions } from 'src/app/services/permissions/current-permissions.service';

@Injectable()
export class AuditCreateGuard implements CanActivate {

  constructor(
    private guardService: GuardService
  ) { }

  async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    return this.guardService.redirect({
      global: [EGlobalPermissions.audit_admin]
    }, ['**']);
  }
}

@Injectable()
export class AuditDashboardGuard implements CanActivate {

  constructor(
    private guardService: GuardService
  ) { }

  async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    return this.guardService.redirect({
      global: [EGlobalPermissions.audit_admin, EGlobalPermissions.manager, EGlobalPermissions.auditor]
    }, ['**']);
  }
}

@Injectable()
export class AuditProjectGuard implements CanActivate {

  constructor(
    private router: Router,
    private guardService: GuardService
  ) { }

  async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    if (isNaN(+route.params['projectId'])) {
      this.router.navigate(['**']);
      return false;
    }

    return this.guardService.redirect({
      global: [EGlobalPermissions.manager, EGlobalPermissions.auditor, EGlobalPermissions.audit_admin],
      local: [ELocalPermissions.admin, ELocalPermissions.manager, ELocalPermissions.engineer, ELocalPermissions.viewer]
    }, ['**']);
  }
}
