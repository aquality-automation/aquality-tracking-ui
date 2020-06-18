import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ProjectListComponent } from './project-list.component';
import { AuthGuard } from 'src/app/shared/guards/login-guard.service';
import {
  ProjectGuard, CreateProjectGuard, TestRunGuard, MilestoneGuard, TestResultGuard,
  TestGuard, CreateTestGuard, CreateTestSuiteGuard, TestSuiteGuard,
  CreateMilestoneGuard, CreateTestRunGuard,
  ProjectImportGuard, ResultViewCanDeactivate, TestViewCanDeactivate
} from 'src/app/shared/guards/project-guard.service';
import { ProjectViewComponent } from './project-view/project-veiw.component';
import { CreateProjectComponent } from './project-create/create-project.component';
import { TestRunsComponent } from './testrun/testrun-list/testrun-list.component';
import { TestRunViewComponent } from './testrun/testrun-view/testrun-view.component';
import { ListMilestoneComponent } from './milestone/list-milestone/list-milestone.component';
import { ViewMilestoneComponent } from './milestone/view-milestone/view-milestone.component';
import { TestrunCompareComponent } from './testrun/testrun-compare/testrun-compare.component';
import { TestrunMatrixComponent } from './testrun/testrun-matrix/testrun-matrix.component';
import { TestResultViewComponent } from './results/results-view/testresult-view.component';
import { TestViewComponent } from './test/test-view/test-view.component';
import { CreateTestComponent } from './test/test-create/create-test.component';
import { CreateTestSuiteComponent } from './suite/suite-create/create-testsuite.component';
import { TestSuiteComponent } from './suite/suite-list/suite.list.component';
import { SuiteDashboardComponent } from './suite/suite-dashboard/suite-dashboard.component';
import { TestSuiteViewComponent } from './suite/suite-view/testsuite.view.component';
import { IssueListComponent } from './issue/issue-list/issue-list.component';
import { IssueViewComponent } from './issue/issue-view/issue-view.component';
import { StepsListComponent } from './steps/steps-list/steps-list.component';
import { CreateMilestoneComponent } from './milestone/create-milestone/create-milestone.component';
import { CreateTestRunComponent } from './testrun/testrun-create/create-testrun.component';
import { ImportComponent } from './import/import.component';


const routes: Routes = [
  {
    path: 'project', canActivate: [AuthGuard],
    children: [
      { path: '', component: ProjectListComponent },
      { path: 'create', component: CreateProjectComponent, canActivate: [CreateProjectGuard] },
      {
        path: ':projectId', canActivate: [ProjectGuard],
        children: [
          { path: '', component: ProjectViewComponent },
          {
            path: 'testrun', children: [
              { path: '', component: TestRunsComponent, canActivate: [TestRunGuard] },
              { path: 'matrix', component: TestrunMatrixComponent, canActivate: [TestRunGuard] },
              { path: 'compare', component: TestrunCompareComponent, canActivate: [TestRunGuard] },
              { path: ':testrunId', component: TestRunViewComponent, canActivate: [TestRunGuard] }
            ]
          },
          {
            path: 'milestone', children: [
              { path: '', component: ListMilestoneComponent, canActivate: [MilestoneGuard] },
              { path: ':milestoneId', component: ViewMilestoneComponent, canActivate: [MilestoneGuard] }
            ]
          },
          {
            path: 'testsuite', children: [
              { path: '', component: TestSuiteComponent, canActivate: [TestSuiteGuard] },
              { path: 'dashboard', component: SuiteDashboardComponent, canActivate: [TestSuiteGuard] },
            ]
          },
          { path: 'tests', component: TestSuiteViewComponent, canActivate: [TestSuiteGuard] },
          { path: 'steps', component: StepsListComponent, canActivate: [TestSuiteGuard] },
          { path: 'issues', component: IssueListComponent, canActivate: [TestSuiteGuard] },
          { path: 'import', component: ImportComponent, canActivate: [ProjectImportGuard] },
          { path: 'issue/:issueId', component: IssueViewComponent, canActivate: [TestGuard] },
          { path: 'test/:testId', component: TestViewComponent, canActivate: [TestGuard], canDeactivate: [TestViewCanDeactivate] },
          {
            path: 'testresult/:testresultId', component: TestResultViewComponent,
            canActivate: [TestResultGuard], canDeactivate: [ResultViewCanDeactivate]
          },
          { path: 'create/milestone', component: CreateMilestoneComponent, canActivate: [CreateMilestoneGuard] },
          { path: 'create/testrun', component: CreateTestRunComponent, canActivate: [CreateTestRunGuard] },
          { path: 'create/testsuite', component: CreateTestSuiteComponent, canActivate: [CreateTestSuiteGuard] },
          { path: 'create/test', component: CreateTestComponent, canActivate: [CreateTestGuard] }
        ]
      }
    ]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProjectRoutingModule { }
