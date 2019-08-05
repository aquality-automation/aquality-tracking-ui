import { Injectable } from '@angular/core';
import { Http, Headers , RequestOptions } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import { SimpleRequester } from './simple-requester';
import { ActivatedRoute } from '@angular/router';
import { ResultResolution } from '../shared/models/result_resolution';


@Injectable()
export class ResultResolutionService extends SimpleRequester {

  getResolution(projectId?: number) {
    let pr = '';
    if (projectId) {
      pr = `projectId=${projectId}`;
    } else if (this.route.snapshot.params['projectId']) {
      pr = `projectId=${this.route.snapshot.params['projectId']}`;
    }
    return this.doGet(`/result_resolution?${pr}`).map(res => res.json());
  }

  createOrUpdateResolution(resultResolution: ResultResolution) {
    return this.doPost('/result_resolution', resultResolution).map(res => res);
  }

  removeResolution(resolution: ResultResolution) {
    return this.doDelete(`/result_resolution?id=${resolution.id}&projectId=${resolution.project_id}`).map(res => {
      this.handleSuccess(`Resolution '${resolution.name}' was deleted.`);
      return res;
    });
  }
}
