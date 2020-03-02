import { Component, OnInit } from '@angular/core';
import { UserService } from '../../../../services/user.services';
import { Router, ActivatedRoute } from '@angular/router';
import { MilestoneService } from '../../../../services/milestones.service';
import { Milestone } from '../../../../shared/models/milestone';
import { TFColumn, TFColumnType, TFOrder } from '../../../../elements/table/tfColumn';
import { PermissionsService, EGlobalPermissions, ELocalPermissions } from '../../../../services/current-permissions.service';
import { TestSuite } from '../../../../shared/models/testSuite';
import { TestSuiteService } from '../../../../services/testSuite.service';

@Component({
  templateUrl: './list-milestone.component.html',
  styleUrls: ['./list-milestone.component.css']
})
export class ListMilestoneComponent implements OnInit {

  constructor(
    public userService: UserService,
    private router: Router,
    private route: ActivatedRoute,
    private milestoneService: MilestoneService,
    private suiteService: TestSuiteService,
    private permissions: PermissionsService
  ) { }

  hideModal = true;
  removeModalTitle: string;
  removeModalMessage: string;
  canEdit: boolean;
  milestones: Milestone[];
  milestoneToRemove: Milestone;
  columns: TFColumn[];
  projectId: number;
  suites: TestSuite[];

  public defSort = { property: 'due_date', order: TFOrder.asc };

  async ngOnInit() {
    this.projectId = this.route.snapshot.params.projectId;
    this.suites = await this.suiteService.getTestSuite({ project_id: this.projectId });
    this.milestones = await this.getMilestones();
    this.canEdit = await this.permissions.hasProjectPermissions(this.projectId,
      [EGlobalPermissions.manager], [ELocalPermissions.manager, ELocalPermissions.engineer]);
    this.columns = [
      {
        name: 'Id',
        property: 'id',
        sorting: true,
        type: TFColumnType.text,
        class: 'fit',
      }, {
        name: 'Active',
        property: 'active',
        filter: true,
        type: TFColumnType.checkbox,
        editable: this.canEdit,
        notEditableByProperty: { property: 'active', value: false }
      }, {
        name: 'Name',
        property: 'name',
        filter: true,
        sorting: true,
        type: TFColumnType.text,
        editable: this.canEdit,
        notEditableByProperty: { property: 'active', value: false },
        creation: {
          creationLength: 500,
          required: true
        }
      }, {
        name: 'Suites',
        property: 'suites',
        filter: true,
        type: TFColumnType.multiselect,
        editable: this.canEdit,
        notEditableByProperty: { property: 'active', value: false },
        lookup: {
          entity: 'suites',
          propToShow: ['name'],
          values: this.suites,
        }
      }, {
        name: 'Due Date',
        property: 'due_date',
        sorting: true,
        type: TFColumnType.date,
        format: 'MMM dd, yyyy',
        notEditableByProperty: { property: 'active', value: false },
        editable: this.canEdit
      }];
  }

  rowClicked(milestone: Milestone) {
    return this.router.navigate([`/project/${this.projectId}/milestone/${milestone.id}`]);
  }

  getMilestones() {
    return this.milestoneService.getMilestone({ project_id: this.projectId });
  }

  async updateMilestone(milestone: Milestone) {
    milestone.project_id = this.projectId;
    await this.milestoneService.createMilestone(milestone);
    return this.milestoneService.handleSuccess(`The milestone '${milestone.name}' was updated.`);
  }

  async createMilestone(milestone: Milestone) {
    milestone.project_id = this.projectId;
    await this.milestoneService.createMilestone(milestone);
    return this.milestoneService.handleSuccess(`The milestone '${milestone.name}' was created.`);
  }

  async handleAction(event: { action: string, entity: Milestone }) {
    if (event.action === 'remove') {
      this.milestoneToRemove = event.entity;
      this.removeModalTitle = `Remove Milestone: ${event.entity.name}`;
      this.removeModalMessage = `Are you sure that you want to delete the '${
        event.entity.name
        }' Milestone? This action cannot be undone.`;
      this.hideModal = false;
    }
    if (event.action === 'create') {
      await this.createMilestone(event.entity);
      this.milestones = await this.getMilestones();
    }
  }

  async execute(decision: Promise<boolean>) {
    if (await decision) {
      await this.milestoneService.removeMilestone(this.milestoneToRemove);
      this.hideModal = true;
      this.milestones = await this.getMilestones();
    }
  }



  wasClosed(state: boolean) {
    this.hideModal = state;
  }
}
