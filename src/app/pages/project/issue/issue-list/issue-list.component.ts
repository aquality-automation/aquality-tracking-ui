import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Issue } from '../../../../shared/models/issue';
import { Label } from '../../../../shared/models/general';
import { User } from '../../../../shared/models/user';
import { UserService } from 'src/app/services/user/user.services';
import { IssueService } from 'src/app/services/issue/issue.service';
import { PermissionsService, EGlobalPermissions, ELocalPermissions } from 'src/app/services/permissions/current-permissions.service';
import { ResultResolutionService } from 'src/app/services/result-resolution/result-resolution.service';
import { TFColumn, TFSorting, TFOrder, TFColumnType } from 'src/app/elements/table-filter/tfColumn';
import { ResultResolution } from 'src/app/shared/models/result-resolution';
import { LocalPermissions } from 'src/app/shared/models/local-permissions';

@Component({
  templateUrl: './issue-list.component.html',
  styleUrls: ['./issue-list.component.scss']
})
export class IssueListComponent implements OnInit {

  constructor(
    public userService: UserService,
    private router: Router,
    private route: ActivatedRoute,
    private issueService: IssueService,
    private permissions: PermissionsService,
    private resolutionService: ResultResolutionService
  ) { }

  projectId: number;
  issues: Issue[];
  canEdit = false;
  columns: TFColumn[];
  hiddenColumns: TFColumn[];
  resolutions: ResultResolution[];
  projectUsers: LocalPermissions[];
  users: User[];
  statuses: Label[];
  defSort: TFSorting = { property: 'created', order: TFOrder.asc };
  hideCreateModal = true;

  async ngOnInit() {
    this.projectId = this.route.snapshot.params.projectId;
    [this.issues, this.resolutions, this.canEdit, this.projectUsers, this.statuses] = await Promise.all([
      this.issueService.getIssues({ project_id: this.projectId }),
      this.resolutionService.getResolution(this.projectId),
      this.permissions.hasProjectPermissions(this.projectId,
        [EGlobalPermissions.manager], [ELocalPermissions.manager, ELocalPermissions.engineer]),
      this.userService.getProjectUsers(this.projectId),
      this.issueService.getIssueStatuses()
    ]);
    this.projectUsers = this.projectUsers.filter(user => user.admin === 1 || user.manager === 1 || user.engineer === 1);
    this.users = this.projectUsers.map(x => x.user);
    this.addLinks();
    this.createColumns();
  }

  async addLinks() {
    this.issues.forEach(issue => {
      issue['external_link'] = issue.external_url
        ? { text: 'Open', link: issue.external_url }
        : {};
    });
  }

  async updateIssue(issue: Issue) {
    if (issue.resolution) {
      issue.resolution_id = issue.resolution.id;
    }

    issue.assignee_id = issue.assignee ? issue.assignee.id : 0;

    if (issue.status) {
      issue.status_id = issue.status.id;
    }

    await this.issueService.createIssue(issue, true);
  }

  showCreate() {
    this.hideCreateModal = false;
  }

  async execute(result: {executed: boolean, result?: Issue}) {
    this.hideCreateModal = true;
    if (result.executed) {
      await this.updateList();
    }
  }

  wasClosed() {
    this.hideCreateModal = true;
  }

  rowClicked(issue: Issue) {
    return this.router.navigate(['/project/' + this.route.snapshot.params['projectId'] + '/issue/' + issue.id]);
  }

  private async updateList() {
    this.issues = await this.issueService.getIssues({ project_id: this.projectId });
    this.addLinks();
  }

  private createColumns() {
    this.columns = [
      {
        name: 'Id',
        property: 'id',
        sorting: true,
        type: TFColumnType.text,
        class: 'fit',
      }, {
        name: 'Status',
        property: 'status',
        filter: true,
        sorting: true,
        type: TFColumnType.colored,
        editable: this.canEdit,
        lookup: {
          values: this.statuses,
          propToShow: ['name']
        },
        class: 'fit'
      }, {
        name: 'Resolution',
        property: 'resolution',
        filter: true,
        sorting: true,
        type: TFColumnType.colored,
        editable: this.canEdit,
        lookup: {
          values: this.resolutions,
          propToShow: ['name']
        },
        class: 'fit'
      }, {
        name: 'Title',
        property: 'title',
        filter: true,
        sorting: true,
        type: TFColumnType.text,
        editable: this.canEdit,
        creation: {
          creationLength: 500,
          required: true
        }
      }, {
        name: 'Assignee',
        property: 'assignee',
        type: TFColumnType.autocomplete,
        filter: true,
        editable: this.canEdit,
        nullFilter: true,
        lookup: {
          values: this.users,
          allowEmpty: true,
          propToShow: ['first_name', 'second_name']
        },
        class: 'fit'
      }, {
        name: 'Created',
        property: 'created',
        type: TFColumnType.date,
        class: 'fit'
      }, {
        name: 'External Issue',
        property: 'external_link',
        type: TFColumnType.externalLink,
        class: 'ft-width-250'
      },
    ];

    this.hiddenColumns = [
      {
        name: 'Description',
        property: 'description',
        type: TFColumnType.longtext,
        class: 'ft-width-250'
      }, {
        name: 'Expression',
        property: 'expression',
        type: TFColumnType.text,
        class: 'ft-width-250'
      },
    ];
  }
}
