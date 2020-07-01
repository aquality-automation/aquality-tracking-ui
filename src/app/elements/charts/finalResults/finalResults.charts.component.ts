import {
  Component,
  Input,
  ViewChild,
  OnInit,
  OnChanges,
  Output,
  EventEmitter
} from '@angular/core';
import { TestResult } from '../../../shared/models/test-result';
import { FinalResult } from '../../../shared/models/final-result';
import { BaseChartDirective } from 'ng2-charts';
import { colors } from '../../../shared/colors.service';
import { FinalResultService } from 'src/app/services/final-result/final_results.service';

@Component({
  selector: 'final-result-chart',
  templateUrl: './finalResults.charts.component.html',
})
export class FinalResultChartsComponent implements OnInit, OnChanges {
  @ViewChild(BaseChartDirective) chart: BaseChartDirective;
  @Input() testResults: TestResult[];
  @Output() clickedResult = new EventEmitter<FinalResult>();
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

  constructor(private finalResultService: FinalResultService) {}

  async ngOnInit() {
    this.listOfFinalResults = await this.finalResultService.getFinalResult({});
    this.testResults = this.testResults.filter(x => x.debug === 0 || x.debug === undefined);
    this.fillChartData();
    this.fillChartLabels();
    this.fillChartColors();
  }

  ngOnChanges() {
    if (this.listOfFinalResults) {
      this.getData();
    }
  }

  getData() {
    this.fillChartData();
    this.fillChartColors();
    this.fillChartLabels();
    if (this.chart && this.chart.chart && this.chart.chart.config) {
      this.chart.chart.config.data.labels = this.doughnutChartLabels;
      this.chart.chart.update();
    }
  }

  fillChartLabels() {
    this.doughnutChartLabels = [];
    for (const finalResult of this.listOfFinalResults) {
      this.doughnutChartLabels.push(
        finalResult.name +
          ' | ' +
          this.calculatePrecentageAndCount(finalResult.name)
      );
    }
  }

  fillChartData() {
    this.doughnutChartData = [];
    for (const finalResult of this.listOfFinalResults) {
      this.doughnutChartData.push(
        this.testResults.filter(x => x.final_result.name === finalResult.name).length
      );
    }
  }

  calculatePrecentageAndCount(finalResult: String): String {
    const num = this.testResults.filter(
      x => x.final_result.name === finalResult
    ).length;
    const percentage = (num / this.testResults.length) * 100;
    return percentage.toFixed(1) + '% | ' + num;
  }

  fillChartColors() {
    const backgroundColors: any[] = [];
    for (const finalResult of this.listOfFinalResults) {
      switch (finalResult.name) {
        case 'Passed':
          backgroundColors.push(colors.success.fill);
          break;
        case 'Failed':
          backgroundColors.push(colors.danger.fill);
          break;
        case 'In Progress':
          backgroundColors.push(colors.warning.fill);
          break;
        case 'Not Executed':
          backgroundColors.push(colors.primary.fill);
          break;
        case 'Pending':
          backgroundColors.push(colors.info.fill);
          break;
      }
    }
    this.chartColors = [{ backgroundColor: backgroundColors }];
  }

  public chartClicked(event: any): void {
    if (event.active[0]) {
      const dataIndex = event.active[0]._index;
      const label: string = this.chart.labels[dataIndex].toString();
      const clickedResult = this.listOfFinalResults.find(x =>
        label.startsWith(x.name)
      );
      this.clickedResult.emit(clickedResult);
    }
  }
}
