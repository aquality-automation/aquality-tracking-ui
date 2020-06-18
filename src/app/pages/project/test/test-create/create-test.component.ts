import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Test } from '../../../../shared/models/test';
import { TestSuite } from 'src/app/shared/models/test-suite';
import { TestSuiteService } from 'src/app/services/test-suite/test-suite.service';
import { TestService } from 'src/app/services/test/test.service';

@Component({
  templateUrl: './create-test.component.html',
})
export class CreateTestComponent {
  newTestName = '';
  body = '';
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

  async processTestCreation() {
    let test: Test = {
      name: this.newTestName,
      body: this.body,
      suites: this.testSuitesSelected,
      project_id: this.route.snapshot.params['projectId'] };
    test = await this.testService.createTest(test);
    this.router.navigate(['/project/' + this.route.snapshot.params['projectId'] + '/test/' + test.id]);
  }
}
