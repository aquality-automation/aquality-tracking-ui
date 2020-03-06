import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Milestone } from '../../../../shared/models/milestone';
import { SimpleRequester } from '../../../../services/simple-requester';
import { MilestoneService } from '../../../../services/milestones.service';
import { TestSuiteService } from '../../../../services/testSuite.service';
import { GlobalDataService } from '../../../../services/globaldata.service';
import { Project } from '../../../../shared/models/project';
import { TestSuite } from '../../../../shared/models/testSuite';
import { Subscription } from 'rxjs/Subscription';

@Component({
  templateUrl: './create-milestone.component.html',
  providers: [
    MilestoneService,
    SimpleRequester
  ]
})
export class CreateMilestoneComponent implements OnInit, OnDestroy {

  milestone: Milestone = new Milestone();
  project: Project;
  suites: TestSuite[];
  projectSubscription: Subscription;

  constructor(
    private postService: MilestoneService,
    private suiteService: TestSuiteService,
    private globaldata: GlobalDataService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  async ngOnInit() {
    this.projectSubscription = this.globaldata.currentProject$.subscribe(project => {
      this.project = project;
    });

    this.suites = await this.suiteService.getTestSuite({ project_id: this.project.id });
  }

  ngOnDestroy(): void {
    this.projectSubscription.unsubscribe();
  }

  async processMilestoneCreation() {
    this.milestone.project_id = this.project.id;
    const result = await this.postService.createMilestone(this.milestone);
    this.router.navigate([`/project/${this.milestone.project_id}/testrun`], { queryParams: { milestone: result.id } });
  }
}
