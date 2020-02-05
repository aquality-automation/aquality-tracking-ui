import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Router } from '@angular/router';
import { UserService } from '../../services/user.services';
import { GlobalDataService } from '../../services/globaldata.service';

@Injectable()
export class LoginGuard implements CanActivate {

  constructor(
    private router: Router,
    public userService: UserService
  ) { }

  async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {
    const isLogged = await this.userService.handleIsLogged(false);
    if (isLogged) {
      this.router.navigate(['/project']);
    }
    return !isLogged;
  }
}

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    public userService: UserService,
    protected globaldata: GlobalDataService,
  ) { }

  async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {
    const isLogged = await this.userService.handleIsLogged();
    if (!isLogged) {
      this.userService.redirectToLogin(state.url);
    }
    return isLogged;
  }
}
