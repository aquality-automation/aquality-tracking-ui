import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProjectRoutingModule } from './project-routing.module';
import { ProjectListComponent } from './project-list.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { TestRunService } from 'src/app/services/testrun/testrun.service';
import {
  ProjectGuard, CreateProjectGuard, TestRunGuard, MilestoneGuard,
  TestResultGuard, TestGuard, CreateTestGuard, TestSuiteGuard, CreateTestSuiteGuard,
  CreateMilestoneGuard, CreateTestRunGuard, ProjectImportGuard,
  ResultViewCanDeactivate, TestViewCanDeactivate
} from 'src/app/shared/guards/project-guard.service';
import { GuardService } from 'src/app/services/guard.service';
import { IssueService } from 'src/app/services/issue/issue.service';
import { AuditService } from 'src/app/services/audit/audits.service';
import { TestSuiteService } from 'src/app/services/test-suite/test-suite.service';
import { ProjectViewComponent } from './project-view/project-veiw.component';
import { CreateProjectComponent } from './project-create/create-project.component';
import { CustomerService } from 'src/app/services/customer/customer.service';
import { TestRunsResultsTimelineComponent } from 'src/app/elements/charts/testrun-trend-chart/testrun-trend-chart.component';
import { MilestoneService } from 'src/app/services/milestone/milestones.service';
import { EmailSettingsService } from 'src/app/services/email-settings/email-settings.service';
import { TestRunViewComponent } from './testrun/testrun-view/testrun-view.component';
import { ResultGridComponent } from './results/results-grid/results-grid.component';
import { ResultResolutionService } from 'src/app/services/result-resolution/result-resolution.service';
import { TestResultService } from 'src/app/services/test-result/test-result.service';
import { TestService } from 'src/app/services/test/test.service';
import { FinalResultService } from 'src/app/services/final-result/final_results.service';
import { FinalResultChartsComponent } from 'src/app/elements/charts/finalResults/finalResults.charts.component';
import { ResultResolutionsChartsComponent } from 'src/app/elements/charts/resultResolutions/resultResolutions.charts.component';
import { TestRunsComponent } from './testrun/testrun-list/testrun-list.component';
import { PrintTestrunComponent } from './testrun/print-testrun/print-testrun.component';
import { NotifyTeamModalComponent } from './testrun/notify-team-modal/notify-team-modal.component';
import { CreateIssueModalComponent } from './issue/issue-create-modal/issue-create-modal.component';
import { ResultSearcherComponent } from './results/results-searcher/results-searcher.component';
import { ViewMilestoneComponent } from './milestone/view-milestone/view-milestone.component';
import { ListMilestoneComponent } from './milestone/list-milestone/list-milestone.component';
import { CreateMilestoneComponent } from './milestone/create-milestone/create-milestone.component';
import { TestrunCompareComponent } from './testrun/testrun-compare/testrun-compare.component';
import { TestrunMatrixComponent } from './testrun/testrun-matrix/testrun-matrix.component';
import { CreateTestRunComponent } from './testrun/testrun-create/create-testrun.component';
import { TestResultViewComponent } from './results/results-view/testresult-view.component';
import { StepsService } from 'src/app/services/steps/steps.service';
import { TestViewComponent } from './test/test-view/test-view.component';
import { StepsContainerComponent } from './test/steps-container/steps-container.component';
import { MoveTestModalComponent } from './test/move-test-modal/move-test-modal.component';
import { TestDurationComponent } from 'src/app/elements/charts/testDuration/testDuration.component';
import { FinalResultsTimelineComponent } from 'src/app/elements/charts/finalResulsTimeline/finalResult.timeline.chart.component';
import { CreateTestComponent } from './test/test-create/create-test.component';
import { CreateTestSuiteComponent } from './suite/suite-create/create-testsuite.component';
import { TestSuiteComponent } from './suite/suite-list/suite.list.component';
import { TestSuiteViewComponent } from './suite/suite-view/testsuite.view.component';
import { SyncSuiteModalComponent } from './suite/suite-sync-modal/suite-sync-modal.component';
import { SuiteDashboardComponent } from './suite/suite-dashboard/suite-dashboard.component';
import { IssueListComponent } from './issue/issue-list/issue-list.component';
import { IssueViewComponent } from './issue/issue-view/issue-view.component';
import { StepsListComponent } from './steps/steps-list/steps-list.component';
import { ImportComponent } from './import/import.component';
import { ImportService } from 'src/app/services/import/import.service';

@NgModule({
  imports: [
    ProjectRoutingModule,
    CommonModule,
    SharedModule
  ],
  declarations: [
    ProjectListComponent,
    ProjectViewComponent,
    CreateProjectComponent,
    TestRunViewComponent,
    ResultGridComponent,
    TestRunsResultsTimelineComponent,
    FinalResultChartsComponent,
    ResultResolutionsChartsComponent,
    TestRunsComponent,
    PrintTestrunComponent,
    NotifyTeamModalComponent,
    CreateIssueModalComponent,
    ResultSearcherComponent,
    ViewMilestoneComponent,
    ListMilestoneComponent,
    CreateMilestoneComponent,
    TestrunCompareComponent,
    TestrunMatrixComponent,
    CreateTestRunComponent,
    TestResultViewComponent,
    TestViewComponent,
    StepsContainerComponent,
    MoveTestModalComponent,
    TestDurationComponent,
    FinalResultsTimelineComponent,
    CreateTestComponent,
    CreateTestSuiteComponent,
    TestSuiteComponent,
    TestSuiteViewComponent,
    SyncSuiteModalComponent,
    SuiteDashboardComponent,
    IssueListComponent,
    IssueViewComponent,
    StepsListComponent,
    ImportComponent
  ],
  providers: [
    TestRunService,
    IssueService,
    TestSuiteService,
    AuditService,
    ProjectGuard,
    CustomerService,
    CreateProjectGuard,
    GuardService,
    TestRunGuard,
    MilestoneGuard,
    MilestoneService,
    EmailSettingsService,
    ResultResolutionService,
    TestResultService,
    TestService,
    FinalResultService,
    StepsService,
    ResultViewCanDeactivate,
    TestResultGuard,
    TestGuard,
    TestViewCanDeactivate,
    CreateTestGuard,
    TestSuiteGuard,
    CreateTestSuiteGuard,
    CreateMilestoneGuard,
    CreateTestRunGuard,
    ImportService,
    ProjectImportGuard
  ]
})
export class ProjectModule { }
