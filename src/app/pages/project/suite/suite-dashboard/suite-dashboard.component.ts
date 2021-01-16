import {
  Component,
  OnInit,
  ViewChildren,
  QueryList,
  OnDestroy
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BaseChartDirective } from 'ng2-charts';
import {
  faChevronRight,
  faChevronLeft,
  faTimes,
  faSyncAlt
} from '@fortawesome/free-solid-svg-icons';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { TestSuiteService } from 'src/app/services/test-suite/test-suite.service';
import { TestRunService } from 'src/app/services/testrun/testrun.service';
import { TestSuite, SuiteDashboard } from 'src/app/shared/models/test-suite';
import { colors } from 'src/app/shared/colors.service';
import { TestRunStat } from 'src/app/shared/models/testrun-stats';

@Component({
  selector: 'app-suite-dashboard',
  templateUrl: './suite-dashboard.component.html',
  styleUrls: ['./suite-dashboard.component.scss'],
  animations: [
    trigger('slideInOut', [
      state(
        'in',
        style({
          transform: 'translate3d(0, 0, 0)'
        })
      ),
      state(
        'out',
        style({
          transform: 'translate3d(-100%, 0, 0) translate3d(20px, 0, 0)'
        })
      ),
      transition('in => out', animate('400ms ease-in-out')),
      transition('out => in', animate('400ms ease-in-out'))
    ])
  ]
})
export class SuiteDashboardComponent implements OnInit, OnDestroy {
  constructor(
    private testSuiteService: TestSuiteService,
    private testrunService: TestRunService,
    private route: ActivatedRoute
  ) {}

  @ViewChildren(BaseChartDirective) charts: QueryList<BaseChartDirective>;

  detailed: boolean | number = false;
  refreshStatus = true;
  suites: TestSuite[];
  settingsBar = 'out';
  suitesToShow: TestSuite[];
  suite_stats: any[] = [];
  chartColors: any[] = [{}];
  doughnutChartType = 'pie';
  newDashboardName: string;
  dashboards: SuiteDashboard[];
  timer: NodeJS.Timer;
  chartOptions: any = {
    legend: {
      display: true,
      position: 'right',
      align: 'end',
      labels: {
        boxWidth: 10,
        usePointStyle: true
      }
    }
  };
  icons = { faChevronRight, faChevronLeft, faTimes, faSyncAlt };

  ngOnInit() {
    this.generateChartsData(this.detailed);
    this.getDashboards();
    this.executeRefresh();
  }

  async getDashboards() {
    this.dashboards = await this.testSuiteService.getSuiteDashboards(
      this.route.snapshot.params['projectId']
    );
    this.dashboards.unshift({
      name: 'All',
      suites: this.suites,
      detailed: false,
      notDeletable: true
    });
  }

  async generateChartsData(detailed: boolean | number) {
    this.detailed = detailed;
    this.suite_stats = await this.getSuiteStats();
    this.detailed
      ? this.generateDetailedData(this.suite_stats)
      : this.generateData(this.suite_stats);
  }

  async updateChartsData() {
    let new_suite_stats = await this.getSuiteStats();
    new_suite_stats = this.detailed
      ? this.generateDetailedData(new_suite_stats)
      : this.generateData(new_suite_stats);

    const charts = this.charts.toArray();
    this.suite_stats.forEach((suite, i) => {
      const new_suite = new_suite_stats.find(
        new_suite_stat => new_suite_stat.id === suite.id
      );
      const currentChart = charts.find(
        chart => chart.options['id'] === new_suite.id
      );
      if (currentChart) {
        suite.chartData = new_suite.chartData;
        suite.chartLabels = new_suite.chartLabels;
        currentChart.chart.config.data.labels = suite.chartLabels;
      } else {
        if (new_suite.chartData) {
          const index = this.suite_stats.findIndex(
            suiteStat => suiteStat.id === new_suite.id
          );
          this.suite_stats[index] = new_suite;
        }
      }
    });
  }

  generateData(suites) {
    for (const suite of suites) {
      if (suite.stat) {
        suite['chartData'] = [
          {
            data: [
              suite.stat.passed,
              suite.stat.app_issue,
              suite.stat.warning + suite.stat.not_assigned + suite.stat.other,
              0
            ],
            backgroundColor: [
              colors.success.fill,
              colors.danger.fill,
              colors.warning.fill
            ]
          }
        ];
        suite['chartLabels'] = [
          `Passed | ${suite.stat.passed}`,
          `Application Issues | ${suite.stat.app_issue}`,
          `Test Issues | ${suite.stat.warning +
            suite.stat.not_assigned +
            suite.stat.other}`,
          `Total | ${suite.stat.total}`
        ];
        const options = JSON.parse(JSON.stringify(this.chartOptions));
        options.id = suite.id;
        suite['options'] = options;
      }
    }
    return suites;
  }

