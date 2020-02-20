import { Component, Input, Output, EventEmitter, OnInit, ViewChild } from '@angular/core';
import { BasePopupComponent } from '../../../../elements/modals/basePopup.component';
import { Test } from '../../../../shared/models/test';
import { SimpleRequester } from '../../../../services/simple-requester';
import { TestSuite } from '../../../../shared/models/testSuite';
import { TableFilterComponent } from '../../../../elements/table/table.filter.component';
import { TestSuiteService } from '../../../../services/testSuite.service';
import { TFColumn, TFColumnType, TFSorting, TFOrder } from '../../../../elements/table/tfColumn';

@Component({
    selector: 'sync-suite-modal',
    templateUrl: 'sync-suite-modal.component.html',
    styleUrls: ['sync-suite-modal.component.css'],
    providers: [
        SimpleRequester
    ]
})
export class SyncSuiteModalComponent extends BasePopupComponent implements OnInit {
    title = 'Sync suite';
    @Input() type = 'info';
    @Input() buttons = [{ name: 'Sync', execute: true }, { name: 'Cancel', execute: false }];
    @Input() suites: TestSuite[];
    @Input() suite: TestSuite;
    @Output() testSyncTo = new EventEmitter();
    @ViewChild(TableFilterComponent) syncTestTable: TableFilterComponent;
    tests: Test[] = [];
    testsToSync: Test[] = [];
    notExecutedFor = 5;
    removeNotExecuted = true;
    sortBy: TFSorting = { property: 'name', order: TFOrder.desc };
    cols: TFColumn[] = [
        {
            name: 'Name',
            property: 'name',
            filter: true,
            sorting: true,
            type: TFColumnType.text
        }
    ];

    constructor(
        private testSuiteService: TestSuiteService,
    ) {
        super();
    }

    async accept(execute: boolean) {
        this.testsToSync = this.syncTestTable.getSelectedEntitites();
        if (execute) {
            if (this.testsToSync.length > 0) {
                if (this.testsToSync.length > 50) {
                    this.testSuiteService.handleInfo(`You are running synchronization for ${this.testsToSync.length},
                     be patient it will take some time.`);
                }
                await this.testSuiteService.syncSuite(this.testsToSync, this.suite.id, this.removeNotExecuted);
                this.testSuiteService.handleSuccess('Tests were synchronized!');
            } else {
                this.testSuiteService.handleWarning('No tests selected', 'You should select at least one test to sync!');
                return;
            }
        }
        this.onClick(execute);
    }

    suiteChange(suite: TestSuite) {
        this.suite = suite;
    }

    async findTests() {
        this.tests = await this.testSuiteService.findTestToSync(this.notExecutedFor, this.suite.id);
        if (this.tests.length < 1) {
            this.testSuiteService.handleWarning('No tests found',
                `No test were stored with Not Executed result for at least ${this.notExecutedFor
                } last test runs for ${this.suite.name} suite!`);
        }
    }
}
