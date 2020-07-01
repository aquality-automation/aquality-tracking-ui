import { Injectable } from '@angular/core';
import { CanActivate } from '@angular/router';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { GuardService } from 'src/app/services/guard.service';
import { EGlobalPermissions, ELocalPermissions } from 'src/app/services/permissions/current-permissions.service';


@Injectable()
export class AdministrationGlobalGuard implements CanActivate {

  constructor(
    private guardService: GuardService
  ) { }

  async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    return this.guardService.redirect({
      global: [EGlobalPermissions.admin]
    }, ['/administration/project/permissions']);
  }
}

@Injectable()
export class AdministrationProjectManagerGuard implements CanActivate {
  constructor(
    private guardService: GuardService
  ) { }

  async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    return this.guardService.redirect({
      global: [EGlobalPermissions.admin, EGlobalPermissions.manager],
      local: [ELocalPermissions.admin, ELocalPermissions.manager]
    }, ['**']);
  }
}

@Injectable()
export class AdministrationProjectGuard implements CanActivate {
  constructor(
    private guardService: GuardService
  ) { }

  async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    return this.guardService.redirect({
      global: [EGlobalPermissions.admin, EGlobalPermissions.manager],
      local: [ELocalPermissions.admin, ELocalPermissions.manager, ELocalPermissions.engineer]
    }, ['**']);
  }
}

@Injectable()
export class AdministrationGuard implements CanActivate {
  constructor(
    private guardService: GuardService
  ) { }

  async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    return this.guardService.redirect({
      global: [EGlobalPermissions.manager, EGlobalPermissions.admin],
      local: [ELocalPermissions.admin, ELocalPermissions.manager, ELocalPermissions.engineer]
    }, ['**']);
  }
}
