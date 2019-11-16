import { Injectable } from '@angular/core';
import { CanActivate } from '@angular/router';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { UserService } from '../../services/user.services';


@Injectable()
export class AdministrationGlobalGuard implements CanActivate {

  constructor(
    private router: Router,
    public userService: UserService
  ) { }

  async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    let islogged = false;
    await this.userService.handleIsLogged().then(res => islogged = res);
    if (!islogged) { return false; }

    if (this.userService.IsAdmin()) {
      return true;
    }
    this.router.navigate(['/administration/project/permissions']);
    return false;
  }
}

@Injectable()
export class AdministrationProjectGuard implements CanActivate {
  constructor(
    private router: Router,
    public userService: UserService
  ) { }

  async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    let islogged = false;
    await this.userService.handleIsLogged().then(res => islogged = res);
    if (!islogged) { return false; }

    await this.userService.AnyLocalPermissions();
    if (this.userService.IsManager()
      || this.userService.IsAdmin()
      || this.userService.AnyLocalAdmin()
      || this.userService.AnyLocalManager()) {
      return true;
    }
    this.router.navigate(['**']);
    return false;
  }
}

@Injectable()
export class AdministrationGuard implements CanActivate {
  constructor(
    private router: Router,
    public userService: UserService
  ) { }

  async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    let islogged = false;
    await this.userService.handleIsLogged().then(res => islogged = res);
    if (!islogged) { return false; }

    await this.userService.AnyLocalPermissions();
    if (this.userService.IsAdmin()
      || this.userService.IsManager()
      || this.userService.AnyLocalAdmin()
      || this.userService.AnyLocalManager()) {
      return true;
    }
    this.router.navigate(['**']);
    return false;
  }
}