import { Component, OnInit } from '@angular/core';
import { Project } from '../../../../shared/models/project';
import { ProjectService } from 'src/app/services/project/project.service';

@Component({
  templateUrl: './administration.projectSettings.component.html',
  styleUrls: ['../../global/app-settings/app-settings.component.scss']
})
export class AdministrationProjectSettingsComponent implements OnInit {
  hideModal = true;
  removeModalTitle: string;
  removeModalMessage: string;
  projects: Project[];
  selectedProject: Project;
  projectToSave: Project;

  constructor(
    private projectService: ProjectService
  ) { }

  async ngOnInit() {
    this.projects = await this.projectService.getProjects(this.selectedProject);
    this.selectedProject = this.projects[0];
    this.projectToSave = JSON.parse(JSON.stringify(this.projects[0]));
  }

  onProjectChange($event: Project) {
    this.selectedProject = $event;
    this.projectToSave = JSON.parse(JSON.stringify($event));
  }

  public saveProjectWithoutSteps() {
    this.removeModalTitle = `Disable Steps Feature`;
    this.removeModalMessage = `Are you sure that you want to Disable steps feature?
    \nThis action will remove all steps and step results from the project!`;
    this.hideModal = false;
  }

  async execute($event) {
    if (await $event) {
      this.updateProject();
    }
    this.hideModal = true;
  }

  wasClosed() {
    this.hideModal = true;
  }

  save() {
    if (this.selectedProject.steps !== this.projectToSave.steps && !this.projectToSave.steps) {
      this.saveProjectWithoutSteps();
    } else {
      this.updateProject();
    }
  }

  async updateProject() {
    this.projectToSave.steps = +this.projectToSave.steps;
    this.selectedProject = await this.projectService.createProjects(this.projectToSave);
    this.projectService.handleSuccess(`'${this.projectToSave.name}' project was updated!`);
    this.projects = await this.projectService.getProjects({});
  }
}
