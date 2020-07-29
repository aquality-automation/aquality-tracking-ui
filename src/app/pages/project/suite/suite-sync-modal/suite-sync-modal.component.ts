import { Component, Input, Output, EventEmitter, OnInit, ViewChild } from '@angular/core';
import { Test } from '../../../../shared/models/test';
import { ModalComponent } from 'src/app/elements/modals/modal.component';
import { TestSuite } from 'src/app/shared/models/test-suite';
import { TableFilterComponent } from 'src/app/elements/table-filter/table-filter.component';
import { TFSorting, TFOrder, TFColumn, TFColumnType } from 'src/app/elements/table-filter/tfColumn';
import { TestSuiteService } from 'src/app/services/test-suite/test-suite.service';

@Component({
    selector: 'suite-sync-modal',
    templateUrl: 'suite-sync-modal.component.html',
    styleUrls: ['suite-sync-modal.component.scss']
})
export class SyncSuiteModalComponent extends ModalComponent implements OnInit {
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
