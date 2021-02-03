import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import { Reference } from 'src/app/shared/models/integrations/reference';
import { BaseHttpService } from '../base-http/base-http.service';

@Injectable({
  providedIn: 'root'
})
export class TestReferenceService extends BaseHttpService {

  public create(reference: Reference): Observable<Reference> {
    return this.http.post<Reference>('/integration/references/test', reference);
  }

  public get(projectId: number, testId: number): Observable<Reference[]> {
    return this.http.get<Reference[]>(`/integration/references/test?project_id=${projectId}&entity_id=${testId}`);
  }

  public delete(projectId: number, id: number) : Observable<{}> {
    return this.http.delete(`/integration/references/test?project_id=${projectId}&id=${id}`);
  }

}
