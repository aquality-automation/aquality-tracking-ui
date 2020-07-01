import { Injectable } from '@angular/core';
import { BaseHttpService } from '../base-http/base-http.service';
import { FinalResult } from 'src/app/shared/models/final-result';

@Injectable()
export class FinalResultService extends BaseHttpService {

  getFinalResult(finalResult: FinalResult): Promise<FinalResult[]> {
    return this.http.get<FinalResult[]>('/final_result', { params: this.convertToParams(finalResult) }).toPromise();
  }
}
