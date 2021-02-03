import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { System } from 'src/app/shared/models/integrations/system';
import { BaseHttpService } from '../base-http/base-http.service';

@Injectable({
  providedIn: 'root'
})
export class SystemService extends BaseHttpService {

  public getSystems(projectId: number): Observable<System[]> {
    return this.http.get<System[]>(`/integration/systems?project_id=${projectId}`);
  }
}
