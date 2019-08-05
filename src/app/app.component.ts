import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CookieService } from 'angular2-cookie/core';
import { User } from './shared/models/user';
import { SimpleRequester } from './services/simple-requester';
import { UserService } from './services/user.services';
import { GlobalDataService } from './services/globaldata.service';
import { Project } from './shared/models/project';
import { ProjectService } from './services/project.service';
import { ApplicationSettingsService } from './services/applicationSettings.service';
import { Navigation } from './shared/models/navigation.model';

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

  constructor(
    private route: ActivatedRoute,
    private cookieService: CookieService,
    public globaldata: GlobalDataService,
    public userService: UserService,
    public projectService: ProjectService,
    public settingsService: ApplicationSettingsService
  ) {
    this.appVersion = appVersion;
  }

  async changeOfRoutes() {
    this.issueEmailBody = encodeURIComponent(`Reported from page: ${window.location.href}`);
    await this.getInfo();
    this.navigations = [
      {
        name: 'Projects',
        link: '/project',
        show: this.isLogged && !this.projectId,
        routerOptions: { exact: false }
      }, {
        name: 'Audits',
        link: '/audit',
        show: this.isLogged
          && this.globaldata.auditModule
          && !this.projectId
          && (this.userService.IsManager() || this.userService.IsAuditor() || this.userService.IsAuditAdmin()),
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
          name: 'Dashboard',
          link: `/project/${this.projectId}/testsuite/dashboard`,
          show: true
        }],
        show: this.isLogged && this.projectId !== undefined,
        routerOptions: { exact: true }
      }, {
        name: 'Create',
        show: this.isLogged
          && this.projectId
          && (this.userService.HaveAnyLocalPermissionsExceptViewerWithoutPUpdating() || this.userService.IsManager()),
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
        show: this.isLogged
          && this.projectId
          && (this.userService.HaveAnyLocalPermissionsExceptViewerWithoutPUpdating() || this.userService.IsManager()),
        routerOptions: { exact: false }
      }, {
        name: 'Audits',
        link: `/audit/${this.projectId}`,
        show: this.isLogged
          && this.globaldata.auditModule
          && this.projectId
          && (!this.userService.IsManager()
            && !this.userService.IsAuditor()
            && !this.userService.IsAuditAdmin()
            && this.userService.HaveAnyLocalPermissions !== undefined),
        routerOptions: { exact: true }
      }, {
        name: 'Audits',
        show: this.isLogged
          && this.globaldata.auditModule
          && this.projectId
          && (this.userService.IsManager() || this.userService.IsAuditor() || this.userService.IsAuditAdmin()),
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
        show: this.isLogged
          && (this.userService.IsHead()
          || this.userService.IsUnitCoordinator()
          || this.userService.IsAccountManager()
          || this.globaldata.teamMember),
        routerOptions: { exact: false }
      }
    ];
    if (this.isLogged) {
      this.rightNavigations = [{
        name: this.userService.getUserFullName(this.globaldata.currentUser),
        id: 'user-mb',
        show: true,
        children: [{
          name: 'Edit My Account',
          link: `/settings`,
          show: true
        }, {
          name: 'Administration',
          link: `/administration`,
          show: this.userService.IsAdmin()
          || this.userService.IsManager()
          || this.userService.IsLocalAdmin()
          || this.userService.IsLocalManager()
        }, {
          name: 'Report an Issue',
          href: `mailto:reportingportal.help@jira.itransition.com?body=${this.issueEmailBody}`,
          show: true
        }]
      }];
    }
  }

  async getInfo() {
    this.isLogged = await this.userService.IsLogged();
    this.globaldata.auditModule = await this.settingsService.getGeneralSettings().toPromise();
    if (this.isLogged && this.route.firstChild && this.route.firstChild.firstChild) {
      await this.getProjectInfo();
    }
  }

  async getProjectInfo() {
    this.route.firstChild.firstChild.params.subscribe(params => {
      this.projectId = params['projectId'] ? parseInt(params['projectId'], 10) : undefined;
    });

    if (this.projectId) {
      this.currentUser = this.globaldata.currentUser;

      if (!this.currentProject || this.currentProject.id !== this.projectId) {
        this.currentProject = await this.projectService.getProject(this.projectId);
      }

      this.globaldata.anyLocalPermissions = await this.userService.getAnyLocalPermissions().toPromise();
      this.globaldata.localPermissions = this.globaldata.anyLocalPermissions.find(x => x.project_id === this.projectId);
    } else {
      this.currentProject = undefined;
    }
  }

  Logout() {
    this.cookieService.remove('iio78');
    this.isLogged = false;
    this.globaldata.Clear();
  }
}
