import { Injectable } from '@angular/core';
import 'rxjs/add/operator/map';
import { SimpleRequester } from './simple-requester';
import { Project, ImportBodyPattern, PredefinedResolution } from '../shared/models/project';


@Injectable()
export class ProjectService extends SimpleRequester {

  getProjects(project: Project) {
    return this.doGet('/project', project).map(res => res.json());
  }

  async getProject(id: number): Promise<Project> {
    const projects = await this.doGet('/project', { id }).map(res => res.json()).toPromise();
    return projects[0];
  }

  createProjects(project: Project): Promise<Project> {
    if (!project.customer_id && project.customer) {
      project.customer_id = project.customer.id;
    }
    const result = this.doPost('/project', project).map(res => res.json(),
      (err: any) => { this.handleError(err); }).toPromise();
    return result;
  }

  removeProject(project: Project) {
    return this.doDelete('/project', { id: project.id })
      .map(() => this.handleSuccess(`Project '${project.name}' was deleted.`));
  }

  getImportBodyPatterns(bodyPattern: ImportBodyPattern) {
    return this.doGet(`/body_pattern?projectId=${bodyPattern.project_id}`).map(res => res.json());
  }

  createImportBodyPattern(bodyPattern: ImportBodyPattern) {
    return this.doPost('/body_pattern', bodyPattern).map(() => { });
  }

  removeImportBodyPattern(bodyPattern: ImportBodyPattern) {
    return this.doDelete(`/body_pattern?id=${bodyPattern.id}&projectId=${bodyPattern.project_id}`)
      .map(() => this.handleSuccess(`Unique Body Pattern '${bodyPattern.name}' successfully removed.`));
  }

  createAPIToken(project: Project) {
    return this.doGet(`/project/apiToken`, { id: project.id }).map(res => res.json());
  }

  createPredefinedResolution(predefinedResolution: PredefinedResolution) {
    if (predefinedResolution.resolution) {
      predefinedResolution.resolution_id = predefinedResolution.resolution.id;
    }
    if (predefinedResolution.assigned_user) {
      predefinedResolution.assignee = predefinedResolution.assigned_user.id;
    }
    return this.doPost(`/project/predefined-resolution`, predefinedResolution).map(res => res.json()).toPromise();
  }

  getPredefinedResolution(predefinedResolution: PredefinedResolution) {
    return this.doGet(`/project/predefined-resolution`, predefinedResolution).map(res => res.json()).toPromise();
  }

  removePredefinedResolution(predefinedResolution: PredefinedResolution) {
    return this.doDelete(`/project/predefined-resolution`, predefinedResolution).map(res => res).toPromise();
  }
}
