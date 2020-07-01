import { Injectable } from '@angular/core';
import { Project, ImportBodyPattern } from 'src/app/shared/models/project';
import { BaseHttpService } from '../base-http/base-http.service';


@Injectable()
export class ProjectService extends BaseHttpService {

  getProjects(project: Project) {
    return this.http.get<Project[]>('/project', { params: this.convertToParams(project) }).toPromise();
  }

  async getProject(id: number): Promise<Project> {
    const projects = await this.http.get<Project[]>('/project', { params: { id: id.toString() } }).toPromise();
    return projects[0];
  }

  createProjects(project: Project): Promise<Project> {
    if (!project.customer_id && project.customer) {
      project.customer_id = project.customer.id;
    }
    return this.http.post('/project', project).toPromise();
  }

  async removeProject(project: Project) {
    await this.http.delete('/project', { params: { id: project.id.toString() } }).toPromise();
    this.notificationsService.success(`Removed!`, `Project '${project.name}' was deleted.`);
  }

  getImportBodyPatterns(bodyPattern: ImportBodyPattern) {
    return this.http.get<ImportBodyPattern[]>(`/body_pattern`, { params: { project_id: bodyPattern.project_id.toString() } }).toPromise();
  }

  createImportBodyPattern(bodyPattern: ImportBodyPattern) {
    return this.http.post('/body_pattern', bodyPattern).toPromise();
  }

  async removeImportBodyPattern(bodyPattern: ImportBodyPattern) {
    await this.http.delete(`/body_pattern`, {
      params:
        { id: bodyPattern.id.toString(), project_id: bodyPattern.project_id.toString() }
    }).toPromise();
    this.notificationsService.success(`Removed!`, `Unique Body Pattern '${bodyPattern.name}' successfully removed.`);
  }

  createAPIToken(project: Project) {
    return this.http.get<{ api_token: string }>(`/project/apiToken`, { params: { id: project.id.toString() } }).toPromise();
  }
}
