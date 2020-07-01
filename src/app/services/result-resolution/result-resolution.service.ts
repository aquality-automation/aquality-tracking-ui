import { Injectable } from '@angular/core';
import { BaseHttpService } from '../base-http/base-http.service';
import { ResultResolution } from 'src/app/shared/models/result-resolution';


@Injectable()
export class ResultResolutionService extends BaseHttpService {

  getResolution(projectId?: number) {
    const pr: { project_id: string } = { project_id: undefined };
    pr.project_id = projectId ? projectId.toString() : this.currentProjectId.toString();
    return this.http.get<ResultResolution[]>(`/result_resolution`, { params: this.convertToParams(pr) }).toPromise();
  }

  createOrUpdateResolution(resultResolution: ResultResolution) {
    return this.http.post('/result_resolution', resultResolution).toPromise();
  }

  async removeResolution(resolution: ResultResolution) {
    await this.http.delete(`/result_resolution`, {
      params:
        { id: resolution.id.toString(), project_id: resolution.project_id.toString() }
    }).toPromise();
    this.handleSuccess(`Resolution '${resolution.name}' was deleted.`);
  }
}
