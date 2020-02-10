import { Injectable } from '@angular/core';
import { CanActivate } from '@angular/router';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { GuardService } from './guard.service';
import { EGlobalPermissions } from '../../services/current-permissions.service';


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
export class CustomerDashboardGuard implements CanActivate {

  constructor(
    private guardService: GuardService
  ) { }

  async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    return this.guardService.redirect({
      global: [EGlobalPermissions.head, EGlobalPermissions.unit_coordinator, EGlobalPermissions.account_manager]
    }, ['**']);
  }
}

@Injectable()
export class CustomerCreateGuard implements CanActivate {

  constructor(
    private guardService: GuardService
  ) { }

  async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    return this.guardService.redirect({
      global: [EGlobalPermissions.head, EGlobalPermissions.unit_coordinator]
    }, ['**']);
  }
}
