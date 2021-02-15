import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { TtsStatus } from 'src/app/shared/models/integrations/tts-status';
import { BaseHttpService } from '../base-http/base-http.service';

@Injectable({
  providedIn: 'root'
})
export class TtsStatusService extends BaseHttpService {

  public create(status: TtsStatus): Observable<TtsStatus> {
    return this.http.post<TtsStatus>(`/integration/tts/status`, status);
  }

  public get(projectId: number, int_system_id: number): Observable<TtsStatus[]> {
    return this.http.get<TtsStatus[]>(`/integration/tts/status?project_id=${projectId}&int_system_id=${int_system_id}`);
  }

  public delete(projectId: number, id: number): Observable<{}> {
    return this.http.delete<{}>(`/integration/tts/status?project_id=${projectId}&id=${id}`);
  }
}
