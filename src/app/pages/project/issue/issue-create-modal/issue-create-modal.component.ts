import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { Issue } from '../../../../shared/models/issue';
import { User } from '../../../../shared/models/user';
import { ActivatedRoute } from '@angular/router';
import { ModalComponent } from 'src/app/elements/modals/modal.component';
import { ResultResolution } from 'src/app/shared/models/result-resolution';
import { TFColumn, TFColumnType } from 'src/app/elements/table-filter/tfColumn';
import { UserService } from 'src/app/services/user/user.services';
import { PermissionsService, EGlobalPermissions, ELocalPermissions } from 'src/app/services/permissions/current-permissions.service';
import { IssueService } from 'src/app/services/issue/issue.service';
import { FormGroup } from '@angular/forms';
import { System } from 'src/app/shared/models/integrations/system';
import { referenceTypes } from 'src/app/shared/models/integrations/reference-type';
import { ReferencesComponent } from '../../references/references.component';
import { Reference } from 'src/app/shared/models/integrations/reference';

@Component({
  selector: 'issue-create-modal',
  templateUrl: './issue-create-modal.component.html',
  styleUrls: ['./issue-create-modal.component.scss']
})
export class CreateIssueModalComponent extends ModalComponent implements OnInit {
  @Input() resolutions: ResultResolution[];
  @Input() existingIssues: Issue[];
  @Input() users: User[];
  @Input() issue: Issue;
  @Input() failReason: string;
  @ViewChild('reference')
  referenceComponent: ReferencesComponent;
  shouldRefBeUpdated: boolean = false;
  onRefChangeCounter: number = 0;
  projectId: number;
  selectedSystem: System;
  formAddRef: FormGroup;
  referenceTypes = referenceTypes;
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

    this.projectId = this.route.snapshot.params.projectId;

    if (!this.issue) {
      this.issue = new Issue();
    }
    if (!this.issue.id) {
      this.shouldRefBeUpdated = true;
      this.issue.project_id = this.projectId;
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
      execute: false,
      id: 'issue-create-modal-cancel'
    }];

    if (this.canEdit) {
      this.buttons.unshift({
        name: this.issue.id ? 'Update' : 'Create',
        execute: true,
        id: 'issue-create-modal-create'
      });
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
      this.updateReference(issue);
    } else {
      this.execute.emit({ executed: false });
    }
  }

  private updateReference(issue: Issue){
    if(this.shouldRefBeUpdated && this.referenceComponent.isAddingKeyValid()){
      this.referenceComponent.addReferenceTo(issue.id);
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

  isExpressionInvalid() {
    try {
      /* tslint:disable */
      new RegExp(this.issue.expression);
      /* tslint:enable */
      return false;
    } catch (error) {
      return true;
    }
  }

  onReferencesChanged(references: Reference[]){
    if(this.onRefChangeCounter > 0 || references.length === 0){
      this.shouldRefBeUpdated = true
    }
    this.onRefChangeCounter++;
  }
}
