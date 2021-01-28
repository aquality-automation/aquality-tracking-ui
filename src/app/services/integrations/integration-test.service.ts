import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IntegrationTest } from 'src/app/shared/models/integration-test';
import { BaseHttpService } from '../base-http/base-http.service';

@Injectable({
  providedIn: 'root'
})
export class IntegrationTestService extends BaseHttpService {

  createLink(link: IntegrationTest): Observable<IntegrationTest> {
    return this.http.post<IntegrationTest>('/integration/test', link);
  }
}
