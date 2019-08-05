import { Component, Input, OnChanges } from '@angular/core';
import { SimpleRequester } from '../../../services/simple-requester';
import { TestResultService } from '../../../services/test-result.service';
import { FinalResult } from '../../../shared/models/final-result';
import { FinalResultService } from '../../../services/final_results.service';
import { Router, ActivatedRoute } from '@angular/router';
import { TestRunService } from '../../../services/testRun.service';
import { TestRunStat } from '../../../shared/models/testrunStats';


@Component({
  selector: 'testrun-result-timeline',
  templateUrl: './testRun.results.chart.html',
  providers: [
    SimpleRequester,
    FinalResultService,
    TestResultService
  ]
})

export class TestRunsResultsTimelineComponent implements OnChanges {
  @Input() testRunsStat: TestRunStat[];
  listOfFinalResults: FinalResult[];
  lineChartOptions: any = {
    hover: {
      mode: 'nearest',
      intersec: true,
    },
    interaction: {
      mode: 'nearest',
    },
    scales: {
      xAxes: [{
        type: 'time',
        time: {
          displayFormats: {
            quarter: 'MMM YYYY',
            day: 'll HH:mm',
            hour: 'll HH:mm',
            second: 'll HH:mm',
            millisecond: 'll HH:mm',
            minute: 'll HH:mm'
          },
          tooltipFormat: 'll HH:mm'
        },
        scaleLabel: {
          display: true,
          labelString: 'Finish Date'
        }
      }],
      yAxes: [{
        stacked: true,
        scaleLabel: {
          display: true,
          labelString: 'Tests Number'
        }
      }]
    }
  };
  lineChartData: Array<any> = [];
  lineChartType = 'line';
  lineChartLabels: Array<any> = [];

  public lineChartColors: Array<any> = [
    {
      backgroundColor: 'rgba(224, 0, 0, 0.8)',
      borderColor: 'rgba(224, 0, 0, 1)',
      pointBackgroundColor: 'rgba(204, 0, 0, 1)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(224, 0, 0, 1)'
    },
    {
      backgroundColor: 'rgba(0, 153, 0, 0.8)',
      borderColor: 'rgba(0, 133, 0, 1)',
      pointBackgroundColor: 'rgba(0, 133, 0, 1',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(0, 133, 0, 0.8)'
    },
    {
      backgroundColor: 'rgba(51, 102, 255, 0.8)',
      borderColor: 'rgba(51, 102, 255, 1)',
      pointBackgroundColor: 'rgba(51, 102, 255, 1)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(51, 102, 255, 0.8)'
    },
    {
      backgroundColor: 'rgba(255, 102, 0, 0.8)',
      borderColor: 'rgba(255, 102, 0, 1)',
      pointBackgroundColor: 'rgba(255, 102, 0, 1)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(255, 102, 0, 0.8)'
    },
    {
      backgroundColor: 'rgba(91, 192, 222, 0.8)',
      borderColor: 'rgba(91, 192, 222, 1)',
      pointBackgroundColor: 'rgba(91, 192, 222, 1)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(91, 192, 222, 0.8)'
    }
  ];

  constructor(
    private finalResultService: FinalResultService,
    private testRunService: TestRunService,
    private route: ActivatedRoute,
    private router: Router
  ) {
  }

  async ngOnChanges() {
    if (!this.listOfFinalResults || this.listOfFinalResults.length < 1) {
      this.listOfFinalResults = await this.finalResultService.getFinalResult({});
      this.fillData();
    } else {
      this.fillData();
    }
  }

  async fillData() {
    await this.fillChartData();
  }

  fillChartData() {
    this.testRunsStat = this.testRunsStat.filter(x => x.finish_time);
    this.testRunsStat = this.testRunsStat.sort((a, b) => new Date(a.finish_time).getTime() - new Date(b.finish_time).getTime());
    this.lineChartData = [];
    for (const finalResult of this.listOfFinalResults) {
      const dataArray: any[] = [];
      let hidden = true;
      for (const resultsSet of this.testRunsStat) {
        switch (finalResult.id) {
          case 1:
            if (resultsSet.failed !== 0) { hidden = false; }
            dataArray.push({ x: resultsSet.finish_time, y: resultsSet.failed, ts: resultsSet });
            break;
          case 2:
            if (resultsSet.passed !== 0) { hidden = false; }
            dataArray.push({ x: resultsSet.finish_time, y: resultsSet.passed, ts: resultsSet });
            break;
          case 3:
            if (resultsSet.not_executed !== 0) { hidden = false; }
            dataArray.push({ x: resultsSet.finish_time, y: resultsSet.not_executed, ts: resultsSet });
            break;
          case 4:
            if (resultsSet.in_progress !== 0) { hidden = false; }
            dataArray.push({ x: resultsSet.finish_time, y: resultsSet.in_progress, ts: resultsSet });
            break;
          case 5:
            if (resultsSet.pending !== 0) { hidden = false; }
            dataArray.push({ x: resultsSet.finish_time, y: resultsSet.pending, ts: resultsSet });
            break;
        }
      }
      this.lineChartData.push({ data: dataArray, label: finalResult.name, hidden: hidden });
    }
  }

  chartClicked(e: any) {
    const datasetIndex = e.active[0]._datasetIndex;
    const dataIndex = e.active[0]._index;
    window.open(`#/project/${this.route.snapshot.params['projectId']}/testrun/${this.lineChartData[datasetIndex].data[dataIndex].ts.id}`);
  }
}
