import { Component, OnInit } from '@angular/core';
import { Project } from '../../../../shared/models/project';
import { ResultResolution } from 'src/app/shared/models/result-resolution';
import { TFOrder, TFColumn, TFColumnType } from 'src/app/elements/table-filter/tfColumn';
import { ProjectService } from 'src/app/services/project/project.service';
import { ResultResolutionService } from 'src/app/services/result-resolution/result-resolution.service';
import { resolutionTypesArray } from 'src/app/shared/models/resolution-type';

@Component({
  templateUrl: './administration.resolutions.component.html'
})
export class AdministrationResolutionsComponent implements OnInit {
  hideModal = true;
  removeModalTitle: string;
  removeModalMessage: string;
  resolutionToRemove: ResultResolution;
  projects: Project[];
  selectedProject: Project;
  resolutions: ResultResolution[];
  colors = resolutionTypesArray;
  public sortBy = 'name';
  public sortOrder = TFOrder.asc;
  public tbCols: TFColumn[];

  constructor(
    private projectService: ProjectService,
    private resolutionsService: ResultResolutionService
  ) { }

  async ngOnInit() {
    this.projects = await this.projectService.getProjects(this.selectedProject);
    this.selectedProject = this.projects[0];
    this.updateResolutions();
    this.tbCols = [
      {
        name: 'Name',
        property: 'name',
        filter: true,
        sorting: true,
        type: TFColumnType.text,
        editable: true,
        creation: {
          required: true
        }
      },
      {
        name: 'Color',
        property: 'colorObject',
        filter: true,
        sorting: true,
        type: TFColumnType.colored,
        lookup: {
          values: this.colors,
          propToShow: ['title']
        },
        editable: true,
        creation: {
          required: true
        }
      }
    ];
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

  public async createResolution($event) {
    await this.resolutionsService.createOrUpdateResolution({
      id: $event.id,
      project_id: this.selectedProject.id,
      name: $event.name,
      color: $event.colorObject.color
    });

    this.updateResolutions();
  }

  public updateResolution(resolution: ResultResolution, $event) {
    if ($event.id) {
      resolution.color = $event.id;
    }
    this.resolutionsService.createOrUpdateResolution(resolution);
    this.updateResolutions();
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

  async updateResolutions() {
    this.resolutions = await this.resolutionsService.getResolution(this.selectedProject.id);
    for (let i = 0; i < this.resolutions.length; i++) {
      this.resolutions[i]['colorObject'] = this.colors.find(x => x.id === this.resolutions[i].color);
      this.resolutions[i]['constantRow'] = this.resolutions[i].project_id === null || this.resolutions[i].project_id === undefined;
    }
  }

  async execute($event) {
    if (await $event) {
      await this.resolutionsService.removeResolution(this.resolutionToRemove);
      this.updateResolutions();
    }
    this.hideModal = true;
  }

  wasClosed() {
    this.hideModal = true;
  }
}
