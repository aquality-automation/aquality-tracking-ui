import { Injectable } from '@angular/core';
import { CanActivate } from '@angular/router';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { UserService } from '../../services/user.services';
import { GlobalDataService } from '../../services/globaldata.service';

@Injectable()
export class CustomerDashboardGuard implements CanActivate {

  constructor(
    private router: Router,
    private userService: UserService,
    private globalDataService: GlobalDataService
  ) { }

  async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    let islogged = false;
    await this.userService.handleIsLogged(state.url).then(res => islogged = res);
    if (!islogged) { return false; }

    if (!this.userService.IsHead()
      && !this.userService.IsUnitCoordinator()
      && !this.userService.IsAccountManager()
      && !this.globalDataService.teamMember) {
      this.router.navigate(['**']);
      return false;
    }

    return true;
  }
}

@Injectable()
export class CustomerCreateGuard implements CanActivate {

  constructor(
    private router: Router,
    private userService: UserService
  ) { }

  async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    let islogged = false;
    await this.userService.handleIsLogged(state.url).then(res => islogged = res);
    if (!islogged) { return false; }

    if (!this.userService.IsHead() && !this.userService.IsUnitCoordinator()) {
      this.router.navigate(['**']);
      return false;
    }

    return true;
  }
}
