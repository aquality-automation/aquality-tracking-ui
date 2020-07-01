import {Component, Input, OnInit} from '@angular/core';
import {DataTable, SortEvent} from './DataTable';

@Component({
    selector: 'default-sorter',
    template: `
        <a style="cursor: pointer" (click)="sort()" class="text-nowrap">
            <ng-content></ng-content>
            <span *ngIf="isSortedByMeAsc" class="glyphicon glyphicon-triangle-top" aria-hidden="true"></span>
            <span *ngIf="isSortedByMeDesc" class="glyphicon glyphicon-triangle-bottom" aria-hidden="true"></span>
        </a>`
})
export class DefaultSorterComponent implements OnInit {
    @Input() by: string;

    isSortedByMeAsc = false;
    isSortedByMeDesc = false;

    public constructor(private mfTable: DataTable) {
    }

    public ngOnInit(): void {
        this.mfTable.onSortChange.subscribe((event: SortEvent) => {
            this.isSortedByMeAsc = (event.sortBy === this.by && event.sortOrder === 'asc');
            this.isSortedByMeDesc = (event.sortBy === this.by && event.sortOrder === 'desc');
        });
    }

    sort() {
        if (this.isSortedByMeAsc) {
            this.mfTable.setSort(this.by, 'desc');
        } else {
            this.mfTable.setSort(this.by, 'asc');
        }
    }
}
