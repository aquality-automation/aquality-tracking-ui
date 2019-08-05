import { Component, Input} from '@angular/core';
import { TestSuiteService } from '../../../services/testSuite.service';
import { ActivatedRoute } from '@angular/router';
import { TestSuite } from '../../../shared/models/testSuite';
import { TestRunStat } from '../../../shared/models/testrunStats';
import { BaseChart } from '../BaseChart';

@Component({
  selector: 'executed-rate-chart',
  templateUrl: './executedRate.component.html',
})
export class ExecuteRateChartComponent extends BaseChart {
  suitesList: TestSuite[] = [];
  @Input() allTestRunStats: TestRunStat[];
  testRunStatsBySuite: { suite: TestSuite, stats: TestRunStat[] }[] = [];
  chartColors: any[] = [{ backgroundColor: [this.success90, this.success40] }];
  chartColorsGrey: any[] = [{ backgroundColor: [this.grey, this.grey] }];
  pieType = 'pie';
  barType = 'bar';
  barChartType = 'bar';
  barChartLegend = false;

  exRate: number;
  exRateData: number[];
  exRatechartOptions: any;

  successRate: number;
  successRateData: number[];
  successRatechartOptions: any;
  successRatechartColors: any[];

  AutomationQualityColors: any[];
  AutomationQuality: number;
  AutomationQualityData: any[];
  AutomationQualityOptions: any;

  AverageAutomationQualityColors: any[];
  AverageAutomationQuality: number;
  AverageAutomationQualityData: any[];
  AverageAutomationQualityOptions: any;

  constructor(
    private testSuiteService: TestSuiteService,
    private route: ActivatedRoute,
  ) {
    super();
    this.testSuiteService.getTestSuite({ project_id: this.route.snapshot.params['projectId'] }).then(res => {
      this.suitesList = res;
      this.getSuitesInfo();
    });
  }

  getSuitesInfo() {
    let i = 0;
      for (const suite of this.suitesList) {
        const teStats: TestRunStat[] = this.allTestRunStats.filter(stat => stat.test_suite_id === suite.id);
        this.testRunStatsBySuite.push({ suite: suite, stats: teStats });
        if (i === this.suitesList.length - 1) {
          this.calculateExecutionRate();
          this.calculateSuccessRate();
          this.calculateAutomationQuality();
          this.calculateAverageAutomationQuality();
        }
        i++;
      }
  }

  calculateExecutionRate() {
    let ttlPassed = 0;
    let ttlAppIssue = 0;
    let ttl = 0;

    for (const suiteStat of this.testRunStatsBySuite) {
      if (suiteStat.stats[0]) {
        ttlPassed += suiteStat.stats[0].passed;
        ttlAppIssue += suiteStat.stats[0].app_issue;
        ttl += suiteStat.stats[0].total;
      }
    }
    this.exRate = (ttlPassed + ttlAppIssue) * 100 / ttl;
    this.exRateData = [this.exRate, 100 - this.exRate];
    this.successRatechartColors = this.exRate !== 0 ? this.chartColors : this.chartColorsGrey;
    this.exRatechartOptions = {
      title: {
        display: true,
        position: 'bottom',
        text: `Test Execution Rate | ${this.exRate.toFixed(1)}%`
      },
      responsive: true,
      legend: {
        display: false
      },
      tooltips: {
        enabled: false
      }
    };
  }

  calculateSuccessRate() {
    let ttlPassed = 0;
    let ttlAppIssue = 0;

    for (const suiteStat of this.testRunStatsBySuite) {
      if (suiteStat.stats[0]) {
        ttlPassed += suiteStat.stats[0].passed;
        ttlAppIssue += suiteStat.stats[0].app_issue;
      }
    }

    this.successRate = ttlPassed + ttlAppIssue > 0 ? ttlPassed * 100 / (ttlPassed + ttlAppIssue) : 0;
    this.successRateData = [this.successRate, 100 - this.successRate];
    this.successRatechartOptions = {
      title: {
        display: true,
        position: 'bottom',
        text: `Test Execution Success Rate | ${this.successRate !== 0 ? this.successRate.toFixed(1) + '%' : 'No data to calculate'}`
      },
      responsive: true,
      legend: {
        display: false
      },
      tooltips: {
        enabled: false
      }
    };
  }

