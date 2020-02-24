import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { User } from './shared/models/user';
import { SimpleRequester } from './services/simple-requester';
import { UserService } from './services/user.services';
import { GlobalDataService } from './services/globaldata.service';
import { Project } from './shared/models/project';
import { ProjectService } from './services/project.service';
import { ApplicationSettingsService } from './services/applicationSettings.service';
import { Navigation } from './shared/models/navigation.model';
import { PermissionsService, EGlobalPermissions, ELocalPermissions } from './services/current-permissions.service';
import { faCog, faBug, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';

declare var require: any;
const { version: appVersion } = require('../../package.json');

@Component({
  selector: 'app-component',
  styleUrls: ['./app.component.css'],
  templateUrl: './app.component.html',
  providers: [
    SimpleRequester,
    UserService,
    ApplicationSettingsService
  ]
})
export class AppComponent {
  showLoader = false;
  projectId: number;
  currentProject: Project;
  isLogged: boolean;
  currentUser: User;
  issueEmailBody: string;
  appVersion: string;
  options = {
    position: ['bottom', 'right'],
    timeOut: 3000,
    showProgressBar: true,
    pauseOnHover: true,
    clickToClose: true,
    clickIconToClose: true,
    lastOnBottom: true,
    preventDuplicates: true,
    maxStack: 4
  };
  navigations: Navigation[];
  rightNavigations: Navigation[];
  isLoaded: boolean;
  faSignOutAlt = faSignOutAlt;

  constructor(
    private route: ActivatedRoute,
    public globaldata: GlobalDataService,
    public userService: UserService,
    public projectService: ProjectService,
    public settingsService: ApplicationSettingsService,
    private permissionsService: PermissionsService
  ) {
    this.appVersion = appVersion;
    this.globaldata.showLoader.subscribe(value => {
      this.showLoader = value;
    });
  }

  async changeOfRoutes() {
    this.issueEmailBody = encodeURIComponent(`Reported from page: ${window.location.href}`);
    await this.getInfo();
    await this.updateNavigation();
  }

  async getInfo() {
    this.isLogged = await this.userService.handleIsLogged(false);
    this.globaldata.auditModule = (await this.settingsService.getGeneralSettings().toPromise()).audits;
    if (this.isLogged && this.route.firstChild && this.route.firstChild.firstChild) {
      await this.getProjectInfo();
    }
  }

  async getProjectInfo() {
    this.route.firstChild.firstChild.params.subscribe(params => {
      this.projectId = params.projectId ? parseInt(params.projectId, 10) : undefined;
    });

    if (this.projectId) {
      this.currentUser = this.globaldata.currentUser;

      if (!this.currentProject || this.currentProject.id !== this.projectId) {
        this.currentProject = await this.projectService.getProject(this.projectId);
      }

    } else {
      this.currentProject = undefined;
    }
    this.globaldata.announceCurrentProject(this.currentProject);
  }

  async Logout() {
    this.userService.logOut();
    await this.userService.redirectToLogin();
    await this.updateNavigation();
  }

  async updateNavigation() {
    if (this.isLogged) {
      this.navigations = [
        {
          name: 'Projects',
          link: '/project',
          show: this.isLogged && !this.projectId,
          routerOptions: { exact: false }
        }, {
          name: 'Audits',
          link: '/audit',
          show: this.globaldata.auditModule
            && !this.projectId
            && (await this.permissionsService.hasPermissions(
              [EGlobalPermissions.manager, EGlobalPermissions.audit_admin, EGlobalPermissions.auditor])),
          routerOptions: { exact: false }
        }, {
          name: this.currentProject ? this.currentProject.name : '',
          link: `/project/${this.projectId}`,
          show: this.isLogged
            && this.projectId !== undefined,
          routerOptions: { exact: true }
        }, {
          name: 'Test Runs',
          link: `/project/${this.projectId}/testrun`,
          params: { 'f_debug_st': false },
          show: this.isLogged && this.projectId !== undefined,
          routerOptions: { exact: false }
        }, {
          name: 'Milestones',
          link: `/project/${this.projectId}/milestone`,
          show: this.isLogged
            && this.projectId !== undefined,
          routerOptions: { exact: false }
        }, {
          name: 'Tests',
          children: [{
            name: 'All',
            link: `/project/${this.projectId}/tests`,
            show: true
          }, {
            name: 'Suites',
            link: `/project/${this.projectId}/testsuite`,
            show: true
          }, {
            name: 'Steps',
            link: `/project/${this.projectId}/steps`,
            show: this.currentProject && !!this.currentProject.steps
          }, {
            name: 'Dashboard',
            link: `/project/${this.projectId}/testsuite/dashboard`,
            show: true
          }],
          show: this.isLogged && this.projectId !== undefined,
          routerOptions: { exact: true }
        }, {
          name: 'Create',
          show: this.projectId
            && (await this.permissionsService.hasPermissions(
              [EGlobalPermissions.manager],
              [ELocalPermissions.admin, ELocalPermissions.engineer, ELocalPermissions.manager])),
          children: [{
            name: 'Milestone',
            link: `/project/${this.projectId}/create/milestone`,
            show: true
          }, {
            name: 'Suite',
            link: `/project/${this.projectId}/create/testsuite`,
            show: true
          }, {
            name: 'Test Run',
            link: `/project/${this.projectId}/create/testrun`,
            show: true
          }, {
            name: 'Test',
            link: `/project/${this.projectId}/create/test`,
            show: true
          }]
        }, {
          name: 'Import',
          link: `/project/${this.projectId}/import`,
          show: this.projectId && (await this.permissionsService.hasPermissions(
            [EGlobalPermissions.manager],
            [ELocalPermissions.admin, ELocalPermissions.engineer, ELocalPermissions.manager])),
          routerOptions: { exact: false }
        }, {
          name: 'Audits',
          link: `/audit/${this.projectId}`,
          show: (await this.permissionsService.hasPermissions(undefined,
            [ELocalPermissions.admin, ELocalPermissions.engineer, ELocalPermissions.manager, ELocalPermissions.viewer]))
            && this.projectId && this.globaldata.auditModule &&
            !(await this.permissionsService.hasPermissions([EGlobalPermissions.manager, EGlobalPermissions.auditor,
              EGlobalPermissions.audit_admin])),
          routerOptions: { exact: true }
        }, {
          name: 'Audits',
          show: (await this.permissionsService.hasPermissions([EGlobalPermissions.manager, EGlobalPermissions.auditor,
          EGlobalPermissions.audit_admin])) && this.projectId && this.globaldata.auditModule,
          children: [{
            name: 'Dashboard',
            link: `/audit`,
            show: true
          }, {
            name: 'Project',
            link: `/audit/${this.projectId}`,
            show: true
          }]
        }, {
          name: 'Customers',
          link: '/customer',
          show: await this.permissionsService.hasPermissions([EGlobalPermissions.head, EGlobalPermissions.unit_coordinator,
          EGlobalPermissions.account_manager]),
          routerOptions: { exact: false }
        }
      ];
      this.rightNavigations = [
        {
          name: this.userService.getUserFullName(this.globaldata.currentUser),
          id: 'user-mb',
          link: `/settings`,
          show: true,
          routerOptions: { exact: false }
        }, {
          name: 'Administration',
          link: `/administration`,
          id: 'administration-nav',
          icon: faCog,
          show: await this.permissionsService.hasPermissions([EGlobalPermissions.admin, EGlobalPermissions.manager],
            [ELocalPermissions.admin, ELocalPermissions.manager, ELocalPermissions.engineer]),
          routerOptions: { exact: false }
        }, {
          name: 'Report an Issue',
          id: 'bug-nav',
          icon: faBug,
          href: `https://github.com/aquality-automation/aquality-tracking/issues`,
          show: true
        },
      ];
    } else {
      this.navigations = [];
      this.rightNavigations = [];
    }
  }
}
