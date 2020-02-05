import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { TestSuite } from '../../../../shared/models/testSuite';
import { SimpleRequester } from '../../../../services/simple-requester';
import { TestSuiteService } from '../../../../services/testSuite.service';
import { UserService } from '../../../../services/user.services';
import { TFColumn, TFColumnType } from '../../../../elements/table/tfColumn';

@Component({
  templateUrl: './testSuite.component.html',
  providers: [
    TestSuiteService,
    SimpleRequester
  ]
})
export class TestSuiteComponent implements OnInit {
  hideModal = true;
  removeModalTitle: string;
  removeModalMessage: string;
  testSuiteToRemove: TestSuite;
  testSuite: TestSuite;
  testSuites: TestSuite[];
  tbCols: TFColumn[];

  constructor(
    private testSuiteService: TestSuiteService,
    private route: ActivatedRoute,
    public userService: UserService,
    private router: Router
  ) { }

  async ngOnInit() {
    this.testSuite = { project_id: this.route.snapshot.params['projectId'] };
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
        editable: this.userService.IsLocalManager() || this.userService.IsManager() || this.userService.IsEngineer(),
        creation: {
          creationLength: 500,
          required: true
        }
      }];
  }

  async updateSuites() {
    try {
      const result = await this.testSuiteService.getTestSuite(this.testSuite);
      this.testSuites = result;
    } catch (error) {
      this.testSuiteService.handleError(error);
    }
  }

  openTestSuite(id: number) {
    this.router.navigate([`/project/${this.route.snapshot.params['projectId']}/tests`], { queryParams: { suite: id } });
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
    suite.project_id = this.route.snapshot.params['projectId'];
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
