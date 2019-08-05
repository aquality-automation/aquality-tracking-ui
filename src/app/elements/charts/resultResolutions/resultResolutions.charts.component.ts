import { Component, Input, OnChanges, ViewChild} from '@angular/core';
import { SimpleRequester } from '../../../services/simple-requester';
import { TestResultService } from '../../../services/test-result.service';
import { TestResult } from '../../../shared/models/test-result';
import { ResultResolution } from '../../../shared/models/result_resolution';
import { ResultResolutionService } from '../../../services/result-resolution.service';
import { BaseChartDirective } from 'ng2-charts';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'result-resolution-chart',
  templateUrl: './resultResolutions.charts.component.html',
  providers: [
    SimpleRequester,
    ResultResolutionService,
    TestResultService
  ]
})
export class ResultResolutionsChartsComponent implements OnChanges {
  @ViewChild(BaseChartDirective) chart: BaseChartDirective;
  @Input() testResults: TestResult[];
  includeNotExecuted = false;
  shownTestResults: TestResult[];
  listOfResultResolutions: ResultResolution[];
  doughnutChartLabels: string[] = [];
  doughnutChartData: number[] = [];
  chartColors: any[]= [];
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
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnChanges() {
    this.resultResolutionService.getResolution().subscribe(result => {
      this.listOfResultResolutions = result;
      this.getData();
    }, error => console.log(error));
  }

  getData() {
    if (this.includeNotExecuted) {
      this.shownTestResults = this.testResults.filter(x => x.debug === 0 && (x.final_result.id !== 2));
    } else {
      this.shownTestResults = this.testResults.filter(x => x.debug === 0 && x.final_result.id !== 2 && x.final_result.id !== 3);
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
      this.doughnutChartLabels.push(resultResolution.name + this.calculatePrecentageAndCount(resultResolution.name));
    }
  }

  fillChartData() {
    this.doughnutChartData = [];
    for (const resultResolution of this.listOfResultResolutions) {
      this.doughnutChartData.push(this.shownTestResults.filter(x => x.test_resolution.name === resultResolution.name).length);
    }
  }

  calculatePrecentageAndCount(resultResolution: String): String {
    const num = this.shownTestResults.filter(x => x.test_resolution.name === resultResolution).length;
    const percentage = num / this.shownTestResults.length * 100;
    return ` | ${percentage.toFixed(1)}% | ${num}`;
  }

  fillChartColors() {
    const colors: any[] = [];
    for (const resultResolution of this.listOfResultResolutions) {
      switch (resultResolution.color) {
        case 1:
          colors.push('#CC0000'); // danger
          break;
        case 2:
          colors.push('#FF6600'); // warning
          break;
        case 3:
          colors.push('#3366FF'); // primary
          break;
        case 4:
          colors.push('#5bc0de'); // info
          break;
        case 5:
          colors.push('#5cb85c'); // success
          break;
        default:
          colors.push('#e5e9ec'); // white
      }
    }
    this.chartColors = [{ backgroundColor: colors }];
  }

  chartClicked(e: any): void {
    const dataIndex = e.active[0]._index;
    const label: string = this.chart.labels[dataIndex].toString();
    const clickedResolution = this.listOfResultResolutions.find(x => label.startsWith(x.name));
    this.router.navigate(
      [`/project/${this.route.snapshot.params['projectId']}/testrun/${this.route.snapshot.params['testRunId']}`],
       { queryParams: { f_test_resolution_opt: clickedResolution.id} });
  }
}
