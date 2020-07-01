import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { TestSuite } from 'src/app/shared/models/test-suite';
import { TFColumn, TFSorting, TFOrder, TFColumnType } from 'src/app/elements/table-filter/tfColumn';
import { TestSuiteService } from 'src/app/services/test-suite/test-suite.service';
import { UserService } from 'src/app/services/user/user.services';
import { PermissionsService, EGlobalPermissions, ELocalPermissions } from 'src/app/services/permissions/current-permissions.service';

@Component({
  templateUrl: './suite.list.component.html'
})
export class TestSuiteComponent implements OnInit {
  hideModal = true;
  removeModalTitle: string;
  removeModalMessage: string;
  testSuiteToRemove: TestSuite;
  testSuite: TestSuite;
  testSuites: TestSuite[];
  tbCols: TFColumn[];
  projectId: number;
  allowCreateDelete: boolean;
  sortBy: TFSorting = { property: 'name', order: TFOrder.desc };

  constructor(
    private testSuiteService: TestSuiteService,
    private route: ActivatedRoute,
    public userService: UserService,
    private router: Router,
    private permissions: PermissionsService
  ) { }

  async ngOnInit() {
    this.projectId = this.route.snapshot.params.projectId;
    this.testSuite = { project_id: this.projectId };
    const canEdit = await this.permissions.hasProjectPermissions(this.projectId,
      [EGlobalPermissions.manager], [ELocalPermissions.manager, ELocalPermissions.engineer]);
    this.allowCreateDelete = await this.permissions.hasProjectPermissions(this.projectId,
      [EGlobalPermissions.manager], [ELocalPermissions.manager]);
    await this.updateSuites();

    this.tbCols = [
      {
        name: 'Id',
        property: 'id',
        sorting: true,
        type: TFColumnType.text,
        class: 'fit'
      }, {
        name: 'Name',
        property: 'name',
        filter: true,
        sorting: true,
        type: TFColumnType.text,
        editable: canEdit,
        creation: {
          creationLength: 500,
          required: true
        }
      }];
  }

  async updateSuites() {
    const result = await this.testSuiteService.getTestSuite(this.testSuite);
    this.testSuites = result;
  }

  openTestSuite(id: number) {
    this.router.navigate([`/project/${this.projectId}/tests`], { queryParams: { suite: id } });
  }

  handleAction(event: { action: string, entity: TestSuite }) {
    if (event.action === 'remove') {
      this.testSuiteToRemove = event.entity;
      this.removeModalTitle = `Remove Test Suite: ${event.entity.name}`;
      this.removeModalMessage = `Are you sure that you want to delete the '${
        event.entity.name
        }' test suite and all assigned test runs? This action cannot be undone.`;
      this.hideModal = false;
    }
    if (event.action === 'create') {
      this.createSuite(event.entity);
    }
  }

  async execute($event) {
    if (await $event) {
      await this.testSuiteService.removeTestSuite(this.testSuiteToRemove);
      this.hideModal = true;
      await this.updateSuites();
    }
  }

  wasClosed() {
    this.hideModal = true;
  }

  async createSuite(suite: TestSuite) {
    suite.project_id = this.projectId;
    await this.testSuiteService.createTestSuite(suite);
    await this.updateSuites();
    this.testSuiteService.handleSuccess(`Suite '${suite.name}' was created!`);
  }

  async suiteUpdate(suite: TestSuite) {
    await this.testSuiteService.createTestSuite(suite);
    await this.updateSuites();
    this.testSuiteService.handleSuccess(`Suite '${suite.name}' was updated!`);
  }
}
