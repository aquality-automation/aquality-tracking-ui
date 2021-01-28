import { Injectable } from '@angular/core';
import { BaseHttpService } from '../base-http/base-http.service';
import { Observable } from 'rxjs/internal/Observable';
import { IntegrationSystem } from 'src/app/shared/models/integration-system';

@Injectable({
  providedIn: 'root'
})
export class IntegrationSystemService extends BaseHttpService {

  public getIntegrationSystems(): Observable<IntegrationSystem[]>{
      return this.http.get<IntegrationSystem[]>('/integration/systems');
  }
}
