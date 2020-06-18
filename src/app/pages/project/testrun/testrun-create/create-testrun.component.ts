import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Milestone } from '../../../../shared/models/milestone';
import { TestRun } from '../../../../shared/models/testRun';
import { TestSuite } from 'src/app/shared/models/test-suite';
import { TestRunService } from 'src/app/services/testrun/testrun.service';
import { TestSuiteService } from 'src/app/services/test-suite/test-suite.service';
import { MilestoneService } from 'src/app/services/milestone/milestones.service';

@Component({
  templateUrl: './create-testrun.component.html',
})
export class CreateTestRunComponent implements OnInit {
  newBuildName: string;
  executionEnvironment: string;
  testSuite: TestSuite;
  milestone: Milestone;
  testSuites: TestSuite[];
  milestones: Milestone[];
  projectId: number;

  constructor(
    private postService: TestRunService,
    private route: ActivatedRoute,
    private router: Router,
    private testSuiteService: TestSuiteService,
    private milestoneService: MilestoneService,
  ) { }

  async ngOnInit() {
    this.projectId = this.route.snapshot.params.projectId;
    [this.testSuites, this.milestones] = await Promise.all([
      this.testSuiteService.getTestSuite({ project_id: this.projectId }),
      this.milestoneService.getMilestone({ project_id: this.projectId, active: 1 })
    ]);
  }

  testSuiteChange(newtestsuite: TestSuite) {
    this.testSuite = newtestsuite;
  }

  milestoneChange(newmilestone: Milestone) {
    this.milestone = newmilestone;
  }

  async processTestRunCreation() {
    const testRun: TestRun = {
      build_name: this.newBuildName,
      test_suite_id: this.testSuite.id,
      execution_environment: this.executionEnvironment,
      start_time: new Date(),
      label_id: 2,
      project_id: this.projectId,
      debug: 0
    };
    if (this.milestone) {
      testRun.milestone_id = this.milestone.id;
    }
    const result = await this.postService.createTestRun(testRun);
    this.router.navigate([`/project/${this.projectId}/testrun/${result.id}`]);
  }

  async createTestSuite(name: string) {
    await this.testSuiteService.createTestSuite({ name, project_id: this.projectId });
    this.testSuites = await this.testSuiteService.getTestSuite({ project_id: this.projectId });
    this.testSuite = this.testSuites.find(x => x.name === name);
  }

  async createMilestone(name: string) {
    await this.milestoneService.createMilestone({ name, project_id: this.projectId });
    this.milestones = await this.milestoneService.getMilestone({ project_id: this.projectId, active: 1 });
    this.milestone = this.milestones.find(x => x.name === name);
  }

  canCreate(): boolean {
    return this.newBuildName && this.testSuite !== undefined;
  }
}
