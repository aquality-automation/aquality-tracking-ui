import { Component, Input, transition, style, animate, trigger, state } from '@angular/core';
import { SimpleRequester } from '../../../services/simple-requester';
import { TestResultService } from '../../../services/test-result.service';
import { TestResult } from '../../../shared/models/test-result';
import { ResultResolution } from '../../../shared/models/result_resolution';
import { ResultResolutionService } from '../../../services/result-resolution.service';
import { ActivatedRoute } from '@angular/router';
import { UserService } from '../../../services/user.services';
import { ListToCsvService } from '../../../services/listToCsv.service';
import { FinalResult } from '../../../shared/models/final-result';

@Component({
  selector: 'results-searcher',
  animations: [
    trigger('slideInOut', [
      state('in', style({
        transform: 'translate3d(0, 0, 0)'
      })),
      state('out', style({
        transform: 'translate3d(0, -100%, 0) translate3d(0, 20px , 0)'
      })),
      transition('in => out', animate('400ms ease-in-out')),
      transition('out => in', animate('400ms ease-in-out'))
    ]),
  ],
  templateUrl: './results.searcher.component.html',
  providers: [
    SimpleRequester,
    TestResultService,
    ResultResolutionService,
    ListToCsvService
  ]
})
export class ResultSearcherComponent {
  @Input() listOfResolutions: ResultResolution[];
  @Input() finalResults: FinalResult[];
  testResults: TestResult[];
  toggledOn = 'out';
  failReasonSearch = '';
  tbCols;

  constructor(
    private testResultService: TestResultService,
    private route: ActivatedRoute,
    public userService: UserService
  ) {
  }

  toggleTools() {
    this.toggledOn = this.toggledOn === 'out' ? 'in' : 'out';
  }

  async getResults() {
    this.tbCols = [
      { name: 'Started', property: 'start_date', filter: true, sorting: true, type: 'date', editable: false, class: 'fit' },
      { name: 'Test Name', property: 'test.name', filter: true, sorting: true, type: 'text', editable: false },
      {
        name: 'Fail Reason',
        property: 'fail_reason',
        filter: true,
        sorting: true,
        type: 'long-text',
        editable: false,
        listeners: ['contextmenu'],
        class: 'ft-width-500'
      },
      {
        name: 'Result',
        property: 'final_result.name',
        filter: true,
        sorting: true,
        type: 'lookup-colored',
        entity: 'final_result',
        values: this.finalResults,
        editable: false,
        class: 'fit'
      },
      {
        name: 'Resolution',
        property: 'test_resolution.name',
        filter: true,
        sorting: true,
        type: 'lookup-colored',
        entity: 'test_resolution',
        allowEmpty: false,
        values: this.listOfResolutions,
        editable: false,
        class: 'fit'
      },
      { name: 'Comment', property: 'comment', filter: true, sorting: false, type: 'text', editable: false, class: 'ft-width-250' }
    ];
    if (this.failReasonSearch.length > 150) {
      this.failReasonSearch = this.failReasonSearch.slice(0, 150);
    }
    this.testResults = await this.testResultService.getTestResult({ fail_reason: this.failReasonSearch });
  }

  rowClicked($event) {
    window.open(`#/project/${this.route.snapshot.params['projectId']}/testresult/${$event.id}`);
  }
}
