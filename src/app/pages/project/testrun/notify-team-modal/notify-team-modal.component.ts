import { Component, Input, Output, EventEmitter, OnInit, OnChanges } from '@angular/core';
import { TestRun } from '../../../../shared/models/testRun';
import { LocalPermissions } from '../../../../shared/models/LocalPermissions';
import { BasePopupComponent } from '../../../../elements/modals/basePopup.component';
import { TestRunService } from '../../../../services/testRun.service';
import { User } from '../../../../shared/models/user';
import { DragulaService } from 'ng2-dragula';

@Component({
    selector: 'notify-team-modal',
    templateUrl: 'notify-team-modal.component.html',
    styleUrls: ['notify-team-modal.component.css']
})
export class NotifyTeamModalComponent extends BasePopupComponent implements OnInit, OnChanges {
    @Input() isHidden: boolean;
    @Input() users: LocalPermissions[];
    @Input() title = 'Send Test Run Report';
    @Input() type = '';
    @Input() buttons: any[];
    @Input() testRun: TestRun;
    @Output() closed = new EventEmitter();
    @Output() execute = new EventEmitter();
    excludedUsers: any[] = [];
    includedUsers: any[] = [];

    constructor(
        private testRunService: TestRunService,
        private dragulaService: DragulaService) {
        super();
        const bag: any = this.dragulaService.find('notification-bag');
        if (bag !== undefined) { this.dragulaService.destroy('notification-bag'); }
    }

    ngOnInit() {
        this.excludedUsers = [];
        this.includedUsers = [];
        this.includedUsers = this.includedUsers.concat(this.users);
    }

    ngOnChanges() {
        this.excludedUsers = [];
        this.includedUsers = [];
        this.includedUsers = this.includedUsers.concat(this.users);
    }

    hideModal() {
        this.isHidden = true;
        this.closed.emit(this.isHidden);
    }

    sendEmail($event) {
        if ($event) {
            const usersSendTo: User[] = [];
            this.includedUsers.forEach(user => {
                usersSendTo.push(user.user);
            });
            this.testRunService.sendReport(this.testRun, usersSendTo).subscribe(res => {
                this.testRunService.handleSuccess('Email was sent.');
                this.execute.emit();
                this.excludedUsers = [];
            }, error => this.testRunService.handleError(error));
        } else {
            this.execute.emit();
        }
    }
}
