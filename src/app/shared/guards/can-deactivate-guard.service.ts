import { Injectable } from '@angular/core';
import { CanDeactivate } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { TestResultViewComponent } from '../../pages/project/testresult/testresult.view.component';

export interface CanComponentDeactivate {
  canDeactivate: () => Observable<boolean> | Promise<boolean> | boolean;
}

@Injectable()
export class PendingChanges implements CanDeactivate<TestResultViewComponent> {
  async canDeactivate(component: TestResultViewComponent) {
    const result = await component.canDeactivate();
    console.log(result);
    return result;
  }
}
