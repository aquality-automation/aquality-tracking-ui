import { Injectable } from '@angular/core';
import { CanActivate } from '@angular/router';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { UserService } from '../../services/user.services';

@Injectable()
export class AuthGuard implements CanActivate {

  constructor(
    public userService: UserService,
  ) { }

  async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {
    let islogged = false;
    await this.userService.handleIsLogged(state.url).then(res => islogged = res);
    return islogged;
  }
}

@Injectable()
export class ProjectGuard implements CanActivate {
  constructor(
    private router: Router,
    public userService: UserService
  ) {
  }

  async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    let islogged = false;
    await this.userService.handleIsLogged(state.url).then(res => islogged = res);
    if (!islogged) { return false; }

    const manager = this.userService.IsManager() || this.userService.IsAuditor() || this.userService.IsAuditAdmin();
    const local = await this.userService.HaveAnyLocalPermissions(+state.url.split('/')[2]);
    if (manager || local) {
      return true;
    }
    this.router.navigate(['**']);
    return false;
  }
}

@Injectable()
export class CreateProjectGuard implements CanActivate {

  constructor(
    private router: Router,
    public userService: UserService
  ) { }

  async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    let islogged = false;
    await this.userService.handleIsLogged(state.url).then(res => islogged = res);
    if (!islogged) { return false; }

    if (this.userService.IsManager()
      || this.userService.IsAdmin()) {
      return true;
    }
    this.router.navigate(['**']);
    return false;

  }
}

@Injectable()
export class TestRunGuard implements CanActivate {

  constructor(
    private router: Router,
    public userService: UserService
  ) { }

  async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    let islogged = false;
    await this.userService.handleIsLogged(state.url).then(res => islogged = res);
    if (!islogged) { return false; }

    if (this.userService.IsManager() || this.userService.IsAuditAdmin() || this.userService.IsAuditor()
      || this.userService.HaveAnyLocalPermissions(+state.url.split('/')[2])) {
      return true;
    }
    this.router.navigate(['**']);
    return false;
  }
}

@Injectable()
export class CreateTestRunGuard implements CanActivate {

  constructor(
    private router: Router,
    public userService: UserService
  ) { }

  async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    let islogged = false;
    await this.userService.handleIsLogged(state.url).then(res => islogged = res);
    if (!islogged) { return false; }

    let hasLocalPerm: boolean;
    await this.userService.HaveAnyLocalPermissionsExceptViewer(+state.url.split('/')[2]).then(res => {
      hasLocalPerm = res;
    });
    if (this.userService.IsManager() || hasLocalPerm) {
      return true;
    }
    this.router.navigate(['**']);
    return false;
  }
}

@Injectable()
export class CreateMilestoneGuard implements CanActivate {

  constructor(
    private router: Router,
    public userService: UserService
  ) { }

  async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    let islogged = false;
    await this.userService.handleIsLogged(state.url).then(res => islogged = res);
    if (!islogged) { return false; }

    let hasLocalPerm: boolean;
    await this.userService.HaveAnyLocalPermissionsExceptViewer(+state.url.split('/')[2]).then(res => {
      hasLocalPerm = res;
    });
    if (this.userService.IsManager() || hasLocalPerm) {
      return true;
    }
    this.router.navigate(['**']);
    return false;
  }
}

@Injectable()
export class TestSuiteGuard implements CanActivate {

  constructor(
    private router: Router,
    public userService: UserService
  ) { }

  async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    let islogged = false;
    await this.userService.handleIsLogged(state.url).then(res => islogged = res);
    if (!islogged) { return false; }

    if (this.userService.IsManager() || this.userService.IsAuditAdmin() || this.userService.IsAuditor()
      || this.userService.HaveAnyLocalPermissions(+state.url.split('/')[2])) {
      return true;
    }
    this.router.navigate(['**']);
    return false;
  }
}

@Injectable()
export class CreateTestSuiteGuard implements CanActivate {

  constructor(
    private router: Router,
    public userService: UserService
  ) { }

  async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    let islogged = false;
    await this.userService.handleIsLogged(state.url).then(res => islogged = res);
    if (!islogged) { return false; }

    let hasLocalPerm: boolean;
    await this.userService.HaveAnyLocalPermissionsExceptViewer(+state.url.split('/')[2]).then(res => {
      hasLocalPerm = res;
    });
    if (this.userService.IsManager() || hasLocalPerm) {
      return true;
    }
    this.router.navigate(['**']);
    return false;
  }
}

@Injectable()
export class CreateTestGuard implements CanActivate {

  constructor(
    private router: Router,
    public userService: UserService
  ) { }

  async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    let islogged = false;
    await this.userService.handleIsLogged(state.url).then(res => islogged = res);
    if (!islogged) { return false; }

    let hasLocalPerm: boolean;
    await this.userService.HaveAnyLocalPermissionsExceptViewer(+state.url.split('/')[2]).then(res => {
      hasLocalPerm = res;
    });
    if (this.userService.IsManager() || hasLocalPerm) {
      return true;
    }
    this.router.navigate(['**']);
    return false;
  }
}

@Injectable()
export class TestGuard implements CanActivate {

  constructor(
    private router: Router,
    public userService: UserService
  ) { }

  async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    let islogged = false;
    await this.userService.handleIsLogged(state.url).then(res => islogged = res);
    if (!islogged) { return false; }

    if (this.userService.IsManager() || this.userService.IsAuditAdmin() || this.userService.IsAuditor()
      || this.userService.HaveAnyLocalPermissions(+state.url.split('/')[2])) {
      return true;
    }
    this.router.navigate(['**']);
    return false;
  }
}

@Injectable()
export class TestResultGuard implements CanActivate {

  constructor(
    private router: Router,
    public userService: UserService
  ) { }

  async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    let islogged = false;
    await this.userService.handleIsLogged(state.url).then(res => islogged = res);
    if (!islogged) { return false; }

    if (this.userService.IsManager() || this.userService.IsAuditAdmin() || this.userService.IsAuditor()
      || this.userService.HaveAnyLocalPermissions(+state.url.split('/')[2])) {
      return true;
    }
    this.router.navigate(['**']);
    return false;
  }
}

@Injectable()
export class AdministrationGlobalGuard implements CanActivate {

  constructor(
    private router: Router,
    public userService: UserService
  ) { }

  async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    let islogged = false;
    await this.userService.handleIsLogged(state.url).then(res => islogged = res);
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
    await this.userService.handleIsLogged(state.url).then(res => islogged = res);
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
    await this.userService.handleIsLogged(state.url).then(res => islogged = res);
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

@Injectable()
export class ProjectImportGuard implements CanActivate {
  constructor(
    private router: Router,
    public userService: UserService
  ) { }

  async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    let islogged = false;
    await this.userService.handleIsLogged(state.url).then(res => islogged = res);
    if (!islogged) { return false; }

    let hasLocalPerm: boolean;
    await this.userService.HaveAnyLocalPermissionsExceptViewer(+state.url.split('/')[2]).then(res => {
      hasLocalPerm = res;
    });
    if (this.userService.IsManager() || hasLocalPerm) {
      return true;
    }
    this.router.navigate(['**']);
    return false;
  }
}