  generateDetailedData(suites) {
    for (const suite of suites) {
      if (suite.stat) {
        const stat: TestRunStat = suite.stat;
        suite['chartData'] = [
          {
            data: [
              stat.passed,
              0,
              0,
              stat.app_issue,
              stat.warning,
              stat.not_assigned,
              stat.other,
              0
            ],
            backgroundColor: [
              colors.success.fill,
              colors.danger.fill,
              colors.primary.fill,
              colors.danger.fill,
              colors.warning.fill,
              colors.primary.fill,
              colors.info.fill
            ]
          },
          {
            data: [
              stat.passed,
              stat.failed,
              stat.not_executed + stat.pending + stat.in_progress,
              0,
              0,
              0,
              0,
              0
            ],
            backgroundColor: [
              colors.success.fill,
              colors.danger.fill,
              colors.primary.fill,
              colors.danger.fill,
              colors.warning.fill,
              colors.primary.fill,
              colors.info.fill
            ]
          }
        ];
        suite['chartLabels'] = [
          `Passed | ${suite.stat.passed}`,
          `Failed | ${suite.stat.failed}`,
          `Not Executed | ${suite.stat.not_executed}`,
          `Application Issues | ${suite.stat.app_issue}`,
          `Test Issues | ${suite.stat.warning}`,
          `Not Assigned | ${suite.stat.not_assigned}`,
          `Other | ${suite.stat.other}`,
          `Total | ${suite.stat.total}`
        ];
      }
    }
    return suites;
  }

  getDuration(testrunStat: TestRunStat): string {
    return this.testrunService.calculateDuration(testrunStat);
  }

  updateSuites(suitesToShow) {
    this.suitesToShow = suitesToShow;
    this.generateChartsData(this.detailed);
  }

  async getSuiteStats() {
    const suite_stats = [];
    this.suites = await this.testSuiteService.getTestSuite(
      { project_id: this.route.snapshot.params['projectId'] }
    );
    if (!this.suitesToShow) {
      this.suitesToShow = this.suites;
    } else {
      const newSuitesToShow = this.suites.filter(x =>
        this.suitesToShow.find(y => y.id === x.id)
      );
      this.suitesToShow = newSuitesToShow;
    }
    for (const suite of this.suitesToShow) {
      const results = await this.testrunService.getTestsRunStats(
        {
          test_suite_id: suite.id,
          project_id: suite.project_id
        },
        this.suite_stats.length < 1
      );

      if (results.length > 0) {
        const latest = results[0];
        suite['stat'] = latest;
      }

      suite_stats.push(suite);
    }
    return suite_stats;
  }

  async saveDashboard() {
    let suites = TestSuite.getCreateDashboardDtos(this.suitesToShow);
    await this.testSuiteService.createSuiteDashboard({
      name: this.newDashboardName,
      suites: suites,
      detailed: this.detailed === true || this.detailed === 1 ? 1 : 0,
      project_id: this.route.snapshot.params['projectId']
    });
    await this.getDashboards();
    this.newDashboardName = '';
  }

  isDashboardNameValid(): boolean {
    const isAlreadyExists = this.dashboards
      ? this.dashboards.find(x => x.name === this.newDashboardName) !==
        undefined
      : true;
    return (
      this.newDashboardName &&
      !isAlreadyExists &&
      this.newDashboardName.length > 3
    );
  }

  selectDashboard(dashboard: SuiteDashboard) {
    this.suitesToShow = dashboard.suites;
    this.detailed = dashboard.detailed === 1;
    this.generateChartsData(this.detailed);
  }

  async removeDashboard(dashboard: SuiteDashboard) {
    await this.testSuiteService.removeSuiteDashboard(dashboard.id);
    await this.getDashboards();
  }

  toggleSideBar() {
    this.settingsBar = this.settingsBar === 'out' ? 'in' : 'out';
  }

  autoRefresh() {
    this.refreshStatus = !this.refreshStatus;
    this.executeRefresh();
  }

  executeRefresh() {
    this.refreshStatus
      ? (this.timer = setInterval(() => this.updateChartsData(), 5000))
      : clearTimeout(this.timer);
  }

  ngOnDestroy() {
    clearInterval(this.timer);
  }
}
