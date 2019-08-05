import { Component, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { SimpleRequester } from '../../../services/simple-requester';
import { TestRunService } from '../../../services/testRun.service';
import { TestSuiteService } from '../../../services/testSuite.service';
import { MilestoneService } from '../../../services/milestones.service';
import { TestSuite } from '../../../shared/models/testSuite';
import { Milestone } from '../../../shared/models/milestone';
import { TestRun } from '../../../shared/models/testRun';

@Component({
  templateUrl: './create-testrun.component.html',
  providers: [
    TestRunService,
    SimpleRequester,
    TestSuiteService,
    MilestoneService
  ]
})
export class CreateTestRunComponent implements OnInit {
  datePickerState: boolean;
  dateLabel: string;
  date: Date;
  hours: number;
  minutes: number;
  newBuildName = '';
  startTime: string;
  executionEnvironment = '';
  testSuite: TestSuite;
  milestone: Milestone;
  blankTestSuite: TestSuite;
  blankMilestone: Milestone;
  testSuites: TestSuite[];
  milestones: Milestone[];

  constructor(
    private datepipe: DatePipe,
    private postService: TestRunService,
    private route: ActivatedRoute,
    private router: Router,
    private testSuiteService: TestSuiteService,
    private milestoneService: MilestoneService
  ) {
    this.datePickerState = false;
    this.date = new Date();
    this.hours = this.date.getHours();
    this.minutes = this.date.getMinutes();
    this.dateLabel = this.getDateString();

  }

  async ngOnInit() {
    [this.testSuites, this.milestones] = await Promise.all([
      this.testSuiteService.getTestSuite({ project_id: this.route.snapshot.params['projectId'] }),
      this.milestoneService.getMilestone({ project_id: this.route.snapshot.params['projectId'] })
    ]);
  }

  testSuiteChange(newtestsuite: TestSuite) {
    this.testSuite = newtestsuite;
  }

  milestoneChange(newmilestone: Milestone) {
    this.milestone = newmilestone;
  }

  setHours(hours: number) {
    if (hours < 24) {
      this.hours = hours;
      this.date.setHours(hours);
      this.dateLabel = this.getDateString();
    }
  }

  toggleDatePicker() {
    this.datePickerState = !this.datePickerState;
  }

  setMinutes(minutes: number) {
    if (minutes < 60) {
      this.minutes = minutes;
      this.date.setMinutes(minutes);
      this.dateLabel = this.getDateString();
    }
  }

  onSelectionDone(event) {
    this.date = event;
    this.date.setHours(this.hours);
    this.date.setMinutes(this.minutes);
    this.dateLabel = this.getDateString();
  }

  getDateString() {
    return this.datepipe.transform(this.date, 'dd/MM/yyyy HH:mm');
  }

  async processTestRunCreation() {
    const testRun: TestRun = {
      build_name: this.newBuildName,
      test_suite_id: this.testSuite.id,
      execution_environment: this.executionEnvironment,
      start_time: this.date,
      finish_time: this.date,
      project_id: this.route.snapshot.params['projectId'],
      debug: 0
    };
    if (this.milestone) {
      testRun.milestone_id = this.milestone.id;
    }
    const result = await this.postService.createTestRun(testRun);
    this.router.navigate(['/project/' + this.route.snapshot.params['projectId'] + '/testrun/' + result.id]);
  }
}
