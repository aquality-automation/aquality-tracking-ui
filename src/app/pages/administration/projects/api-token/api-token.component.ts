import { Component } from '@angular/core';
import { SimpleRequester } from '../../../../services/simple-requester';
import { ProjectService } from '../../../../services/project.service';
import { Project } from '../../../../shared/models/project';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  templateUrl: 'api-token.component.html',
  styleUrls: ['../../global/app-settings/app-settings.component.css'],
  providers: [
    ProjectService,
    SimpleRequester
  ]
})
export class APITokenComponent {
  hideModal = true;
  removeModalTitle: string;
  removeModalMessage: string;
  projects: Project[];
  token: string;
  public selectedProject: Project;

  public hostUrl = this.sanitizer.bypassSecurityTrustUrl(`${window.location.protocol}//${window.location.host}/api`);

  constructor(
    private projectService: ProjectService,
    private sanitizer:DomSanitizer
  ) {
    this.projectService.getProjects({}).subscribe(result => {
      this.projects = result;
      this.selectedProject = this.projects[0];
    }, error => console.log(error));
  }

  onProjectChange($event) {
    this.selectedProject = $event;
    this.token = undefined;
  }

  generateTokenAction() {
    this.removeModalTitle = `Generate Token: ${this.selectedProject.name}`;
    this.removeModalMessage = `Are you sure that you want to generate new Import token for '${
      this.selectedProject.name
      }' project? The old one will be owerwritten. This action cannot be undone.`;
    this.hideModal = false;
  }

  generateToken() {
    this.projectService.createAPIToken(this.selectedProject).subscribe(res => {
      this.token = res.api_token;
    });
  }

  async execute($event) {
    if (await $event) {
      this.generateToken();
    }
    this.hideModal = true;
  }

  wasClosed() {
    this.hideModal = true;
  }
}
