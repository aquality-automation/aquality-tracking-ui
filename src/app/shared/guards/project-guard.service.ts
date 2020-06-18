import { Injectable } from '@angular/core';
import { CanActivate, CanDeactivate } from '@angular/router';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { EGlobalPermissions, ELocalPermissions } from 'src/app/services/permissions/current-permissions.service';
import { GuardService } from 'src/app/services/guard.service';
import { TestResultViewComponent } from 'src/app/pages/project/results/results-view/testresult-view.component';
import { TestViewComponent } from 'src/app/pages/project/test/test-view/test-view.component';

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



@Injectable()
export class ResultViewCanDeactivate implements CanDeactivate<TestResultViewComponent> {
  async canDeactivate(component: TestResultViewComponent) {
    const result = await component.canDeactivate();
    return result;
  }
}

@Injectable()
export class TestViewCanDeactivate implements CanDeactivate<TestViewComponent> {
  async canDeactivate(component: TestViewComponent) {
    const result = await component.canDeactivate();
    return result;
  }
}
