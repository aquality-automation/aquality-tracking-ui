import { Component } from '@angular/core';
import { SimpleRequester } from '../../../../services/simple-requester';
import { ProjectService } from '../../../../services/project.service';
import { Project } from '../../../../shared/models/project';

@Component({
  templateUrl: 'import-token.component.html',
  styleUrls: ['import-token.component.css'],
  providers: [
    ProjectService,
    SimpleRequester
  ]
})
export class ImportTokenComponent {
  hideModal = true;
  removeModalTitle: string;
  removeModalMessage: string;
  projects: Project[];
  token: string;
  public selectedProject: Project;

  constructor(
    private projectService: ProjectService
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
    this.projectService.createImportToken(this.selectedProject).subscribe(res => {
      this.token = res.token;
    });
  }

  async execute($event) {
    if (await $event) {
      this.generateToken();
    }
    this.hideModal = true;
  }

  wasClosed($event) {
    this.hideModal = $event;
  }
}
