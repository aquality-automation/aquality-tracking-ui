import { Routes, RouterModule } from '@angular/router';
import { ProjectComponent } from './project-list/project.component';
import { CreateProjectComponent } from './project-create/create-project.component';
import { ProjectViewComponent } from './project-view/project-veiw.component';
import { TestRunsComponent } from './testrun/testrun-list/testruns.component';
import { TestRunViewComponent } from './testrun/testrun-view/testrun.view.component';
import { CreateMilestoneComponent } from './milestone/create/create-milestone.component';
import { CreateTestRunComponent } from './testrun/testrun-create/create-testrun.component';
import { CreateTestSuiteComponent } from './testsuite/create/create-testsuite.component';
import { CreateTestComponent } from './test/test-create/create-test.component';
import { TestSuiteComponent } from './testsuite/list/suite.list.component';
import { TestSuiteViewComponent } from './testsuite/view/testsuite.view.component';
import { TestViewComponent } from './test/test-view/test.view.component';
import { ImportComponent } from './import/import.component';
import { TestResultViewComponent } from './results/results-view/testresult.view.component';
import {
  CreateProjectGuard,
  ProjectGuard,
  TestRunGuard,
  TestSuiteGuard,
  ProjectImportGuard,
  TestGuard,
  TestResultGuard,
  CreateMilestoneGuard,
  CreateTestRunGuard,
  CreateTestSuiteGuard,
  CreateTestGuard,
  MilestoneGuard
} from '../../shared/guards/project-guard.service';
import { TestrunCompareComponent } from './testrun/testrun-compare/testrun-compare.component';
import { TestrunMatrixComponent } from './testrun/testrun-matrix/testrun-matrix.component';
import { SuiteDashboardComponent } from './suite-dashboard/suite-dashboard.component';
import { ResultViewCanDeactivate, TestViewCanDeactivate } from '../../shared/guards/can-deactivate-guard.service';
import { StepsListComponent } from './steps/steps-list/steps-list.component';
import { ListMilestoneComponent } from './milestone/list-milestone/list-milestone.component';
import { ViewMilestoneComponent } from './milestone/view-milestone/view-milestone.component';
import { AuthGuard } from '../../shared/guards/login-guard.service';
import { IssueListComponent } from './issue/issue-list/issue-list.component';
import { IssueViewComponent } from './issue/issue-view/issue-view.component';


const projectRoutes: Routes = [
  {
    path: 'project', canActivate: [AuthGuard],
    children: [
      { path: '', component: ProjectComponent },
      { path: 'create-project', component: CreateProjectComponent, canActivate: [CreateProjectGuard] },
      {
        path: ':projectId', canActivate: [ProjectGuard],
        children: [
          { path: '', component: ProjectViewComponent },
          {
            path: 'testrun', children: [
              { path: '', component: TestRunsComponent, canActivate: [TestRunGuard] },
              { path: 'matrix', component: TestrunMatrixComponent, canActivate: [TestRunGuard] },
              { path: 'compare', component: TestrunCompareComponent, canActivate: [TestRunGuard] },
              { path: ':testRunId', component: TestRunViewComponent, canActivate: [TestRunGuard] }
            ]
          },
          { path: 'milestone', children: [
            { path: '', component: ListMilestoneComponent, canActivate: [MilestoneGuard] },
            { path: ':milestoneId', component: ViewMilestoneComponent, canActivate: [MilestoneGuard] }
          ]},
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
          { path: 'testresult/:testresultId', component: TestResultViewComponent,
            canActivate: [TestResultGuard], canDeactivate: [ResultViewCanDeactivate] },
          { path: 'create/milestone', component: CreateMilestoneComponent, canActivate: [CreateMilestoneGuard] },
          { path: 'create/testrun', component: CreateTestRunComponent, canActivate: [CreateTestRunGuard] },
          { path: 'create/testsuite', component: CreateTestSuiteComponent, canActivate: [CreateTestSuiteGuard] },
          { path: 'create/test', component: CreateTestComponent, canActivate: [CreateTestGuard] }
        ]
      }
    ]
  }
];


export const projectRouting = RouterModule.forChild(projectRoutes);
