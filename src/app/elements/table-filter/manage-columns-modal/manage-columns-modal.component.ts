import { Component, Input, Output, EventEmitter, OnInit, OnChanges, OnDestroy } from '@angular/core';
import { DragulaService } from 'ng2-dragula';
import { NotificationsService } from 'angular2-notifications';

@Component({
    selector: 'manage-columns-modal',
    templateUrl: 'manage-columns-modal.component.html',
    styleUrls: ['manage-columns-modal.component.scss']
})
export class ManageColumnsModalComponent implements OnInit, OnChanges, OnDestroy {
    @Input() isHidden: boolean;
    @Input() title = 'Manage columns';
    @Input() type = '';
    @Input() buttons: any[];
    @Output() closed = new EventEmitter();
    @Output() execute = new EventEmitter();
    @Input() hiddenColumns: any[] = [];
    @Input() shownColumns: any[] = [];
    newHiddenColumns: any[] = [];
    newShownColumns: any[] = [];

    constructor(
        private notificationService: NotificationsService,
        private dragulaService: DragulaService
    ) {
        const bag: any = this.dragulaService.find('cols-bag');
        if (bag !== undefined) { this.dragulaService.destroy('cols-bag'); }
        dragulaService.createGroup('cols-bag', {
            moves: (el, source, handle, sibling) => {
                if (!source.classList.contains('mc-can-be-empty') && source.getElementsByTagName('li').length < 2) {
                    this.notificationService.warn('Columns Manager', 'At least one column should be in Show list!');
                }
                return !el.classList.contains('mc-ignore-item')
                && (source.classList.contains('mc-can-be-empty')
                || source.getElementsByTagName('li').length > 1);
            }
        });
    }

    ngOnInit() {
        this.newHiddenColumns = this.newHiddenColumns.concat(this.hiddenColumns);
        this.newShownColumns = this.newShownColumns.concat(this.shownColumns);
    }

    ngOnChanges() {
        this.newHiddenColumns = [];
        this.newShownColumns = [];
        this.newHiddenColumns = this.newHiddenColumns.concat(this.hiddenColumns);
        this.newShownColumns = this.newShownColumns.concat(this.shownColumns);
    }

    ngOnDestroy() {
        const bag: any = this.dragulaService.find('cols-bag');
        if (bag !== undefined) { this.dragulaService.destroy('cols-bag'); }
    }

    apply($event) {
        this.execute.emit({ apply: $event, shown: this.newShownColumns, hidden: this.newHiddenColumns });
    }

    hideModal() {
        this.isHidden = true;
        this.closed.emit(this.isHidden);
    }
}
