import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { TestSuite } from '../../../shared/models/testSuite';
import { SimpleRequester } from '../../../services/simple-requester';
import { TestSuiteService } from '../../../services/testSuite.service';

@Component({
  templateUrl: './create-testsuite.component.html',
  providers: [
    TestSuiteService,
    SimpleRequester
   ]
})
export class CreateTestSuiteComponent {

  newTestSuiteName= '';

  constructor(
    private postService: TestSuiteService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  processTestSuiteCreation() {
    const testSuite: TestSuite = { name: this.newTestSuiteName, project_id: this.route.snapshot.params['projectId'] };
    this.postService.createTestSuite(testSuite).then(result => {
      this.router.navigate(['/project/' + testSuite.project_id + '/testsuite'], { queryParams: { testSuite: result} });
    }, error => console.log(error));
  }
}
