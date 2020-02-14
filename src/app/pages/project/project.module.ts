import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DatepickerModule } from 'ngx-bootstrap';
import { FileUploadModule } from 'ng2-file-upload';
import {
  ProjectGuard,
  CreateProjectGuard,
  TestRunGuard,
  CreateTestRunGuard,
  CreateMilestoneGuard,
  TestSuiteGuard,
  CreateTestSuiteGuard,
  CreateTestGuard,
  TestGuard,
  TestResultGuard,
  ProjectImportGuard,
  MilestoneGuard
} from '../../shared/guards/project-guard.service';
import { ProjectService } from '../../services/project.service';
import { projectRouting } from './project.routing';
import { UserService } from '../../services/user.services';
import { ProjectComponent } from './project-list/project.component';
import { CreateProjectComponent } from './project-create/create-project.component';
import { ProjectViewComponent } from './project-view/project-veiw.component';
import { TestRunsComponent } from './testrun/testrun-list/testruns.component';
import { TestRunViewComponent } from './testrun/testrun-view/testrun.view.component';
import { CreateMilestoneComponent } from './milestone/create/create-milestone.component';
import { CreateTestRunComponent } from './testrun/testrun-create/create-testrun.component';
import { CreateTestSuiteComponent } from './testsuite/create/create-testsuite.component';
import { CreateTestComponent } from './test/test-create/create-test.component';
import { TestSuiteComponent } from './testsuite/list/testsuite.component';
import { TestSuiteViewComponent } from './testsuite/view/testsuite.view.component';
import { TestViewComponent } from './test/test-view/test.view.component';
import { ResultGridComponent } from './results/results-grid/results.grid.component';
import { TestResultViewComponent } from './results/results-view/testresult.view.component';
import { ImportComponent } from './import/import.component';
import { FinalResultChartsComponent } from '../../elements/charts/finalResults/finalResults.charts.component';
import { ResultResolutionsChartsComponent } from '../../elements/charts/resultResolutions/resultResolutions.charts.component';
import { FinalResultsTimelineComponent } from '../../elements/charts/finalResulsTimeline/finalResult.timeline.chart.component';
import { TestRunsResultsTimelineComponent } from '../../elements/charts/testRunsResultsGraph/testRun.results.chart';
import { TestDurationComponent } from '../../elements/charts/testDuration/testDuration.component';
import { ResultSearcherComponent } from './results/results-searcher/results.searcher.component';
import { ListToCsvService } from '../../services/listToCsv.service';
import { ExecuteRateChartComponent } from '../../elements/charts/projectCharts/executedRate.component';
import { SharedModule } from '../../shared/shared.module';
import { TestrunCompareComponent } from './testrun/testrun-compare/testrun-compare.component';
import { MoveTestModalComponent } from './test/move-test-modal/move-test-modal.component';
import { NotifyTeamModalComponent } from './testrun/notify-team-modal/notify-team-modal.component';
import { TestrunMatrixComponent } from './testrun/testrun-matrix/testrun-matrix.component';
import { PrintTestrunComponent } from './testrun/print-testrun/print-testrun.component';
import { SafePipe } from '../../pipes/safe.pipe';
import { SuiteDashboardComponent } from './suite-dashboard/suite-dashboard.component';
import { StepsListComponent } from './steps/steps-list/steps-list.component';
import { StepsService } from '../../services/steps.service';
import { StepsContainerComponent } from './test/steps-container/steps-container.component';
import { TestViewCanDeactivate } from '../../shared/guards/can-deactivate-guard.service';
import { SyncSuiteModalComponent } from './testsuite/sync-suite-modal/sync-suite-modal.component';
import { ListMilestoneComponent } from './milestone/list-milestone/list-milestone.component';
import { MilestoneService } from '../../services/milestones.service';
import { ViewMilestoneComponent } from './milestone/view-milestone/view-milestone.component';
import { TestRunService } from '../../services/testRun.service';
import { TestService } from '../../services/test.service';
import { FinalResultService } from '../../services/final_results.service';
import { ResultResolutionService } from '../../services/result-resolution.service';
import { TransformationsService } from '../../services/transformations.service';
import { TestSuiteService } from '../../services/testSuite.service';

@NgModule({
  imports: [
    FileUploadModule,
    FormsModule,
    CommonModule,
    projectRouting,
    DatepickerModule.forRoot(),
    SharedModule,
  ],
  declarations: [
    ProjectComponent,
    CreateProjectComponent,
    ProjectViewComponent,
    TestRunsComponent,
    TestRunViewComponent,
    CreateMilestoneComponent,
    CreateTestRunComponent,
    CreateTestSuiteComponent,
    CreateTestComponent,
    TestSuiteComponent,
    TestSuiteViewComponent,
    TestViewComponent,
    ResultGridComponent,
    TestResultViewComponent,
    FinalResultChartsComponent,
    ResultResolutionsChartsComponent,
    FinalResultsTimelineComponent,
    TestRunsResultsTimelineComponent,
    ListMilestoneComponent,
    ViewMilestoneComponent,
    ImportComponent,
    TestDurationComponent,
    ResultSearcherComponent,
    ExecuteRateChartComponent,
    TestrunCompareComponent,
    MoveTestModalComponent,
    NotifyTeamModalComponent,
    TestrunMatrixComponent,
    PrintTestrunComponent,
    SuiteDashboardComponent,
    StepsListComponent,
    StepsContainerComponent,
    SafePipe,
    SyncSuiteModalComponent
  ],
  providers: [
    ProjectService,
    StepsService,
    DatePipe,
    UserService,
    ListToCsvService,
    MilestoneService,
    TestRunService,
    TestService,
    FinalResultService,
    ResultResolutionService,
    TransformationsService,
    TestSuiteService,
    ProjectGuard, CreateProjectGuard, TestRunGuard, CreateTestRunGuard,
    CreateMilestoneGuard, TestSuiteGuard, CreateTestSuiteGuard,
    CreateTestGuard, TestGuard, TestResultGuard, ProjectImportGuard, TestViewCanDeactivate,
    MilestoneGuard]
})

export class ProjectModule { }
