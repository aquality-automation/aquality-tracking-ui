import { Component, Input, OnChanges, OnInit, OnDestroy } from '@angular/core';
import { FinalResult } from '../../../shared/models/final-result';
import { GlobalDataService } from '../../../services/globaldata.service';
import { colors } from '../../../shared/colors.service';
import { TestRunStat } from 'src/app/shared/models/testrun-stats';
import { ResultResolution } from 'src/app/shared/models/result-resolution';
import { FinalResultService } from 'src/app/services/final-result/final_results.service';
import { Subscription } from 'rxjs/internal/Subscription';

@Component({
  selector: 'testrun-result-timeline',
  templateUrl: './testrun-trend-chart.component.html',
  styleUrls: ['./testrun-trend-chart.component.scss'],
})
export class TestRunsResultsTimelineComponent implements OnInit, OnChanges, OnDestroy {
  @Input() testRunsStat: TestRunStat[];
  projectSubscription: Subscription;
  switchState = false;
  switchLabels = {
    result: 'Results',
    resolution: 'Resolutions'
  };
  projectId: number;
  listOfFinalResults: FinalResult[];
  listOfResolutions: ResultResolution[];
  lineChartOptions: any = {
    hover: {
      mode: 'nearest',
      intersec: true
    },
    interaction: {
      mode: 'nearest'
    },
    scales: {
      xAxes: [
        {
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
        }
      ],
      yAxes: [
        {
          stacked: true,
          scaleLabel: {
            display: true,
            labelString: 'Tests Number'
          }
        }
      ]
    }
  };
  lineChartData: Array<any> = [];
  lineChartType = 'line';
  lineChartLabels: Array<any> = [];
  orderByColor = [5, 3, 1, 2, 4];

  public lineChartColors: Array<any> = [
    {
      pointBorderColor: colors.point.stroke,
      backgroundColor: colors.success.fill
    },
    {
      pointBorderColor: colors.point.stroke,
      backgroundColor: colors.primary.fill
    },
    {
      pointBorderColor: colors.point.stroke,
      backgroundColor: colors.danger.fill
    },
    {
      pointBorderColor: colors.point.stroke,
      backgroundColor: colors.warning.fill
    },
    {
      pointBorderColor: colors.point.stroke,
      backgroundColor: colors.info.fill
    }
  ];

  constructor(
    private finalResultService: FinalResultService,
    public globaldata: GlobalDataService
  ) { }

  ngOnInit(): void {
    this.projectSubscription = this.globaldata.currentProject$.subscribe(
      project => (this.projectId = project.id)
    );
  }

  ngOnDestroy(): void {
    this.projectSubscription.unsubscribe();
  }

  async ngOnChanges() {
    if (!this.listOfFinalResults || this.listOfFinalResults.length < 1) {
      this.listOfFinalResults = await this.finalResultService.getFinalResult(
        {}
      );
      this.listOfResolutions = [
        {
          color: 5,
          name: 'Passed'
        },
        {
          color: 3,
          name: 'Not Assigned'
        },
        {
          color: 2,
          name: 'Test Issues'
        },
        {
          color: 1,
          name: 'App Issue'
        },
        {
          color: 4,
          name: 'Other'
        }
      ];
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
    this.testRunsStat = this.testRunsStat.sort(
      (a, b) =>
        new Date(a.finish_time).getTime() - new Date(b.finish_time).getTime()
    );
    this.lineChartData = [];
    for (const color of this.orderByColor) {
      const dataArray: any[] = [];
      for (const resultsSet of this.testRunsStat) {
        switch (color) {
          case 1:
            dataArray.push({
              x: resultsSet.finish_time,
              y: resultsSet.app_issue,
              ts: resultsSet
            });
            break;
          case 5:
            dataArray.push({
              x: resultsSet.finish_time,
              y: resultsSet.passed,
              ts: resultsSet
            });
            break;
          case 3:
            dataArray.push({
              x: resultsSet.finish_time,
              y: resultsSet.not_assigned,
              ts: resultsSet
            });
            break;
          case 2:
            dataArray.push({
              x: resultsSet.finish_time,
              y: resultsSet.warning,
              ts: resultsSet
            });
            break;
          case 4:
            dataArray.push({
              x: resultsSet.finish_time,
              y: resultsSet.other,
              ts: resultsSet
            });
            break;
        }
      }
      this.lineChartData.push({
        data: dataArray,
        label: this.listOfResolutions.find(x => x.color === color).name,
        lineTension: 0.1
      });
    }
  }

  fillByResult() {
    this.testRunsStat = this.testRunsStat.filter(x => x.finish_time);
    this.testRunsStat = this.testRunsStat.sort(
      (a, b) =>
        new Date(a.finish_time).getTime() - new Date(b.finish_time).getTime()
    );
    this.lineChartData = [];
    for (const color of this.orderByColor) {
      const dataArray: any[] = [];
      for (const resultsSet of this.testRunsStat) {
        switch (color) {
          case 1:
            dataArray.push({
              x: resultsSet.finish_time,
              y: resultsSet.failed,
              ts: resultsSet
            });
            break;
          case 5:
            dataArray.push({
              x: resultsSet.finish_time,
              y: resultsSet.passed,
              ts: resultsSet
            });
            break;
          case 3:
            dataArray.push({
              x: resultsSet.finish_time,
              y: resultsSet.not_executed,
              ts: resultsSet
            });
            break;
          case 2:
            dataArray.push({
              x: resultsSet.finish_time,
              y: resultsSet.in_progress,
              ts: resultsSet
            });
            break;
          case 4:
            dataArray.push({
              x: resultsSet.finish_time,
              y: resultsSet.pending,
              ts: resultsSet
            });
            break;
        }
      }

      this.lineChartData.push({
        data: dataArray,
        label: this.listOfFinalResults.find(x => x.color === color).name,
        lineTension: 0.1
      });
    }
  }

  chartClicked(e: any) {
    if (e.active[0]) {
      const datasetIndex = e.active[0]._datasetIndex;
      const dataIndex = e.active[0]._index;
      window.open(
        `/project/${this.projectId}/testrun/${this.lineChartData[datasetIndex].data[dataIndex].ts.id}`
      );
    }
  }

  switch() {
    this.switchState = !this.switchState;
    this.fillData();
  }
}
