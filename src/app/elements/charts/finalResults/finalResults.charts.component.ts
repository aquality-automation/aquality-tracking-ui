import { Component, Input, ViewChild, OnInit } from '@angular/core';
import { SimpleRequester } from '../../../services/simple-requester';
import { TestResultService } from '../../../services/test-result.service';
import { TestResult } from '../../../shared/models/test-result';
import { FinalResult } from '../../../shared/models/final-result';
import { FinalResultService } from '../../../services/final_results.service';
import { BaseChartDirective } from 'ng2-charts';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'final-result-chart',
  templateUrl: './finalResults.charts.component.html',
  providers: [
    SimpleRequester,
    TestResultService,
    FinalResultService
  ]
})
export class FinalResultChartsComponent implements OnInit{
  @ViewChild(BaseChartDirective) chart: BaseChartDirective;
  @Input() testResults: TestResult[];
  public lineChartDataTest: Array<any>;
  doughnutChartType = 'doughnut';
  listOfFinalResults: FinalResult[];
  doughnutChartLabels: string[] = [];
  doughnutChartData: number[] = [];
  chartColors: any[] = [];
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
    private finalResultService: FinalResultService,
    private route: ActivatedRoute,
    private router: Router
  ) {

  }

  async ngOnInit(){
    this.listOfFinalResults = await this.finalResultService.getFinalResult({});
    this.testResults = this.testResults.filter(x => x.debug === 0);
    this.fillChartData();
    this.fillChartLabels();
    this.fillChartColors();
  }

  fillChartLabels() {
    this.doughnutChartLabels = [];
    for (const finalResult of this.listOfFinalResults) {
      this.doughnutChartLabels.push(finalResult.name + ' | ' + this.calculatePrecentageAndCount(finalResult.name));
    }
  }

  fillChartData() {
    this.doughnutChartData = [];
    for (const finalResult of this.listOfFinalResults) {
      this.doughnutChartData.push(this.testResults.filter(x => x.final_result.name === finalResult.name).length);
    }
  }

  calculatePrecentageAndCount(finalResult: String): String {
    const num = this.testResults.filter(x => x.final_result.name === finalResult).length;
    const percentage = num / this.testResults.length * 100;
    return percentage.toFixed(1) + '% | ' + num;
  }

  fillChartColors() {
    const colors: any[] = [];
    for (const finalResult of this.listOfFinalResults) {
      switch (finalResult.name) {
        case 'Passed':
          colors.push('#009900');
          break;
        case 'Failed':
          colors.push('#CC0000');
          break;
        case 'In Progress':
          colors.push('#FF6600');
          break;
        case 'Not Executed':
          colors.push('#3366FF');
          break;
        case 'Pending':
          colors.push('#5bc0de');
          break;
      }
    }
    this.chartColors = [{ backgroundColor: colors }];
  }

  public chartClicked(e: any): void {
    const dataIndex = e.active[0]._index;
    const label: string = this.chart.labels[dataIndex].toString();
    const clickedResult = this.listOfFinalResults.find(x => label.startsWith(x.name));
    this.router.navigate(
      [`/project/${this.route.snapshot.params['projectId']}/testrun/${this.route.snapshot.params['testRunId']}`],
      { queryParams: { f_final_result_opt: clickedResult.id } });
  }
}
