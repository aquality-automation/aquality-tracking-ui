import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Router } from '@angular/router';
import { UserService } from '../../../services/user.services';

@Injectable()
export class LoginGuard implements CanActivate {

  constructor(
    private router: Router,
    public userService: UserService
  ) { }

  async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {
    const isLogged = await this.userService.handleIsLogged();
    if (isLogged) {
      this.router.navigate(['/project']);
    }
    return !isLogged;
  }
}
