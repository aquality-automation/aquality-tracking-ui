import { Component, Input} from '@angular/core';
import { TestResult } from '../../../../shared/models/test-result';
import { FinalResult } from '../../../../shared/models/final-result';
import { faAngleDown, faAngleUp, faSearch } from '@fortawesome/free-solid-svg-icons';
import { ResultResolution } from 'src/app/shared/models/result-resolution';
import { TFColumn, TFColumnType } from 'src/app/elements/table-filter/tfColumn';
import { TestResultService } from 'src/app/services/test-result/test-result.service';
import { UserService } from 'src/app/services/user/user.services';
import { trigger, state, style, transition, animate } from '@angular/animations';

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
  templateUrl: './results-searcher.component.html',
  styleUrls: ['./results-searcher.component.scss']
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
  icons = {
    faAngleDown,
    faAngleUp,
    faSearch
  };

  constructor(
    private testResultService: TestResultService,
    public userService: UserService
  ) { }

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
        property: 'final_result',
        filter: true,
        sorting: true,
        type: TFColumnType.colored,
        lookup: {
          values: this.finalResults,
          propToShow: ['name']
        },
        class: 'fit'
      },
      {
        name: 'Resolution',
        property: 'issue.resolution',
        filter: true,
        sorting: true,
        type: TFColumnType.colored,
        lookup: {
          values: this.listOfResolutions,
          propToShow: ['name']
        },
        class: 'fit'
      },
      { name: 'Issue', property: 'issue.title', filter: true, type: TFColumnType.text, class: 'ft-width-250' }
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
