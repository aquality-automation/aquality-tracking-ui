import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { RefStatus } from 'src/app/shared/models/integrations/ref-status';
import { BaseHttpService } from '../base-http/base-http.service';

@Injectable({
  providedIn: 'root'
})
export class RefStatusService extends BaseHttpService {

  public getStatuses(projectId: number, systemId: number, refs: string[]): Observable<RefStatus[]> {
    let data = {
      "project_id": projectId,
      "int_system_id": systemId,
      "refs": refs
    }
    return this.http.post<RefStatus[]>('/integration/references/status', data);
  }
}
