import { Component, OnInit, Input } from '@angular/core';
import { BasePopupComponent } from '../../../../elements/modals/basePopup.component';
import { Issue } from '../../../../shared/models/issue';
import { ResultResolution } from '../../../../shared/models/result_resolution';
import { User } from '../../../../shared/models/user';
import { IssueService } from '../../../../services/issue.service';
import { ActivatedRoute } from '@angular/router';
import { UserService } from '../../../../services/user.services';
import { TFColumn, TFColumnType } from '../../../../elements/table/tfColumn';
import { PermissionsService, EGlobalPermissions, ELocalPermissions } from '../../../../services/current-permissions.service';

@Component({
  selector: 'issue-create-modal',
  templateUrl: './issue-create.modal.component.html',
  styleUrls: ['./issue-create.modal.component.css']
})
export class CreateIssueModalComponent extends BasePopupComponent implements OnInit {
  @Input() resolutions: ResultResolution[];
  @Input() existingIssues: Issue[];
  @Input() users: User[];
  @Input() issue: Issue;
  @Input() failReason: string;
  canEdit = false;
  updateResults = true;
  overlappedIssues: Issue[] = [];
  validateExpressionTimeout = null;
  columns: TFColumn[] = [
    {
      name: 'Id',
      property: 'id',
      sorting: true,
      type: TFColumnType.text,
      class: 'fit',
    }, {
      name: 'Title',
      property: 'title',
      filter: true,
      sorting: true,
      type: TFColumnType.text
    }, {
      name: 'Expression',
      property: 'expression',
      type: TFColumnType.text,
      class: 'ft-width-250'
    }
  ];

  constructor(
    public userService: UserService,
    private route: ActivatedRoute,
    private permissions: PermissionsService,
    private issueService: IssueService
  ) {
    super();
  }

  async ngOnInit() {
    if (!this.issue) {
      this.issue = new Issue();
    }
    if (!this.issue.id) {
      this.issue.project_id = this.route.snapshot.params.projectId;
      this.issue.creator_id = this.userService.currentUser().id;
      this.issue.status_id = 1;
      this.updateResolution(this.resolutions.find(x => x.id === 1));
    } else {
      this.updateResults = false;
    }
    if (!this.existingIssues) {
      this.existingIssues = await this.issueService.getIssues({ project_id: this.issue.project_id });
    }
    
    this.canEdit = await this.permissions.hasProjectPermissions(
      this.issue.project_id,
      [EGlobalPermissions.manager],
      [ELocalPermissions.manager, ELocalPermissions.engineer]
    );

    this.buttons = [{
      name: 'Cancel',
      execute: false
    }];

    if(this.canEdit) {
      this.buttons.unshift({
        name: this.issue.id ? 'Update' : 'Create',
        execute: true
      })
    }
  }

  updateResolution(resolution: ResultResolution) {
    this.issue.resolution = resolution;
    this.issue.resolution_id = resolution.id;
  }

  updateAssignee(user: User) {
    this.issue.assignee = user;
    this.issue.assignee_id = user.id;
  }

  onExpressionUpdate() {
    clearTimeout(this.validateExpressionTimeout);
    this.validateExpressionTimeout = setTimeout(() => {
      if (this.issue.expression) {
        const newIssueRegExp = new RegExp(this.issue.expression);
        this.overlappedIssues = this.existingIssues.filter(existingIssue => existingIssue.expression && existingIssue.id !== this.issue.id
          ? newIssueRegExp.test(existingIssue.expression) || new RegExp(existingIssue.expression).test(this.issue.expression)
          : false);
      } else {
        this.overlappedIssues = [];
      }
    }, 1000);
  }

  async doAction(execute: boolean) {
    if (execute) {
      if (!this.isIssueValid()) {
        this.issueService.handleSimpleError('Fill all required fields!', 'You should fill Title and Resolution fields!');
        return;
      }

      if (this.isExpressionOverlapped()) {
        this.issueService.handleSimpleError('Expression is overlapped!',
          'The Regular Expression sould not be overlapped with other issues!');
        return;
      }

      const issue = await this.issueService.createIssue(this.issue, this.updateResults);
      this.execute.emit({ executed: true, result: issue });
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

  isExpressionOverlapped() {
    return this.overlappedIssues.length > 0;
  }
}
