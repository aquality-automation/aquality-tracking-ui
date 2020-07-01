import { Component, OnInit, Input } from '@angular/core';
import { TestResult } from '../../../shared/models/test-result';


@Component({
  selector: 'test-duration-chart',
  templateUrl: './testDuration.component.html',
})

export class TestDurationComponent implements OnInit {
  @Input() testResults: TestResult[];
  lineChartOptions: any = {
    scales: {
      xAxes: [{
        type: 'time',
        scaleLabel: {
          display: true,
          labelString: 'Result Finish Date'
        }
      }],
      yAxes: [{
        scaleLabel: {
          display: true,
          labelString: 'Seconds'
        }
      }]
    },
    legend: {
      display: false
    }
  };
  lineChartData: Array<any> = [];
  lineChartType = 'line';
  public lineChartColors: Array<any> = [
    {
      backgroundColor: 'rgba(148,159,177,0.2)',
      borderColor: 'rgba(148,159,177,1)',
      pointBackgroundColor: 'rgba(148,159,177,1)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(148,159,177,0.8)'
    }
  ];

  ngOnInit() {
    this.fillChartData();
  }

  fillChartData() {
    const dataArray: any[] = [];
    const results = this.testResults.reverse();
    for (const testResult of results) {
      if (testResult.finish_date) {
        dataArray.push({x: new Date(testResult.finish_date), y: this.calculateDuration(testResult)});
      }
    }
    this.lineChartData.push({data: dataArray});
  }

  calculateDuration(testResult: TestResult): number {
    if (testResult.start_date && testResult.finish_date) {
      const start_time = new Date(testResult.start_date);
      const finish_time = new Date(testResult.finish_date);
      return (finish_time.getTime() - start_time.getTime()) / 1000;
    }
    return 0;
  }
}
