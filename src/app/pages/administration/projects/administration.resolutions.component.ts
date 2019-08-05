import { Component } from '@angular/core';
import { Project } from '../../../shared/models/project';
import { SimpleRequester } from '../../../services/simple-requester';
import { ProjectService } from '../../../services/project.service';
import { ResultResolutionService } from '../../../services/result-resolution.service';
import { ResultResolution } from '../../../shared/models/result_resolution';
import { TransformationsService } from '../../../services/transformations.service';

@Component({
  templateUrl: './administration.resolutions.component.html',
  providers: [
    ProjectService,
    SimpleRequester,
    ResultResolutionService,
    TransformationsService
  ]
})
export class AdministrationResolutionsComponent {
  hideModal = true;
  removeModalTitle: string;
  removeModalMessage: string;
  resolutionToRemove: ResultResolution;
  projects: Project[];
  selectedProject: Project;
  resolutions: ResultResolution[];
  colors = [
    { id: 1, title: 'Danger', color: 1 },
    { id: 2, title: 'Warning', color: 2 },
    { id: 3, title: 'Primary', color: 3 },
    { id: 4, title: 'Info', color: 4 },
    { id: 5, title: 'Success', color: 5 }];
  public sortBy = 'name';
  public sortOrder = 'asc';
  public tbCols: any[];

  constructor(
    private projectService: ProjectService,
    private resolutionsService: ResultResolutionService
  ) {
    this.projectService.getProjects(this.selectedProject).subscribe(result => {
      this.projects = result;
      this.selectedProject = this.projects[0];
      this.updateResolutions();
      this.tbCols = [
        {
          name: 'Name',
          property: 'name',
          filter: true,
          sorting: true,
          type: 'text',
          editable: true
        },
        {
          name: 'Color',
          entity: 'colorObject',
          property: 'colorObject.title',
          filter: true,
          sorting: true,
          type: 'lookup-colored',
          editable: true,
          values: this.colors
        }
      ];
    }, error => console.log(error));
  }

  onProjectChange($event) {
    this.selectedProject = $event;
    this.updateResolutions();
  }

  public handleAction($event) {
    switch ($event.action) {
      case 'create':
        return this.createResolution($event.entity);
      case 'remove':
        return this.removeResolution($event.entity);
    }
  }

  public createResolution($event) {
    this.resolutionsService.createOrUpdateResolution({
      id: $event.id,
      project_id: this.selectedProject.id,
      name: $event.name,
      color: $event.colorObject.color
    }).subscribe(() => {
      this.updateResolutions();
    });
  }

  public updateResolution(resolution: ResultResolution, $event) {
    if ($event.id) {
      resolution.color = $event.id;
    }
    this.resolutionsService.createOrUpdateResolution(resolution).subscribe(() => this.updateResolutions());
  }

  public removeResolution(resolution: ResultResolution) {
    this.resolutionToRemove = resolution;
    this.removeModalTitle = `Remove Resolution: ${resolution.name}`;
    this.removeModalMessage = `Are you sure that you want to delete the '${resolution.name}' resolution? This action cannot be undone.`;
    this.hideModal = false;
  }

  public getColor(id: number) {
    return this.colors.find(x => x.id === id);
  }

  updateResolutions() {
    this.resolutionsService.getResolution(this.selectedProject.id).subscribe(res => {
      this.resolutions = res;
      for (let i = 0; i < this.resolutions.length; i++) {
        this.resolutions[i]['colorObject'] = this.colors.find(x => x.id === this.resolutions[i].color);
        this.resolutions[i]['constantRow'] = this.resolutions[i].project_id === null || this.resolutions[i].project_id === undefined;
      }
      console.log(this.resolutions);
    }, error => console.log(error));
  }

  async execute($event) {
    if (await $event) {
      this.resolutionsService.removeResolution(this.resolutionToRemove).subscribe(() => this.updateResolutions());
    }
    this.hideModal = true;
  }

  wasClosed($event) {
    this.hideModal = $event;
  }
}
