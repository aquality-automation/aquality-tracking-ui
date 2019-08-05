import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { SimpleRequester } from '../../../services/simple-requester';
import { TestSuiteService } from '../../../services/testSuite.service';
import { TestService } from '../../../services/test.service';

import { Test } from '../../../shared/models/test';
import { TestSuite } from '../../../shared/models/testSuite';
import { TransformationsService } from '../../../services/transformations.service';

@Component({
  templateUrl: './create-test.component.html',
  providers: [
    TransformationsService,
    SimpleRequester,
    TestSuiteService,
    TestService
   ]
})
export class CreateTestComponent {
  newTestName= '';
  body= '';
  testSuitesSelected: TestSuite[];
  testSuites: TestSuite[];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private testSuiteService: TestSuiteService,
    private testService: TestService
  ) {
    this.testSuiteService.getTestSuite({project_id: this.route.snapshot.params['projectId']}).then(result => {
      this.testSuites = result;
    });
  }

  processTestCreation() {
    const test: Test = {
      name: this.newTestName,
      body: this.body,
      suites: this.testSuitesSelected,
      project_id: this.route.snapshot.params['projectId'] };
    this.testService.createTest(test).subscribe(result => {
      this.router.navigate(['/project/' + this.route.snapshot.params['projectId'] + '/test/' + result]);
    }, error => console.log(error));
  }
}
