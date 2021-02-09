import { Injectable } from '@angular/core';
import { BaseHttpService } from '../base-http/base-http.service';
import { Observable } from 'rxjs/internal/Observable';
import { SystemType } from 'src/app/shared/models/integrations/system-type';

@Injectable({
  providedIn: 'root'
})
export class SystemTypeService extends BaseHttpService {

  public getTypes(): Observable<SystemType[]>{
      return this.http.get<SystemType[]>('/integration/system/types');
  }
}