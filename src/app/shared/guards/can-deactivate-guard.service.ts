import { Injectable } from '@angular/core';
import { CanDeactivate } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { TestResultViewComponent } from '../../pages/project/results/results-view/testresult.view.component';
import { TestViewComponent } from '../../pages/project/test/test-view/test.view.component';

export interface CanComponentDeactivate {
  canDeactivate: () => Observable<boolean> | Promise<boolean> | boolean;
}

@Injectable()
export class ResultViewCanDeactivate implements CanDeactivate<TestResultViewComponent> {
  async canDeactivate(component: TestResultViewComponent) {
    const result = await component.canDeactivate();
    return result;
  }
}

@Injectable()
export class TestViewCanDeactivate implements CanDeactivate<TestViewComponent> {
  async canDeactivate(component: TestViewComponent) {
    const result = await component.canDeactivate();
    return result;
  }
}
