import { Component, OnInit } from '@angular/core';
import { Project } from '../../../../shared/models/project';
import { DomSanitizer } from '@angular/platform-browser';
import { ProjectService } from 'src/app/services/project/project.service';

@Component({
  templateUrl: 'api-token.component.html',
  styleUrls: ['../../global/app-settings/app-settings.component.scss'],
})
export class APITokenComponent implements OnInit {
  hideModal = true;
  removeModalTitle: string;
  removeModalMessage: string;
  projects: Project[];
  token: string;
  public selectedProject: Project;

  public hostUrl = this.sanitizer.bypassSecurityTrustUrl(`${window.location.protocol}//${window.location.host}/api`);

  constructor(
    private projectService: ProjectService,
    private sanitizer: DomSanitizer
  ) { }

  async ngOnInit() {
    this.projects = await this.projectService.getProjects({});
    this.selectedProject = this.projects[0];
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

  async generateToken() {
    this.token = (await this.projectService.createAPIToken(this.selectedProject)).api_token;
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
