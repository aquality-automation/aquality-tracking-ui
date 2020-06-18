import {Component, Input, OnChanges, Optional} from '@angular/core';
import {DataTable, PageEvent} from './DataTable';

@Component({
    selector: 'table-paginator',
    template: `<ng-content></ng-content>`
})
export class PaginatorComponent implements OnChanges {

    @Input() mfTable: DataTable;

    private currentTable: DataTable;

    public activePage: number;
    public rowsOnPage: number;
    public dataLength = 0;
    public lastPage: number;

    public constructor(@Optional() private injectMfTable: DataTable) {
    }

    public ngOnChanges(): any {
        this.currentTable = this.mfTable || this.injectMfTable;
        this.onPageChangeSubscriber(this.currentTable.getPage());
        this.currentTable.onPageChange.subscribe(this.onPageChangeSubscriber);
    }

    public setPage(pageNumber: number): void {
        this.currentTable.setPage(pageNumber, this.rowsOnPage);
    }

    public setRowsOnPage(rowsOnPage: number): void {
        this.currentTable.setPage(this.activePage, rowsOnPage);
    }

    private onPageChangeSubscriber = (event: PageEvent) => {
        this.activePage = event.activePage;
        this.rowsOnPage = event.rowsOnPage;
        this.dataLength = event.dataLength;
        this.lastPage = Math.ceil(this.dataLength / this.rowsOnPage);
    }
}
