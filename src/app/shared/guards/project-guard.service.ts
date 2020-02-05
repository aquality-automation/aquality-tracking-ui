import { Injectable } from '@angular/core';
import { CanActivate } from '@angular/router';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { GuardService } from './guard.service';
import { EGlobalPermissions, ELocalPermissions } from '../../services/current-permissions.service';



@Injectable()
export class ProjectGuard implements CanActivate {
  constructor(
    private guardService: GuardService
  ) { }

  async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    return this.guardService.redirectProject(state, {
      global: [EGlobalPermissions.manager, EGlobalPermissions.audit_admin, EGlobalPermissions.auditor],
      local: [ELocalPermissions.admin, ELocalPermissions.manager, ELocalPermissions.engineer, ELocalPermissions.viewer]
    }, ['**']);
  }
}

@Injectable()
export class CreateProjectGuard implements CanActivate {

  constructor(
    private guardService: GuardService
  ) { }

  async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    return this.guardService.redirect({
      global: [EGlobalPermissions.manager, EGlobalPermissions.admin]
    }, ['**']);
  }
}

@Injectable()
export class TestRunGuard implements CanActivate {

  constructor(
    private guardService: GuardService
  ) { }

  async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    return this.guardService.redirectProject(state, {
      global: [EGlobalPermissions.manager, EGlobalPermissions.audit_admin, EGlobalPermissions.auditor],
      local: [ELocalPermissions.admin, ELocalPermissions.manager, ELocalPermissions.engineer, ELocalPermissions.viewer]
    }, ['**']);
  }
}

@Injectable()
export class CreateTestRunGuard implements CanActivate {

  constructor(
    private guardService: GuardService
  ) { }

  async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    return this.guardService.redirectProject(state, {
      global: [EGlobalPermissions.manager],
      local: [ELocalPermissions.admin, ELocalPermissions.manager, ELocalPermissions.engineer]
    }, ['**']);
  }
}

@Injectable()
export class CreateMilestoneGuard implements CanActivate {

  constructor(
    private guardService: GuardService
  ) { }

  async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    return this.guardService.redirectProject(state, {
      global: [EGlobalPermissions.manager],
      local: [ELocalPermissions.admin, ELocalPermissions.manager, ELocalPermissions.engineer]
    }, ['**']);
  }
}

@Injectable()
export class TestSuiteGuard implements CanActivate {

  constructor(
    private guardService: GuardService
  ) { }

  async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    return this.guardService.redirectProject(state, {
      global: [EGlobalPermissions.manager, EGlobalPermissions.audit_admin, EGlobalPermissions.auditor],
      local: [ELocalPermissions.admin, ELocalPermissions.manager, ELocalPermissions.engineer, ELocalPermissions.viewer]
    }, ['**']);
  }
}

@Injectable()
export class MilestoneGuard implements CanActivate {
  constructor(
    private guardService: GuardService
  ) { }

  async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    return this.guardService.redirectProject(state, {
      global: [EGlobalPermissions.manager, EGlobalPermissions.audit_admin, EGlobalPermissions.auditor],
      local: [ELocalPermissions.admin, ELocalPermissions.manager, ELocalPermissions.engineer, ELocalPermissions.viewer]
    }, ['**']);
  }
}

@Injectable()
export class CreateTestSuiteGuard implements CanActivate {

  constructor(
    private guardService: GuardService,
  ) { }

  async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    return this.guardService.redirectProject(state, {
      global: [EGlobalPermissions.manager],
      local: [ELocalPermissions.admin, ELocalPermissions.manager, ELocalPermissions.engineer]
    }, ['**']);
  }
}

@Injectable()
export class CreateTestGuard implements CanActivate {

  constructor(
    private guardService: GuardService
  ) { }

  async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    return this.guardService.redirectProject(state, {
      global: [EGlobalPermissions.manager],
      local: [ELocalPermissions.admin, ELocalPermissions.manager, ELocalPermissions.engineer]
    }, ['**']);
  }
}

@Injectable()
export class TestGuard implements CanActivate {

  constructor(
    private guardService: GuardService
  ) { }

  async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    return this.guardService.redirectProject(state, {
      global: [EGlobalPermissions.manager, EGlobalPermissions.audit_admin, EGlobalPermissions.auditor],
      local: [ELocalPermissions.admin, ELocalPermissions.manager, ELocalPermissions.engineer, ELocalPermissions.viewer]
    }, ['**']);
  }
}

@Injectable()
export class TestResultGuard implements CanActivate {

  constructor(
    private guardService: GuardService
  ) { }

  async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    return this.guardService.redirectProject(state, {
      global: [EGlobalPermissions.manager, EGlobalPermissions.audit_admin, EGlobalPermissions.auditor],
      local: [ELocalPermissions.admin, ELocalPermissions.manager, ELocalPermissions.engineer, ELocalPermissions.viewer]
    }, ['**']);
  }
}

@Injectable()
export class ProjectImportGuard implements CanActivate {
  constructor(
    private guardService: GuardService
  ) { }

  async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    return this.guardService.redirectProject(state, {
      global: [EGlobalPermissions.manager],
      local: [ELocalPermissions.admin, ELocalPermissions.manager, ELocalPermissions.engineer]
    }, ['**']);
  }
}


