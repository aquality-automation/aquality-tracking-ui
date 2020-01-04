import { Injectable } from '@angular/core';
import { CanActivate } from '@angular/router';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { UserService } from '../../services/user.services';
import { CurrentPermissionsService, Permissions } from '../../services/current-permissions.service';


@Injectable()
export class AdministrationGlobalGuard implements CanActivate {

  constructor(
    private router: Router,
    private userService: UserService,
    private permissionsService: CurrentPermissionsService
  ) { }

  async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    if (await this.userService.handleIsLogged()) {
      if (this.permissionsService.IsAdmin()) {
        return true;
      }
    }
    this.router.navigate(['/administration/project/permissions']);
    return false;
  }
}

@Injectable()
export class AdministrationProjectManagerGuard implements CanActivate {
  constructor(
    private router: Router,
    public userService: UserService,
    private permissionsService: CurrentPermissionsService
  ) { }

  async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    if (await this.userService.handleIsLogged()) {
      const local = await this.permissionsService.hasLocalPermissions([Permissions.admin, Permissions.manager]);
      const global = this.permissionsService.IsManager() || this.permissionsService.IsAdmin();
      if (local || global) {
        return true;
      }
    }
    this.router.navigate(['/administration/project/predefined-resolutions']);
    return false;
  }
}

@Injectable()
export class AdministrationProjectGuard implements CanActivate {
  constructor(
    private router: Router,
    public userService: UserService,
    private permissionsService: CurrentPermissionsService
  ) { }

  async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    if (await this.userService.handleIsLogged()) {
      const local = await this.permissionsService.isLocalEngineer();
      const global = this.permissionsService.IsManager();
      if (local || global) {
        return true;
      }
    }
    this.router.navigate(['**']);
    return false;
  }
}

@Injectable()
export class AdministrationGuard implements CanActivate {
  constructor(
    private router: Router,
    public userService: UserService,
    private permissionsService: CurrentPermissionsService
  ) { }

  async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    if (await this.userService.handleIsLogged()) {
      const local = await this.permissionsService.isLocalEngineer();
      const global = this.permissionsService.IsManager() || this.userService.IsAdmin();
      if (local || global) {
        return true;
      }
    }
    this.router.navigate(['**']);
    return false;
  }
}
