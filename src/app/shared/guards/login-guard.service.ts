import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth/auth.service';

@Injectable()
export class LoginGuard implements CanActivate {

  constructor(
    private router: Router,
    private auth: AuthService
  ) { }

  async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {
    const isLogged = await this.auth.handleIsLogged();
    if (isLogged) {
      this.router.navigate(['/project']);
    }
    return !isLogged;
  }
}

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private auth: AuthService
  ) { }

  async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {
    const isLogged = await this.auth.handleIsLogged();
    if (!isLogged) {
      this.auth.redirectToLogin(state.url);
    }
    return isLogged;
  }
}
