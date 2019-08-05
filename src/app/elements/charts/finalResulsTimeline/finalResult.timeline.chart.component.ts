import { Component, Input, OnInit } from '@angular/core';
import { SimpleRequester } from '../../../services/simple-requester';
import { TestResultService } from '../../../services/test-result.service';
import { TestResult } from '../../../shared/models/test-result';
import { FinalResult } from '../../../shared/models/final-result';
import { FinalResultService } from '../../../services/final_results.service';
import { Router, ActivatedRoute } from '@angular/router';


@Component({
  selector: 'result-timeline',
  templateUrl: './finalResult.timeline.chart.component.html',
  providers: [
    SimpleRequester,
    FinalResultService,
    TestResultService
  ]
})

export class FinalResultsTimelineComponent implements OnInit{
  @Input() testResults: TestResult[];
  listOfFinalResults: FinalResult[];
  lineChartOptions: any = {};
  lineChartData: Array<any> = [];
  lineChartType = 'bubble';

  constructor(
    private finalResultService: FinalResultService,
    private testResultService: TestResultService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  async ngOnInit() {
    this.listOfFinalResults = await this.finalResultService.getFinalResult({});
    this.fillChartData();
    this.fillLineChartOptionstColors();
  }

  setValueCallback(label): string {
    return this.listOfFinalResults.find(x => x.id === label).name;
  }

  fillChartData() {
    const dataArray: any[] = [];
    for (const testResult of this.testResults) {
      if (testResult.finish_date) {
        dataArray.push({ x: new Date(testResult.finish_date), y: testResult.final_result.id, r: 15 });
      }
    }
    this.lineChartData.push({ data: dataArray });
  }

  chartClicked(e: any) {
    const result = this.testResults[e.active[0]._index];
    this.router.navigate(['/project/' + this.route.snapshot.params['projectId'] + '/testresult/' + result.id]);
  }

  fillLineChartOptionstColors() {
    this.lineChartOptions = {
      legend: false,
      responsive: true,
      scales: {
        yAxes: [{
          ticks: {
            callback: function (label, index, labels) {
              switch (label) {
                case 1:
                  return 'Failed';
                case 2:
                  return 'Passed';
                case 3:
                  return 'Not Executed';
                case 4:
                  return 'In Progress';
                case 5:
                  return 'Pending';
              }
            },
            max: 5,
            min: 1,
            stepSize: 1
          }
        }],
        xAxes: [{
          type: 'time',
          scaleLabel: {
            display: true,
            labelString: 'Result Finish Date'
          }
        }]
      }
    };
  }
}
