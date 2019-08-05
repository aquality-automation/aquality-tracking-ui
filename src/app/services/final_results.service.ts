import { Injectable } from '@angular/core';
import 'rxjs/add/operator/map';
import { SimpleRequester } from './simple-requester';
import { FinalResult } from '../shared/models/final-result';

@Injectable()
export class FinalResultService extends SimpleRequester {

  getFinalResult(finalResult: FinalResult): Promise<FinalResult[]> {
    return this.doGet('/final_result', finalResult).map(res => res.json()).toPromise();
  }
}
