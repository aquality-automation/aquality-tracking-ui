import { Component, OnInit, Input } from '@angular/core';
import { BasePopupComponent } from '../../../../elements/modals/basePopup.component';
import { Issue } from '../../../../shared/models/issue';
import { ResultResolution } from '../../../../shared/models/result_resolution';
import { User } from '../../../../shared/models/user';
import { IssueService } from '../../../../services/issue.service';
import { ActivatedRoute } from '@angular/router';
import { UserService } from '../../../../services/user.services';

@Component({
  selector: 'issue-create-modal',
  templateUrl: './issue-create.modal.component.html',
  styleUrls: ['./issue-create.modal.component.css']
})
export class CreateIssueModalComponent extends BasePopupComponent implements OnInit {
  @Input() resolutions: ResultResolution[];
  @Input() users: User[];
  @Input() title: string;
  issue: Issue;
  updateResults = true;

  constructor(
    public userService: UserService,
    private route: ActivatedRoute,
    private issueService: IssueService
  ) {
    super();
  }

  ngOnInit() {
    this.buttons = [{
      name: 'Create',
      execute: true
    }, {
      name: 'Cancel',
      execute: false
    }];
    this.issue = new Issue();
    if (this.title) {
      this.issue.title = this.title;
    }
    this.issue.project_id = this.route.snapshot.params.projectId;
    this.issue.creator_id = this.userService.currentUser().id;
    this.issue.status_id = 1;
    this.updateResolution(this.resolutions.find(x => x.id === 1));
  }

  updateResolution(resolution: ResultResolution) {
    this.issue.resolution = resolution;
    this.issue.resolution_id = resolution.id;
  }

  updateAssignee(user: User) {
    this.issue.assignee = user;
    this.issue.assignee_id = user.id;
  }

  async doAction(execute: boolean) {
    if (execute) {
      if (this.isIssueValid()) {
        const issue = await this.issueService.createIssue(this.issue, this.updateResults);
        this.execute.emit({ executed: true, result: issue });
      } else {
        this.issueService.handleSimpleError('Fill all required fields!', 'You should fill Title and Resolution fields!');
      }
    } else {
      this.execute.emit({ executed: false });
    }
  }

  isIssueValid(): boolean {
    if (!this.issue.title || !this.issue.resolution_id) {
      return false;
    }

    return true;
  }
}
