import { Injectable } from '@angular/core';
import 'rxjs/add/operator/map';
import { SimpleRequester } from './simple-requester';


@Injectable()
export class ImportService extends SimpleRequester {

  upload(buildParams: string, file: File) {
    return this.doPostFile(`/import${buildParams}`, file).map(res => res);
  }

  uploadAll(buildParams: string, fileListArray: File[]) {
    return this.doPostFiles(`/import${buildParams}`, fileListArray)
      .map(res => res);
  }

  importResults(projectId: number) {
    return this.doGet(`/import/results?projectId=${projectId}`)
      .map(res => res.json());
  }
}
