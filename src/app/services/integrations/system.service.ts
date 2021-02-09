import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { System } from 'src/app/shared/models/integrations/system';
import { BaseHttpService } from '../base-http/base-http.service';

@Injectable({
  providedIn: 'root'
})
export class SystemService extends BaseHttpService {

  public create(system: System): Observable<System> {
    return this.http.post<System>('/integration/systems', system);
  }

  public getAll(projectId: number): Observable<System[]> {
    return this.http.get<System[]>(`/integration/systems?project_id=${projectId}`);
  }

  public get(projectId: number, id: number): Observable<System[]> {
    return this.http.get<System[]>(`/integration/systems?project_id=${projectId}&id=${id}`);
  }

  public delete(projectId: number, id: number): Observable<{}> {
    return this.http.delete(`/integration/systems?project_id=${projectId}&id=${id}`);
  }
}
