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
  ProjectImportGuard
} from '../../shared/guards/auth-guard.service';
import { ProjectService } from '../../services/project.service';
import { projectRouting } from './project.routing';
import { UserService } from '../../services/user.services';
import { ProjectComponent } from './project.component';
import { CreateProjectComponent } from './create-project.component';
import { ProjectViewComponent } from './project-veiw.component';
import { TestRunsComponent } from './testrun/testruns.component';
import { TestRunViewComponent } from './testrun/testrun.view.component';
import { CreateMilestoneComponent } from './milestone/create-milestone.component';
import { CreateTestRunComponent } from './testrun/create-testrun.component';
import { CreateTestSuiteComponent } from './testsuite/create-testsuite.component';
import { CreateTestComponent } from './test/create-test.component';
import { TestSuiteComponent } from './testsuite/testsuite.component';
import { TestSuiteViewComponent } from './testsuite/testsuite-view.component';
import { TestViewComponent } from './test/test.view.component';
import { ResultGridComponent } from './testresult/results.grid.component';
import { TestResultViewComponent } from './testresult/testresult.view.component';
import { ImportComponent } from './import/import.component';
import { FinalResultChartsComponent } from '../../elements/charts/finalResults/finalResults.charts.component';
import { ResultResolutionsChartsComponent } from '../../elements/charts/resultResolutions/resultResolutions.charts.component';
import { FinalResultsTimelineComponent } from '../../elements/charts/finalResulsTimeline/finalResult.timeline.chart.component';
import { TestRunsResultsTimelineComponent } from '../../elements/charts/testRunsResultsGraph/testRun.results.chart';
import { TestDurationComponent } from '../../elements/charts/testDuration/testDuration.component';
import { ResultSearcherComponent } from './testresult/results.searcher.component';
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
    SafePipe
  ],
  providers: [ProjectService,
    DatePipe,
    UserService,
    ListToCsvService,
    ProjectGuard, CreateProjectGuard, TestRunGuard, CreateTestRunGuard,
    CreateMilestoneGuard, TestSuiteGuard, CreateTestSuiteGuard, CreateTestGuard, TestGuard, TestResultGuard, ProjectImportGuard],
})

export class ProjectModule { }
