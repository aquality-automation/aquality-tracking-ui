import { Routes, RouterModule } from '@angular/router';
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
import { ImportComponent } from './import/import.component';
import { TestResultViewComponent } from './testresult/testresult.view.component';
import {
  AuthGuard,
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
  CreateTestGuard
} from '../../shared/guards/auth-guard.service';
import { TestrunCompareComponent } from './testrun/testrun-compare/testrun-compare.component';
import { TestrunMatrixComponent } from './testrun/testrun-matrix/testrun-matrix.component';
import { SuiteDashboardComponent } from './suite-dashboard/suite-dashboard.component';
import { PendingChanges } from '../../shared/guards/can-deactivate-guard.service';


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
          }, {
            path: 'testsuite', children: [
              { path: '', component: TestSuiteComponent, canActivate: [TestSuiteGuard] },
              { path: 'dashboard', component: SuiteDashboardComponent, canActivate: [TestSuiteGuard] },
            ]
          },
          { path: 'tests', component: TestSuiteViewComponent, canActivate: [TestSuiteGuard] },
          { path: 'import', component: ImportComponent, canActivate: [ProjectImportGuard] },
          { path: 'test/:testId', component: TestViewComponent, canActivate: [TestGuard] },
          { path: 'testresult/:testresultId', component: TestResultViewComponent,
            canActivate: [TestResultGuard], canDeactivate: [PendingChanges] },
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
