import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { SimpleRequester } from '../../../services/simple-requester';
import { TestResultService } from '../../../services/test-result.service';
import { FinalResult } from '../../../shared/models/final-result';
import { FinalResultService } from '../../../services/final_results.service';
import { Router, ActivatedRoute } from '@angular/router';
import { TestRunService } from '../../../services/testRun.service';
import { TestRunStat } from '../../../shared/models/testrunStats';
import { ResultResolutionService } from '../../../services/result-resolution.service';
import { ResultResolution } from '../../../shared/models/result_resolution';
import { GlobalDataService } from '../../../services/globaldata.service';


@Component({
  selector: 'testrun-result-timeline',
  templateUrl: './testRun.results.chart.html',
  styleUrls: ['./testRun.results.chart.css'],
  providers: [
    SimpleRequester,
    FinalResultService,
    TestResultService
  ]
})

export class TestRunsResultsTimelineComponent implements OnInit, OnChanges {
  @Input() testRunsStat: TestRunStat[];
  switchState = false;
  switchLabel = 'Results';
  projectId: number;
  listOfFinalResults: FinalResult[];
  listOfResolutions: ResultResolution[];
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
        distribution: 'linear',
        time: {
          minUnit: 'day',
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

  colors = {
    danger: {
      fill: '#dc3545',
      stroke: '#dc3545',
    },
    success: {
      fill: '#28a745',
      stroke: '#28a745',
    },
    primary: {
      fill: '#007bff',
      stroke: '#007bff',
    },
    warning: {
      fill: '#ffc107',
      stroke: '#ffc107',
    },
    info: {
      fill: '#17a2b8',
      stroke: '#17a2b8',
    },
    point: {
      stroke: '#fff'
    }
  };

  public lineChartColors: Array<any> = [
    {
      pointBorderColor: this.colors.point.stroke,
      backgroundColor: this.colors.danger.fill
    },
    {
      pointBorderColor: this.colors.point.stroke,
      backgroundColor: this.colors.success.fill
    },
    {
      pointBorderColor: this.colors.point.stroke,
      backgroundColor: this.colors.primary.fill
    },
    {
      pointBorderColor: this.colors.point.stroke,
      backgroundColor: this.colors.warning.fill
    },
    {
      pointBorderColor: this.colors.point.stroke,
      backgroundColor: this.colors.info.fill
    }
  ];

  constructor(
    private finalResultService: FinalResultService,
    private resolutionService: ResultResolutionService,
    public globaldata: GlobalDataService,
    private route: ActivatedRoute,
  ) {
  }

  ngOnInit(): void {
    this.globaldata.currentProject$.subscribe(project => this.projectId = project.id);
  }

  async ngOnChanges() {
    if (!this.listOfFinalResults || this.listOfFinalResults.length < 1) {
      this.listOfFinalResults = await this.finalResultService.getFinalResult({});
      this.listOfResolutions = [{
        color: 1,
        name: 'App Issue'
      }, {
        color: 2,
        name: 'Passed'
      }, {
        color: 4,
        name: 'Not Assigned'
      }, {
        color: 3,
        name: 'Test Issues'
      }, {
        color: 5,
        name: 'Other'
      }];
      this.fillData();
    } else {
      this.fillData();
    }
  }

  fillData() {
    if (this.switchState) {
      this.fillByResolution();
    } else {
      this.fillByResult();
    }
  }

  fillByResolution() {
    this.testRunsStat = this.testRunsStat.filter(x => x.finish_time);
    this.testRunsStat = this.testRunsStat.sort((a, b) => new Date(a.finish_time).getTime() - new Date(b.finish_time).getTime());
    this.lineChartData = [];
    for (const resolution of this.listOfResolutions) {
      const dataArray: any[] = [];
      let hidden = true;
      for (const resultsSet of this.testRunsStat) {
        switch (resolution.color) {
          case 1:
            if (resultsSet.app_issue !== 0) { hidden = false; }
            dataArray.push({ x: resultsSet.finish_time, y: resultsSet.app_issue, ts: resultsSet });
            break;
          case 2:
            if (resultsSet.passed !== 0) { hidden = false; }
            dataArray.push({ x: resultsSet.finish_time, y: resultsSet.passed, ts: resultsSet });
            break;
          case 4:
            if (resultsSet.not_assigned !== 0) { hidden = false; }
            dataArray.push({ x: resultsSet.finish_time, y: resultsSet.not_assigned, ts: resultsSet });
            break;
          case 3:
            if (resultsSet.warning !== 0) { hidden = false; }
            dataArray.push({ x: resultsSet.finish_time, y: resultsSet.warning, ts: resultsSet });
            break;
          case 5:
            if (resultsSet.other !== 0) { hidden = false; }
            dataArray.push({ x: resultsSet.finish_time, y: resultsSet.other, ts: resultsSet });
            break;
        }
      }
      console.log(hidden);
      this.lineChartData.push({ data: dataArray, label: resolution.name, hidden: hidden, lineTension: 0.1 });
    }
    console.log(this.lineChartData);
  }

  fillByResult() {
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
      this.lineChartData.push({ data: dataArray, label: finalResult.name, hidden: hidden, lineTension: 0.1 });
    }
  }

  chartClicked(e: any) {
    if (e.active[0]) {
      const datasetIndex = e.active[0]._datasetIndex;
      const dataIndex = e.active[0]._index;
      window.open(`#/project/${this.route.snapshot.params['projectId']}/testrun/${this.lineChartData[datasetIndex].data[dataIndex].ts.id}`);
    }
  }

  switch() {
    this.switchState = !this.switchState;
    this.fillData();
  }
}
