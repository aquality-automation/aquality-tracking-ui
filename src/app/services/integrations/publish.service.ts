import { Injectable } from '@angular/core';
import moment from 'moment';
import { Observable } from 'rxjs';
import { PubEntry } from 'src/app/shared/models/integrations/pub-entry';
import { PubItem } from 'src/app/shared/models/integrations/pub-item';
import { BaseHttpService } from '../base-http/base-http.service';

@Injectable({
  providedIn: 'root'
})
export class PublishService extends BaseHttpService{

  publish(results: PubItem[], projectId: number, intSystemId: number, runId: number, runRef: string) : Observable<PubItem[]>{
    let entry: PubEntry = new PubEntry();
    entry.project_id = projectId;
    entry.int_system_id = intSystemId;
    entry.run_id = runId;
    entry.run_ref = runRef;
    entry.results = results;
    entry.time = moment(new Date(), 'YYYY-MM-DDTHH:mm').toString();
    return this.http.post<PubItem[]>('/integration/publish', entry);
  }
}
