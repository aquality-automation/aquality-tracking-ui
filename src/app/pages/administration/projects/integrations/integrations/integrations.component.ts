import { Component, OnInit } from '@angular/core';
import { ProjectService } from 'src/app/services/project/project.service';
import { System } from 'src/app/shared/models/integrations/system';
import { Project } from 'src/app/shared/models/project';

@Component({
  selector: 'app-integrations',
  templateUrl: './integrations.component.html',
  styleUrls: ['./integrations.component.scss']
})
export class IntegrationsComponent implements OnInit {

  projects: Project[] = [];
  selectedProject: Project;
  systems: System[] = [];

  constructor(private projectService: ProjectService) {}

  ngOnInit(): void {
    this.projectService.getProjects({}).then(projects => {
      this.projects = projects;
      this.selectedProject = projects[0];
    });
  }

  onProjectChange($event: Project) {
    this.selectedProject = $event;
  }

  isProjectSelected(): boolean {
    return this.selectedProject != undefined;
  }
}
