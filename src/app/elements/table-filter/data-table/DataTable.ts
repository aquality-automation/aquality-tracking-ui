import {
    Directive, Input, EventEmitter, SimpleChange, OnChanges, DoCheck, IterableDiffers,
    IterableDiffer, Output
} from '@angular/core';
import * as _ from 'lodash';
import { ReplaySubject } from 'rxjs/internal/ReplaySubject';

export interface SortEvent {
    sortBy: string|string[];
    sortOrder: string;
}

export interface PageEvent {
    activePage: number;
    rowsOnPage: number;
    dataLength: number;
}

export interface DataEvent {
    length: number;
}

@Directive({
    selector: 'table[mfData]',
    exportAs: 'mfDataTable'
})
export class DataTable implements OnChanges, DoCheck {

    private diff: IterableDiffer<any>;
    @Input() public mfData: any[] = [];

    @Input() public mfSortBy: string|string[] = '';
    @Input() public mfSortOrder = 'asc';
    @Output() public mfSortByChange = new EventEmitter<string|string[]>();
    @Output() public mfSortOrderChange = new EventEmitter<string>();

    @Input() public mfRowsOnPage = 1000;
    @Input() public mfActivePage = 1;

    private mustRecalculateData = false;

    public data: any[];

    public onSortChange = new ReplaySubject<SortEvent>(1);
    public onPageChange = new EventEmitter<PageEvent>();

    public constructor(private differs: IterableDiffers) {
        this.diff = differs.find([]).create(null);
    }

    public getSort(): SortEvent {
        return {sortBy: this.mfSortBy, sortOrder: this.mfSortOrder};
    }

    public setSort(sortBy: string|string[], sortOrder: string): void {
        if (this.mfSortBy !== sortBy || this.mfSortOrder !== sortOrder) {
            this.mfSortBy = sortBy;
            this.mfSortOrder = _.includes(['asc', 'desc'], sortOrder) ? sortOrder : 'asc';
            this.mustRecalculateData = true;
            this.onSortChange.next({sortBy: sortBy, sortOrder: sortOrder});
            this.mfSortByChange.emit(this.mfSortBy);
            this.mfSortOrderChange.emit(this.mfSortOrder);
        }
    }

    public getPage(): PageEvent {
        return {activePage: this.mfActivePage, rowsOnPage: this.mfRowsOnPage, dataLength: this.mfData.length};
    }

    public setPage(activePage: number, rowsOnPage: number): void {
        if (this.mfRowsOnPage !== rowsOnPage || this.mfActivePage !== activePage) {
            this.mfActivePage = this.mfActivePage !== activePage ? activePage : this.calculateNewActivePage(this.mfRowsOnPage, rowsOnPage);
            this.mfRowsOnPage = rowsOnPage;
            this.mustRecalculateData = true;
            this.onPageChange.emit({
                activePage: this.mfActivePage,
                rowsOnPage: this.mfRowsOnPage,
                dataLength: this.mfData ? this.mfData.length : 0
            });
        }
    }

    private calculateNewActivePage(previousRowsOnPage: number, currentRowsOnPage: number): number {
        const firstRowOnPage = (this.mfActivePage - 1) * previousRowsOnPage + 1;
        const newActivePage = Math.ceil(firstRowOnPage / currentRowsOnPage);
        return newActivePage;
    }

    private recalculatePage() {
        const lastPage = Math.ceil(this.mfData.length / this.mfRowsOnPage);
        this.mfActivePage = lastPage < this.mfActivePage ? lastPage : this.mfActivePage;
        this.mfActivePage = this.mfActivePage || 1;

        this.onPageChange.emit({
            activePage: this.mfActivePage,
            rowsOnPage: this.mfRowsOnPage,
            dataLength: this.mfData.length
        });
    }

    public ngOnChanges(changes: {[key: string]: SimpleChange}): any {
        if (changes['rowsOnPage']) {
            this.mfRowsOnPage = changes['rowsOnPage'].previousValue;
            this.setPage(this.mfActivePage, changes['rowsOnPage'].currentValue);
            this.mustRecalculateData = true;
        }
        if (changes['sortBy'] || changes['sortOrder']) {
            if (!_.includes(['asc', 'desc'], this.mfSortOrder)) {
                this.mfSortOrder = 'asc';
            }
            if (this.mfSortBy) {
                this.onSortChange.next({sortBy: this.mfSortBy, sortOrder: this.mfSortOrder});
            }
            this.mustRecalculateData = true;
        }
        if (changes['inputData']) {
            this.mfData = changes['inputData'].currentValue || [];
            this.recalculatePage();
            this.mustRecalculateData = true;
        }
    }

    public ngDoCheck(): any {
        const changes = this.diff.diff(this.mfData);
        if (changes) {
            this.recalculatePage();
            this.mustRecalculateData = true;
        }
        if (this.mustRecalculateData) {
            this.fillData();
            this.mustRecalculateData = false;
        }
    }

    private fillData(): void {
        this.mfActivePage = this.mfActivePage;
        this.mfRowsOnPage = this.mfRowsOnPage;

        const offset = (this.mfActivePage - 1) * this.mfRowsOnPage;
        let data = this.mfData;
        const sortBy = this.mfSortBy;
        if (typeof sortBy === 'string' || sortBy instanceof String) {
            data = _.orderBy(data, this.caseInsensitiveIteratee(<string>sortBy), [this.mfSortOrder]);
        } else {
            data = _.orderBy(data, sortBy, [this.mfSortOrder]);
        }
        data = _.slice(data, offset, offset + this.mfRowsOnPage);
        this.data = data;
    }

    private caseInsensitiveIteratee(sortBy: string) {
        return (row: any): any => {
            let value = row;
            for (const sortByProperty of sortBy.split('.')) {
                if (value) {
                    value = value[sortByProperty];
                }
            }
            if (value && typeof value === 'string' || value instanceof String) {
                return value.toLowerCase();
            }
            return value;
        };
    }
}