  calculateAutomationQuality() {
    let ttl = 0;
    let ttlNA = 0;
    let ttltestIssue = 0;
    let ttlOther = 0;

    for (const suiteStat of this.testRunStatsBySuite) {
      if (suiteStat.stats[0]) {
        ttlNA += suiteStat.stats[0].not_assigned;
        ttltestIssue += suiteStat.stats[0].warning;
        ttlOther += suiteStat.stats[0].other;
        ttl += suiteStat.stats[0].total;
      }
    }

    this.AutomationQuality = ttl > 0 ? (1 - ((ttlNA * 1 + ttltestIssue * 0.75 + ttlOther * 0.5) / (ttl))) * 100 : 0;
    if (this.AutomationQuality < 0) {
      this.AutomationQuality = 0;
    }
    this.AutomationQualityColors = [{ backgroundColor: this.calculateBarColor(this.AutomationQuality) }];
    this.AutomationQualityData = [
      {
        data: [this.AutomationQuality],
        label: `Current Quality | ${this.AutomationQuality.toFixed(2)}`,
        borderColor: '#9b9b9b',
        borderWidth: 0.5
      },
      { data: [100 - this.AutomationQuality], label: `0`, borderColor: '#9b9b9b', borderWidth: 0.5 }
    ];
    this.AutomationQualityOptions = {
      title: {
        display: true,
        position: 'bottom',
        text: `Automation Quality | ${this.AutomationQuality.toFixed(2)}`
      },
      responsive: true,
      scales: {
        xAxes: [{
          barPercentage: 0.5,
          display: false,
          stacked: true,
        }],
        yAxes: [{
          display: false,
          ticks: {
            min: 0,
            max: 100
          },
          stacked: true
        }]
      },
      tooltips: {
        enabled: false
      }
    };
  }

  calculateAverageAutomationQuality() {
    let ttlNA = 0;
    let ttltestIssue = 0;
    let ttlOther = 0;
    let ttl = 0;

    for (const suiteStat of this.testRunStatsBySuite) {
      for (const stat of suiteStat.stats) {
        if (Math.floor(new Date().getTime() - new Date(stat.finish_time).getTime()) / (1000 * 60 * 60 * 24) < 90) {
          ttlNA += stat.not_assigned;
          ttltestIssue += stat.warning;
          ttlOther += stat.other;
          ttl += stat.total;
        }
      }
    }
    this.AverageAutomationQuality = ttl > 0 ? (1 - ((ttlNA * 1 + ttltestIssue * 0.75 + ttlOther * 0.5) / (ttl))) * 100 : 0;
    this.AverageAutomationQualityColors = [{ backgroundColor: this.calculateBarColor(this.AverageAutomationQuality) }];
    this.AverageAutomationQualityData = [
      {
        data: [this.AverageAutomationQuality],
        label: `Average Quality | ${this.AverageAutomationQuality.toFixed(2)}`,
        borderColor: '#9b9b9b',
        borderWidth: 0.5
      },
      { data: [100 - this.AverageAutomationQuality], label: `0`, borderColor: '#9b9b9b', borderWidth: 0.5 }
    ];
    this.AverageAutomationQualityOptions = {
      title: {
        display: true,
        position: 'bottom',
        text: `Average Automation Quality | ${this.AverageAutomationQuality.toFixed(2)}`
      },
      responsive: true,
      scales: {
        xAxes: [{
          barPercentage: 0.5,
          display: false,
          stacked: true,
        }],
        yAxes: [{
          display: false,
          ticks: {
            min: 0,
            max: 100
          },
          stacked: true
        }]
      },
      tooltips: {
        enabled: false
      }
    };
  }


  calculateBarColor(value: number): string[] {
    if (value < 50) {
      return [this.success40];
    } else if (value < 60) {
      return [this.success50];
    } else if (value < 70) {
      return [this.success60];
    } else if (value < 80) {
      return [this.success70];
    } else if (value < 90) {
      return [this.success80];
    } else {
      return [this.success90];
    }
  }
}
