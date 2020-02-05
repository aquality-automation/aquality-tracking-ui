import { Component, Input, transition, style, animate, trigger, state } from '@angular/core';
import { SimpleRequester } from '../../../../services/simple-requester';
import { TestResultService } from '../../../../services/test-result.service';
import { TestResult } from '../../../../shared/models/test-result';
import { ResultResolution } from '../../../../shared/models/result_resolution';
import { ResultResolutionService } from '../../../../services/result-resolution.service';
import { UserService } from '../../../../services/user.services';
import { ListToCsvService } from '../../../../services/listToCsv.service';
import { FinalResult } from '../../../../shared/models/final-result';
import { TFColumn, TFColumnType } from '../../../../elements/table/tfColumn';

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
  styleUrls: ['./results.searcher.component.css'],
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
  tbCols: TFColumn[];
  isRegexSearch = false;
  limit = 10;
  pendingSearch = false;

  constructor(
    private testResultService: TestResultService,
    public userService: UserService
  ) {
  }

  toggleTools() {
    this.toggledOn = this.toggledOn === 'out' ? 'in' : 'out';
  }

  toggleRegexpSearch() {
    this.isRegexSearch = !this.isRegexSearch;
  }

  async getResults() {
    this.pendingSearch = true;
    this.tbCols = [
      { name: 'Started', property: 'start_date', filter: true, sorting: true, type: TFColumnType.date, class: 'fit' },
      { name: 'Test Name', property: 'test.name', filter: true, sorting: true, type: TFColumnType.text },
      {
        name: 'Fail Reason',
        property: 'fail_reason',
        filter: true,
        sorting: true,
        type: TFColumnType.longtext,
        listeners: ['contextmenu'],
        class: 'ft-width-500'
      },
      {
        name: 'Result',
        property: 'final_result.name',
        filter: true,
        sorting: true,
        type: TFColumnType.colored,
        lookup: {
          entity: 'final_result',
          values: this.finalResults,
          propToShow: ['name']
        },
        class: 'fit'
      },
      {
        name: 'Resolution',
        property: 'test_resolution.name',
        filter: true,
        sorting: true,
        type: TFColumnType.colored,
        lookup: {
          entity: 'test_resolution',
          values: this.listOfResolutions,
          propToShow: ['name']
        },
        class: 'fit'
      },
      { name: 'Comment', property: 'comment', filter: true, type: TFColumnType.text, class: 'ft-width-250' }
    ];
    if (this.failReasonSearch.length > 150) {
      this.failReasonSearch = this.failReasonSearch.slice(0, 150);
    }
    const testResultSearchTemplate: TestResult = { limit: this.limit };
    this.isRegexSearch
      ? testResultSearchTemplate.fail_reason_regex = this.failReasonSearch
      : testResultSearchTemplate.fail_reason = this.failReasonSearch;
    this.testResults = await this.testResultService.getTestResult(testResultSearchTemplate);
    this.pendingSearch = false;
  }
}
