import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import { SystemWorkflowStatus } from 'src/app/shared/models/integrations/system-workflow-status';
import { BaseHttpService } from '../base-http/base-http.service';

@Injectable({
  providedIn: 'root'
})
export class SystemWorkflowStatusServiceService extends BaseHttpService {

  public create(systemWorkflowStatus: SystemWorkflowStatus): Observable<SystemWorkflowStatus> {
    return this.http.post<SystemWorkflowStatus>('/integration/systems/workflow/status', systemWorkflowStatus);
  }

  public getAll(projectId: number): Observable<SystemWorkflowStatus[]> {
    return this.http.get<SystemWorkflowStatus[]>(`/integration/systems/workflow/status?project_id=${projectId}`);
  }

  public get(projectId: number, int_system_id: number): Observable<SystemWorkflowStatus[]> {
    return this.http.get<SystemWorkflowStatus[]>(`/integration/systems/workflow/status?project_id=${projectId}&int_system_id=${int_system_id}`);
  }

  public delete(projectId: number, id: number): Observable<{}> {
    return this.http.delete(`/integration/systems/workflow/status?project_id=${projectId}&id=${id}`);
  }
}
