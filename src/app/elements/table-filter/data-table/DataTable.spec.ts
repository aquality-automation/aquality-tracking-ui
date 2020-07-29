import { SimpleChange, Component } from '@angular/core';
import { DataTable, PageEvent, SortEvent } from './DataTable';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { switchMap } from 'rxjs/operators';
import { By } from '@angular/platform-browser';
import * as _ from 'lodash';

@Component({
    template: `<table [mfData]="[]"></table>`
})
class TestComponent {
}

describe('DataTable directive tests', () => {
    let datatable: DataTable;
    let fixture: ComponentFixture<TestComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [DataTable, TestComponent]
        });
        fixture = TestBed.createComponent(TestComponent);
        datatable = fixture.debugElement.query(By.directive(DataTable)).injector.get(DataTable) as DataTable;

        datatable.mfData = [
            { id: 3, name: 'banana' },
            { id: 1, name: 'Duck' },
            { id: 2, name: 'ącki' },
            { id: 5, name: 'Ðrone' },
            { id: 4, name: 'Ananas' }
        ];
        datatable.ngOnChanges({ inputData: new SimpleChange(null, datatable.mfData, true) });
    });

    describe('initializing', () => {

        it('data should be empty array if inputData is undefined or null', () => {
            datatable.ngOnChanges({ inputData: new SimpleChange(null, null, true) });
            datatable.ngDoCheck();
            expect(datatable.data).toEqual([]);
        });

        it('data should be equal to inputData', () => {
            datatable.ngDoCheck();
            expect(datatable.data).toEqual(datatable.mfData);
        });

        it('data should be 2 first items', () => {
            datatable.mfRowsOnPage = 2;
            datatable.ngDoCheck();
            expect(datatable.data).toEqual([{ id: 3, name: 'banana' }, { id: 1, name: 'Duck' }]);
        });

        it('data should be 3. and 4. items', () => {
            datatable.mfRowsOnPage = 2;
            datatable.mfActivePage = 2;
            datatable.ngDoCheck();
            expect(datatable.data).toEqual([{ id: 2, name: 'ącki' }, { id: 5, name: 'Ðrone' }]);
        });

        it('shouldn\'t recalculate data when no changes', () => {
            datatable.ngDoCheck();
            const data = datatable.data;
            datatable.ngOnChanges({});
            datatable.ngDoCheck();
            expect(datatable.data).toBe(data);
        });
    });

    describe('pagination', () => {

        beforeEach(() => {
            datatable.mfRowsOnPage = 2;
            datatable.ngDoCheck();
        });

        it('should return current page settings', () => {
            expect(datatable.getPage()).toEqual({ activePage: 1, rowsOnPage: 2, dataLength: 5 });
        });

        it('data should be 3. and 4. items when page change', () => {
            datatable.setPage(2, 2);
            datatable.ngDoCheck();
            expect(datatable.data).toEqual([{ id: 2, name: 'ącki' }, { id: 5, name: 'Ðrone' }]);
        });

        it('data should be three first items when page change', () => {
            datatable.setPage(1, 3);
            datatable.ngDoCheck();
            expect(datatable.data).toEqual([{ id: 3, name: 'banana' }, { id: 1, name: 'Duck' }, { id: 2, name: 'ącki' }]);
        });

        it('data should be two last items when page change', () => {
            datatable.setPage(2, 3);
            datatable.setPage(2, 3);
            datatable.ngDoCheck();
            expect(datatable.data).toEqual([{ id: 5, name: 'Ðrone' }, { id: 4, name: 'Ananas' }]);
        });

        it('should change rowsOnPage when mfRowsOnPage changed', (done) => {
            datatable.mfRowsOnPage = 2;
            datatable.ngDoCheck();
            expect(datatable.data).toEqual([{ id: 3, name: 'banana' }, { id: 1, name: 'Duck' }]);

            datatable.onPageChange.subscribe((pageOptions: PageEvent) => {
                expect(pageOptions.rowsOnPage).toEqual(3);
                done();
            });

            datatable.mfRowsOnPage = 3;
            datatable.ngOnChanges({ rowsOnPage: new SimpleChange(2, 3, true) });
            datatable.ngDoCheck();
            expect(datatable.data).toEqual([{ id: 3, name: 'banana' }, { id: 1, name: 'Duck' }, { id: 2, name: 'ącki' }]);


        });
    });

    describe('sorting', () => {

        it('id should return current sort setting', () => {
            datatable.setSort('id', 'desc');
            expect(datatable.getSort()).toEqual({ sortBy: 'id', sortOrder: 'desc' });
        });

        it('should sort data after sorting input value changed', () => {
            datatable.ngDoCheck();
            datatable.mfSortBy = 'id';
            datatable.mfSortOrder = 'asc';
            datatable.ngOnChanges({
                sortBy: new SimpleChange(null, datatable.mfSortBy, true),
                sortOrder: new SimpleChange(null, datatable.mfSortOrder, true)
            });
            datatable.ngDoCheck();
            expect(datatable.data).toEqual([
                { id: 1, name: 'Duck' },
                { id: 2, name: 'ącki' },
                { id: 3, name: 'banana' },
                { id: 4, name: 'Ananas' },
                { id: 5, name: 'Ðrone' }
            ]);
        });

        it('should fire onSortChange event after sorting input value changed', (done) => {
            datatable.onSortChange.subscribe((event: SortEvent) => {
                expect(event.sortBy).toEqual('id');
                expect(event.sortOrder).toEqual('desc');
                done();
            });
            datatable.ngDoCheck();
            datatable.mfSortBy = 'id';
            datatable.mfSortOrder = 'desc';
            datatable.ngOnChanges({
                sortBy: new SimpleChange(null, datatable.mfSortBy, true),
                sortOrder: new SimpleChange(null, datatable.mfSortOrder, true)
            });
            datatable.ngDoCheck();

        });

        it('should set sortOrder to \'asc\' if not provided', (done) => {
            datatable.onSortChange.subscribe((event: SortEvent) => {
                expect(event.sortBy).toEqual('id');
                expect(event.sortOrder).toEqual('asc');
                done();
            });
            datatable.ngDoCheck();
            datatable.mfSortBy = 'id';
            datatable.ngOnChanges({
                sortBy: new SimpleChange(null, datatable.mfSortBy, true)
            });
            datatable.ngDoCheck();
            expect(datatable.mfSortOrder).toEqual('asc');
        });

        it('should set sortOrder to \'asc\' if provided something else than \'asc\' or \'desc\'', (done) => {
            datatable.onSortChange.subscribe((event: SortEvent) => {
                expect(event.sortBy).toEqual('id');
                expect(event.sortOrder).toEqual('asc');
                done();
            });
            datatable.ngDoCheck();
            datatable.mfSortBy = 'id';
            datatable.mfSortOrder = 'bulb';
            datatable.ngOnChanges({
                sortBy: new SimpleChange(null, datatable.mfSortBy, true),
                sortOrder: new SimpleChange(null, datatable.mfSortOrder, true)
            });
            datatable.ngDoCheck();
            expect(datatable.mfSortOrder).toEqual('asc');
            expect(datatable.data).toEqual([
                { id: 1, name: 'Duck' },
                { id: 2, name: 'ącki' },
                { id: 3, name: 'banana' },
                { id: 4, name: 'Ananas' },
                { id: 5, name: 'Ðrone' }
            ]);
        });

        it('shouldn\'t change order when only order provided', (done) => {
            done();
            datatable.onSortChange.subscribe(() => {
                done.fail('OnSortChange shouldn\'t been fired');
            });
            datatable.ngDoCheck();
            datatable.mfSortOrder = 'desc';
            datatable.ngOnChanges({ sortOrder: new SimpleChange(null, datatable.mfSortOrder, true) });
            datatable.ngDoCheck();
            expect(datatable.data).toEqual(datatable.mfData);
        });

        it('should call output event when sorting changed', (done) => {
            datatable.ngDoCheck();
            datatable.mfSortByChange.pipe(switchMap((sortBy: string) => {
                expect(sortBy).toEqual('id');
                return datatable.mfSortOrderChange;
            })).subscribe((sortOrder: string) => {
                expect(sortOrder).toEqual('desc');
                done();
            });

            datatable.setSort('id', 'desc');
        });

        it('shouldn\'t call output event when sortOrder fixed', (done) => {
            datatable.ngDoCheck();
            datatable.mfSortOrderChange.subscribe(() => {
                done.fail('Shouldn\'t call sortOrderChange');
            });
            done();
            datatable.mfSortOrder = 'bulb';
            datatable.ngOnChanges({ sortOrder: new SimpleChange(null, datatable.mfSortOrder, true) });
            datatable.ngDoCheck();
        });
        // Wywołanie outputa gdy zmiana z innej strony

        it('shouldn\'t refresh data when set page with same settings', () => {
            datatable.setSort('name', 'asc');
            datatable.ngDoCheck();
            const data = datatable.data;
            datatable.setSort('name', 'asc');
            datatable.ngDoCheck();
            expect(datatable.data).toBe(data);
        });

        it('should sort data ascending by name', () => {
            datatable.setSort('name', 'asc');
            datatable.ngDoCheck();
            expect(datatable.data).toEqual([
                { id: 4, name: 'Ananas' },
                { id: 3, name: 'banana' },
                { id: 1, name: 'Duck' },
                { id: 5, name: 'Ðrone' },
                { id: 2, name: 'ącki' }
            ]);
        });

        it('should sort data descending by id', () => {
            datatable.setSort('id', 'desc');
            datatable.ngDoCheck();
            expect(datatable.data).toEqual([
                { id: 5, name: 'Ðrone' },
                { id: 4, name: 'Ananas' },
                { id: 3, name: 'banana' },
                { id: 2, name: 'ącki' },
                { id: 1, name: 'Duck' }
            ]);
        });

        it('should sort data by two values', () => {
            const newData = [
                { name: 'Claire', age: 9 },
                { name: 'Anna', age: 34 },
                { name: 'Claire', age: 16 },
                { name: 'Claire', age: 7 },
                { name: 'Anna', age: 12 }
            ];
            datatable.ngOnChanges({ inputData: new SimpleChange(datatable.mfData, newData, true) });
            datatable.setSort(['name', 'age'], 'asc');
            datatable.ngDoCheck();

            expect(datatable.data).toEqual([
                { name: 'Anna', age: 12 },
                { name: 'Anna', age: 34 },
                { name: 'Claire', age: 7 },
                { name: 'Claire', age: 9 },
                { name: 'Claire', age: 16 }
            ]);
        });

        it('should sort data by child property value', () => {
            const newData = [
                { name: 'Claire', city: { zip: '51111' } },
                { name: 'Anna' },
                { name: 'Claire', city: { zip: '41111' } },
                { name: 'Donald', city: 2 },
                { name: 'Claire', city: { zip: '11111' } },
                { name: 'Anna', city: { zip: '21111' } }
            ];
            datatable.ngOnChanges({ inputData: new SimpleChange(datatable.mfData, newData, true) });
            datatable.setSort('city.zip', 'asc');
            datatable.ngDoCheck();

            expect(datatable.data).toEqual([
                { name: 'Claire', city: { zip: '11111' } },
                { name: 'Anna', city: { zip: '21111' } },
                { name: 'Claire', city: { zip: '41111' } },
                { name: 'Claire', city: { zip: '51111' } },
                { name: 'Anna' },
                { name: 'Donald', city: 2 },
            ]);
        });
    });

    describe('data change', () => {
        it('should refresh data when inputData change', () => {
            const newData = [{ id: 5, name: 'Ðrone' }, { id: 4, name: 'Ananas' }];
            datatable.ngOnChanges({ inputData: new SimpleChange(datatable.mfData, newData, true) });
            datatable.ngDoCheck();
            expect(datatable.data).toEqual([{ id: 5, name: 'Ðrone' }, { id: 4, name: 'Ananas' }]);
        });

        it('should refresh data when rows removed from inputData', () => {
            datatable.ngDoCheck();
            expect(datatable.data).toEqual(datatable.mfData);
            datatable.mfData.pop();
            datatable.ngDoCheck();
            expect(datatable.data).toEqual(datatable.mfData);
        });

        it('should refresh data when rows added to inputData', () => {
            datatable.ngDoCheck();
            expect(datatable.data).toEqual(datatable.mfData);
            datatable.mfData.push({ id: 6, name: 'Furby' });
            datatable.ngDoCheck();
            expect(datatable.data).toEqual(datatable.mfData);
        });

        it('should fire onPageChange event after inputData change', (done) => {
            datatable.setPage(2, 2);
            datatable.ngDoCheck();

            datatable.onPageChange.subscribe((opt: PageEvent) => {
                expect(opt.activePage).toEqual(1);
                expect(opt.dataLength).toEqual(2);
                expect(opt.rowsOnPage).toEqual(2);
                done();
            });
            const newData = [{ id: 5, name: 'Ðrone' }, { id: 4, name: 'Ananas' }];
            datatable.ngOnChanges({ inputData: new SimpleChange(datatable.mfData, newData, true) });
            datatable.ngDoCheck();
        });

        it('should fire onPageChange event after rows added', (done) => {
            datatable.setPage(2, 2);
            datatable.ngDoCheck();

            datatable.onPageChange.subscribe((opt: PageEvent) => {
                expect(opt.activePage).toEqual(2);
                expect(opt.dataLength).toEqual(6);
                expect(opt.rowsOnPage).toEqual(2);
                done();
            });
            datatable.mfData.push({ id: 6, name: 'Furby' });
            datatable.ngDoCheck();
        });

        it('should fire onPageChange event after rows removed', (done) => {
            datatable.setPage(2, 2);
            datatable.ngDoCheck();

            datatable.onPageChange.subscribe((opt: PageEvent) => {
                expect(opt.activePage).toEqual(1);
                expect(opt.dataLength).toEqual(2);
                expect(opt.rowsOnPage).toEqual(2);
                done();
            });
            _.times(3, () => datatable.mfData.pop());
            datatable.ngDoCheck();
        });

        it('should change page when no data on current page after changed inputData', () => {
            datatable.setPage(2, 2);
            datatable.ngDoCheck();

            const newData = [{ id: 5, name: 'Ðrone' }, { id: 4, name: 'Ananas' }];
            datatable.ngOnChanges({ inputData: new SimpleChange(datatable.mfData, newData, true) });
            datatable.ngDoCheck();
            expect(datatable.data).toEqual(newData);
        });

        it('should change page when no data on current page after rows removed', () => {
            datatable.setPage(2, 2);
            datatable.ngDoCheck();
            expect(datatable.data).toEqual([{ id: 2, name: 'ącki' }, { id: 5, name: 'Ðrone' }]);

            datatable.mfData.pop();
            datatable.mfData.pop();
            datatable.mfData.pop();
            datatable.ngDoCheck();
            expect(datatable.data).toEqual([{ id: 3, name: 'banana' }, { id: 1, name: 'Duck' }]);
        });

        it('shouldn\'t change page when can display data after data changed', () => {
            datatable.setPage(2, 1);
            datatable.ngDoCheck();

            const newData = [{ id: 5, name: 'Ðrone' }, { id: 1, name: 'Duck' }, { id: 4, name: 'Ananas' }];
            datatable.ngOnChanges({ inputData: new SimpleChange(datatable.mfData, newData, true) });
            datatable.ngDoCheck();
            expect(datatable.data).toEqual([{ id: 1, name: 'Duck' }]);
        });

        it('shouldn\'t change page when can display data after rows removed', () => {
            datatable.setPage(2, 1);
            datatable.ngDoCheck();
            expect(datatable.data).toEqual([{ id: 1, name: 'Duck' }]);

            datatable.mfData.pop();
            datatable.ngDoCheck();
            expect(datatable.data).toEqual([{ id: 1, name: 'Duck' }]);
        });

        it('shouldn\'t change page when can display data after rows added', () => {
            datatable.setPage(2, 1);
            datatable.ngDoCheck();
            expect(datatable.data).toEqual([{ id: 1, name: 'Duck' }]);

            datatable.mfData.push({ id: 6, name: 'Furby' });
            datatable.ngDoCheck();
            expect(datatable.data).toEqual([{ id: 1, name: 'Duck' }]);
        });

        it('shouldn\'t change page to 0 when data is empty', () => {
            datatable.setPage(2, 1);
            datatable.ngDoCheck();

            const newData = [];
            datatable.ngOnChanges({ inputData: new SimpleChange(datatable.mfData, newData, true) });
            datatable.ngDoCheck();
            expect(datatable.mfActivePage).toEqual(1);
        });

        it('shouldn\'t change page to 0 when data is empty after removed rows', () => {
            datatable.setPage(2, 1);
            datatable.ngDoCheck();

            _.times(5, () => datatable.mfData.pop());
            datatable.ngDoCheck();
            expect(datatable.mfData.length).toEqual(0);
            expect(datatable.mfActivePage).toEqual(1);
        });
    });
});
