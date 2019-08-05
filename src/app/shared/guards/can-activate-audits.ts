import { Injectable } from '@angular/core';
import { CanActivate, CanActivateChild, ActivatedRoute } from '@angular/router';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { LocalPermissions } from '../models/LocalPermissions';
import { UserService } from '../../services/user.services';
import { GlobalDataService } from '../../services/globaldata.service';
import { Route } from '@angular/compiler/src/core';
import { AuditService } from '../../services/audits.service';
import { Audit } from '../models/audit';

@Injectable()
export class AuditCreateGuard implements CanActivate {

  constructor(
    private router: Router,
    private userService: UserService,
    private auditService: AuditService
  ) { }

  async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    let islogged = false;
    await this.userService.handleIsLogged(state.url).then(res => islogged = res);
    if (!islogged) { return false; }

    if ((!this.userService.IsLogged() || !this.userService.IsAuditAdmin())) {
      this.router.navigate(['**']);
      return false;
    }

    return true;
  }
}

@Injectable()
export class AuditDashboardGuard implements CanActivate {

  constructor(
    private router: Router,
    public userService: UserService
  ) { }

  async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    let islogged = false;
    await this.userService.handleIsLogged(state.url).then(res => islogged = res);
    if (!islogged) { return false; }

    if (!this.userService.IsAuditor() && !this.userService.IsManager() && !this.userService.IsAuditAdmin()) {
      this.router.navigate(['**']);
      return false;
    }

    return true;
  }
}

@Injectable()
export class AuditProjectGuard implements CanActivate {

  constructor(
    private router: Router,
    public userService: UserService
  ) { }

  async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    let islogged = false;
    await this.userService.handleIsLogged(state.url).then(res => islogged = res);
    if (!islogged) { return false; }

    if (isNaN(+route.params['projectId'])) {
      this.router.navigate(['**']);
      return false;
    }

    let hasLocalPermissions: boolean;

    await this.userService.HaveAnyLocalPermissions(+route.params['projectId']).then(res => {
      hasLocalPermissions = res;
    });

    if (!this.userService.IsAuditor() && !this.userService.IsManager() && !hasLocalPermissions && !this.userService.IsAuditAdmin()) {
      this.router.navigate(['**']);
      return false;
    }

    return true;
  }

}
