import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import { Reference } from 'src/app/shared/models/integrations/reference';
import { ReferenceType } from 'src/app/shared/models/integrations/reference-type';
import { BaseHttpService } from '../base-http/base-http.service';

@Injectable({
  providedIn: 'root'
})
export class ReferenceService extends BaseHttpService {

  public create(reference: Reference, refType: ReferenceType): Observable<Reference> {
    return this.http.post<Reference>(`/integration/references/${refType.path}`, reference);
  }

  public get(projectId: number, testId: number, refType: ReferenceType): Observable<Reference[]> {
    return this.http.get<Reference[]>(`/integration/references/${refType.path}?project_id=${projectId}&entity_id=${testId}`);
  }

  public delete(projectId: number, id: number, refType: ReferenceType) : Observable<{}> {
    return this.http.delete(`/integration/references/${refType.path}?project_id=${projectId}&id=${id}`);
  }
}
