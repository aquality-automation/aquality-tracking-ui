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

  async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    let isLogged;
    await this.userService.IsLogged().then(result => {
      if (result) {
        this.router.navigate(['/project']);
        isLogged = false;
      }
      isLogged = true;
    });
    return isLogged;
  }
}
