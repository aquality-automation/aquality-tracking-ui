import { Component, OnInit } from '@angular/core';
import { IssueService } from '../../../../services/issue.service';
import { Issue } from '../../../../shared/models/issue';
import { UserService } from '../../../../services/user.services';
import { Router, ActivatedRoute } from '@angular/router';
import {
  PermissionsService,
  EGlobalPermissions,
  ELocalPermissions,
} from '../../../../services/current-permissions.service';
import { ResultResolutionService } from '../../../../services/result-resolution.service';
import {
  TFColumn,
  TFSorting,
  TFOrder,
  TFColumnType,
} from '../../../../elements/table/tfColumn';
import { ResultResolution } from '../../../../shared/models/result_resolution';
import { LocalPermissions } from '../../../../shared/models/LocalPermissions';
import { User } from '../../../../shared/models/user';
import { Label } from '../../../../shared/models/general';
import { Test } from '../../../../shared/models/test';
import { TestService } from '../../../../services/test.service';

@Component({
  templateUrl: './issue-view.component.html',
  styleUrls: ['./issue-view.component.css'],
})
export class IssueViewComponent implements OnInit {
  issue: Issue;
  projectId: number;
  issues: Issue[];
  affectedTests: Test[];
  overlappedIssues: Issue[] = [];
  canEdit = false;
  affectedTestColumns: TFColumn[];
  hiddenColumns: TFColumn[];
  resolutions: ResultResolution[];
  projectUsers: LocalPermissions[];
  users: User[];
  statuses: Label[];
  defSort: TFSorting = { property: 'created', order: TFOrder.asc };
  validateExpressionTimeout = null;
  regexpTestText: string;
  overlappedIssueColumns: TFColumn[] = [
    {
      name: 'Id',
      property: 'id',
      sorting: true,
      type: TFColumnType.text,
      class: 'fit',
    },
    {
      name: 'Title',
      property: 'title',
      filter: true,
      sorting: true,
      type: TFColumnType.text,
    },
    {
      name: 'Expression',
      property: 'expression',
      type: TFColumnType.text,
      class: 'ft-width-250',
    },
  ];

  constructor(
    public userService: UserService,
    private route: ActivatedRoute,
    private issueService: IssueService,
    private permissions: PermissionsService,
    private resolutionService: ResultResolutionService,
    private testService: TestService
  ) { }

  async ngOnInit() {
    this.projectId = +this.route.snapshot.params.projectId;
    const issueId = +this.route.snapshot.params.issueId;
    [
      this.issues,
      this.resolutions,
      this.canEdit,
      this.projectUsers,
      this.statuses,
      this.affectedTests,
    ] = await Promise.all([
      this.issueService.getIssues({ project_id: this.projectId }),
      this.resolutionService.getResolution(this.projectId).toPromise(),
      this.permissions.hasProjectPermissions(
        this.projectId,
        [EGlobalPermissions.manager],
        [ELocalPermissions.manager, ELocalPermissions.engineer]
      ),
      this.userService.getProjectUsers(this.projectId).toPromise(),
      this.issueService.getIssueStatuses(),
      this.testService.getTestByIssue({
        issueId: issueId,
        projectId: this.projectId,
      }),
    ]);
    this.issue = this.issues.find((x) => x.id === issueId);
    this.projectUsers = this.projectUsers.filter(
      (user) => user.admin === 1 || user.manager === 1 || user.engineer === 1
    );
    this.users = this.projectUsers.map((x) => x.user);
    this.createColumns();
  }

  onExpressionUpdate() {
    clearTimeout(this.validateExpressionTimeout);
    this.validateExpressionTimeout = setTimeout(() => {
      if (this.issue.expression) {
        const newIssueRegExp = new RegExp(this.issue.expression);
        this.overlappedIssues = this.issues.filter((existingIssue) =>
          existingIssue.expression && existingIssue.id !== this.issue.id
            ? newIssueRegExp.test(existingIssue.expression) ||
            new RegExp(existingIssue.expression).test(this.issue.expression)
            : false
        );
      } else {
        this.overlappedIssues = [];
      }
    }, 1000);
  }

  isExpressionOverlapped() {
    return this.overlappedIssues.length > 0;
  }

  async saveExpressionAndAssignIssue() {
    this.issue = await this.issueService.createIssue(this.issue, true);
    this.affectedTests = await this.testService.getTestByIssue({
      issueId: this.issue.id,
      projectId: this.projectId,
    });
  }

  async saveIssue() {
    if (this.issue.title) {
      this.issue = await this.issueService.createIssue(this.issue, false);
    } else {
      this.issueService.handleSimpleError('Oops!', 'Title cannot be empty!');
    }
  }

  updateResolution(resolution: ResultResolution) {
    this.issue.resolution = resolution;
    this.issue.resolution_id = resolution.id;
  }

  updateAssignee(user: User) {
    this.issue.assignee = user;
    this.issue.assignee_id = user ? user.id : 0;
  }

  setStatus(statusId: number) {
    this.issue.status_id = statusId;
    this.saveIssue();
  }

  private createColumns() {
    this.affectedTestColumns = [
      {
        name: 'Affected Test Name',
        property: 'name',
        filter: true,
        sorting: true,
        type: TFColumnType.text,
      },
      {
        name: 'Developer',
        property: 'developer',
        filter: true,
        type: TFColumnType.autocomplete,
        lookup: {
          propToShow: ['user.first_name', 'user.second_name'],
          allowEmpty: true,
          values: this.users,
          objectWithId: 'developer.user',
        },
        nullFilter: true,
        class: 'fit',
      },
    ];
  }
}
