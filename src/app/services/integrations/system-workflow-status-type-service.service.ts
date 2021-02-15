import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import { SystemWorkflowStatusType } from 'src/app/shared/models/integrations/system-workflow-status-type';
import { BaseHttpService } from '../base-http/base-http.service';

@Injectable({
  providedIn: 'root'
})
export class SystemWorkflowStatusTypeServiceService extends BaseHttpService {

  public getTypes(): Observable<SystemWorkflowStatusType[]> {
    return this.http.get<SystemWorkflowStatusType[]>('/integration/system/workflow/status/types');
  }
}
