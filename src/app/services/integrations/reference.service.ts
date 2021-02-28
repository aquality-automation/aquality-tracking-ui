import { Injectable } from '@angular/core';
import { throwError } from 'rxjs';
import { Observable } from 'rxjs/internal/Observable';
import { mergeMap } from 'rxjs/internal/operators/mergeMap';
import { Subject } from 'rxjs/internal/Subject';
import { Reference } from 'src/app/shared/models/integrations/reference';
import { ReferenceType } from 'src/app/shared/models/integrations/reference-type';
import { System } from 'src/app/shared/models/integrations/system';
import { BaseHttpService } from '../base-http/base-http.service';

@Injectable({
  providedIn: 'root'
})
export class ReferenceService extends BaseHttpService {

  public get(projectId: number, entityId: number, refType: ReferenceType): Observable<Reference[]> {
    if(entityId !== undefined){
      return this.http.get<Reference[]>(`/integration/references/${refType.path}?project_id=${projectId}&entity_id=${entityId}`);
    } else {
      let emptyReferences : Subject<Reference[]> = new Subject<Reference[]>();
      emptyReferences.next([]);
      return emptyReferences;
    }
  }

  public getAll(projectId: number, refType: ReferenceType): Observable<Reference[]> {
    return this.http.get<Reference[]>(`/integration/references/${refType.path}?project_id=${projectId}`);
  }

  public delete(projectId: number, id: number, refType: ReferenceType): Observable<{}> {
    return this.http.delete(`/integration/references/${refType.path}?project_id=${projectId}&id=${id}`);
  }

  public create(reference: Reference, refType: ReferenceType): Observable<Reference> {
    return this.get(reference.project_id, reference.entity_id, refType)
      .pipe(
        mergeMap(references => {
          if (references.length == 0) {
            return this.createRef(reference, refType);
          } else {
            if (this.validateOnSingleRefPerSystem(references, reference)) {
              return this.createRef(reference, refType);
            }
            throw throwError(errors.alreadyExists);
          }
        })
      );
  }

  private createRef(reference: Reference, refType: ReferenceType): Observable<Reference> {
    return this.http.post<Reference>(`/integration/references/${refType.path}`, reference);
  }

  private validateOnSingleRefPerSystem(references: Reference[], reference: Reference): boolean {
    let ref: Reference = references.find(ref => ref.int_system === reference.int_system);
    if (ref !== undefined) {
      this.handleSimpleError(errors.alreadyExists,
        `You are allowed to have only single reference per system. Please, try to remove ${ref.key} and try again.`);
      return false;
    }
    return true;
  }

  public getRefSystemName(systems: System[], reference: Reference): string {
    return systems.filter(system => system.id === reference.int_system)[0]?.name;
  }
}

export const errors = { alreadyExists: "Reference already exists" }
