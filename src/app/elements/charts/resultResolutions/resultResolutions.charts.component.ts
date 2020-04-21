import {
  Component,
  Input,
  OnChanges,
  ViewChild,
  EventEmitter,
  Output,
  OnInit,
  OnDestroy
} from '@angular/core';
import { SimpleRequester } from '../../../services/simple-requester';
import { TestResultService } from '../../../services/test-result.service';
import { TestResult } from '../../../shared/models/test-result';
import { ResultResolution } from '../../../shared/models/result_resolution';
import { ResultResolutionService } from '../../../services/result-resolution.service';
import { BaseChartDirective } from 'ng2-charts';
import { colors } from '../../../shared/colors.service';
import { GlobalDataService } from '../../../services/globaldata.service';
import { Subscription } from 'rxjs/Subscription';

@Component({
  selector: 'result-resolution-chart',
  templateUrl: './resultResolutions.charts.component.html',
  providers: [SimpleRequester, ResultResolutionService, TestResultService]
})
export class ResultResolutionsChartsComponent implements OnChanges, OnInit, OnDestroy {
  @ViewChild(BaseChartDirective) chart: BaseChartDirective;
  @Input() testResults: TestResult[];
  @Output() clickedResult = new EventEmitter<ResultResolution>();
  projectSubscription: Subscription;
  includeNotExecuted = false;
  projectId: number;
  shownTestResults: TestResult[];
  listOfResultResolutions: ResultResolution[];
  doughnutChartLabels: string[] = [];
  doughnutChartData: number[] = [];
  chartColors: any[] = [];
  doughnutChartType = 'doughnut';
  chartOptions: any = {
    legend: {
      display: true,
      position: 'left',
      labels: {
        boxWidth: 20
      }
    }
  };

  constructor(
    private resultResolutionService: ResultResolutionService,
    private globalDataService: GlobalDataService
  ) { }

  ngOnInit(): void {
    this.projectSubscription = this.globalDataService.currentProject$.subscribe(project => {
      this.projectId = project.id;
    });
  }

  ngOnDestroy(): void {
    if (this.projectSubscription) {
      this.projectSubscription.unsubscribe();
    }
  }

  public ngOnChanges() {
    this.resultResolutionService.getResolution(this.projectId).subscribe(
      result => {
        this.listOfResultResolutions = result;
        this.getData();
      },
      error => this.resultResolutionService.handleError(error)
    );
  }

  getData() {
    if (this.includeNotExecuted) {
      this.shownTestResults = this.testResults.filter(
        x => x.debug === 0 && x.final_result.id !== 2
      );
    } else {
      this.shownTestResults = this.testResults.filter(
        x => x.debug === 0 && x.final_result.id !== 2 && x.final_result.id !== 3
      );
    }
    this.fillChartData();
    this.fillChartColors();
    this.fillChartLabels();
    if (this.chart && this.chart.chart && this.chart.chart.config) {
      this.chart.chart.config.data.labels = this.doughnutChartLabels;
      this.chart.chart.update();
    }
  }

  toggleNotExecuted() {
    this.includeNotExecuted = !this.includeNotExecuted;
    this.getData();
  }

  fillChartLabels() {
    this.doughnutChartLabels = [];
    for (const resultResolution of this.listOfResultResolutions) {
      this.doughnutChartLabels.push(
        resultResolution.name +
        this.calculatePrecentageAndCount(resultResolution.name)
      );
    }
  }

  fillChartData() {
    this.doughnutChartData = [];
    for (const resultResolution of this.listOfResultResolutions) {
      this.doughnutChartData.push(
        this.shownTestResults.filter(
          x => resultResolution.id === 1
            ? !x.issue
            : x.issue ? x.issue.resolution.id === resultResolution.id : false
        ).length
      );
    }
  }

  calculatePrecentageAndCount(resultResolutionName: String): String {
    const num = this.shownTestResults.filter(
      x => resultResolutionName === 'Not Assigned'
        ? !x.issue
        : x.issue ? x.issue.resolution.name === resultResolutionName : false
    ).length;
    const percentage = (num / this.shownTestResults.length) * 100;
    return ` | ${percentage.toFixed(1)}% | ${num}`;
  }

  fillChartColors() {
    const backgroundColors: any[] = [];
    for (const resultResolution of this.listOfResultResolutions) {
      switch (resultResolution.color) {
        case 1:
          backgroundColors.push(colors.danger.fill);
          break;
        case 2:
          backgroundColors.push(colors.warning.fill);
          break;
        case 3:
          backgroundColors.push(colors.primary.fill);
          break;
        case 4:
          backgroundColors.push(colors.info.fill);
          break;
        case 5:
          backgroundColors.push(colors.success.fill);
          break;
        default:
          backgroundColors.push(colors.point.stroke);
      }
    }
    this.chartColors = [{ backgroundColor: backgroundColors }];
  }

  chartClicked(event: any): void {
    if (event.active[0]) {
      const dataIndex = event.active[0]._index;
      const label: string = this.chart.labels[dataIndex].toString();
      const clickedResolution = this.listOfResultResolutions.find(x =>
        label.startsWith(x.name)
      );
      this.clickedResult.emit(clickedResolution);
    }
  }
}
