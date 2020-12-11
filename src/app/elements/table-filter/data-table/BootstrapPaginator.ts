import {Component, Input, OnChanges, Output, EventEmitter} from '@angular/core';
import {DataTable} from './DataTable';
import {PaginatorComponent} from './Paginator';
import * as _ from 'lodash';

@Component({
    selector: 'bootstrap-paginator',
    template: `
    <table-paginator #p [mfTable]="mfTable">
        <ul class="pagination" *ngIf="p.dataLength > p.rowsOnPage">
            <li class="page-item" [class.disabled]="p.activePage <= 1" (click)="onClickPage(p, 1)">
                <a class="page-link" style="cursor: pointer">&laquo;</a>
            </li>
            <li class="page-item" *ngIf="p.activePage > 4 && p.activePage + 1 > p.lastPage" (click)="onClickPage(p, p.activePage - 4)">
                <a class="page-link" style="cursor: pointer">{{p.activePage-4}}</a>
            </li>
            <li class="page-item" *ngIf="p.activePage > 3 && p.activePage + 2 > p.lastPage" (click)="onClickPage(p, p.activePage - 3)">
                <a class="page-link" style="cursor: pointer">{{p.activePage-3}}</a>
            </li>
            <li class="page-item" *ngIf="p.activePage > 2" (click)="onClickPage(p, p.activePage - 2)">
                <a class="page-link" style="cursor: pointer">{{p.activePage-2}}</a>
            </li>
            <li class="page-item" *ngIf="p.activePage > 1" (click)="onClickPage(p, p.activePage - 1)">
                <a class="page-link" style="cursor: pointer">{{p.activePage-1}}</a>
            </li>
            <li class="page-item active">
                <a class="page-link" style="cursor: pointer">{{p.activePage}}</a>
            </li>
            <li class="page-item" *ngIf="p.activePage + 1 <= p.lastPage" (click)="onClickPage(p, p.activePage + 1)">
                <a class="page-link" style="cursor: pointer">{{p.activePage+1}}</a>
            </li>
            <li class="page-item" *ngIf="p.activePage + 2 <= p.lastPage" (click)="onClickPage(p, p.activePage + 2)">
                <a class="page-link" style="cursor: pointer">{{p.activePage+2}}</a>
            </li>
            <li class="page-item" *ngIf="p.activePage + 3 <= p.lastPage && p.activePage < 3" (click)="onClickPage(p, p.activePage + 3)">
                <a class="page-link" style="cursor: pointer">{{p.activePage+3}}</a>
            </li>
            <li class="page-item" *ngIf="p.activePage + 4 <= p.lastPage && p.activePage < 2" (click)="onClickPage(p, p.activePage + 4)">
                <a class="page-link" style="cursor: pointer">{{p.activePage+4}}</a>
            </li>
            <li class="page-item" [class.disabled]="p.activePage >= p.lastPage" (click)="onClickPage(p, p.lastPage)">
                <a class="page-link" style="cursor: pointer">&raquo;</a>
            </li>
        </ul>
        <ul class="pagination pull-right float-sm-right" *ngIf="p.dataLength > minRowsOnPage">
            <li class="page-item" *ngFor="let rows of rowsOnPageSet" [class.active]="p.rowsOnPage===rows" (click)="p.setRowsOnPage(rows)">
                <a class="page-link" style="cursor: pointer">{{rows}}</a>
            </li>
        </ul>
    </table-paginator>
    `
})
export class BootstrapPaginatorComponent implements OnChanges {
    @Input() rowsOnPageSet = [];
    @Input() mfTable: DataTable;
    @Output() onPageChange: EventEmitter<number> = new EventEmitter();  

    minRowsOnPage = 0;

    ngOnChanges(changes: any): any {
        if (changes.rowsOnPageSet) {
            this.minRowsOnPage = _.min(this.rowsOnPageSet);
        } 
    }

    onClickPage(paginator: PaginatorComponent, pageNumber: number): void {
        paginator.setPage(pageNumber);
        this.onPageChange.emit();
    }
}
