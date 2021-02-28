import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { TtsType } from 'src/app/shared/models/integrations/tts-type';
import { BaseHttpService } from '../base-http/base-http.service';

@Injectable({
  providedIn: 'root'
})
export class TtsTypeService extends BaseHttpService {

  public getTypes(): Observable<TtsType[]> {
    return this.http.get<TtsType[]>('/integration/tts/types');
  }
}
