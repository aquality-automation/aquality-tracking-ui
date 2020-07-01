import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {DataTable} from './DataTable';
import {DefaultSorterComponent} from './DefaultSorter';
import {PaginatorComponent} from './Paginator';
import {BootstrapPaginatorComponent} from './BootstrapPaginator';

@NgModule({
    imports: [
        CommonModule
    ],
    declarations: [
        DataTable,
        DefaultSorterComponent,
        PaginatorComponent,
        BootstrapPaginatorComponent
    ],
    exports: [
        DataTable,
        DefaultSorterComponent,
        PaginatorComponent,
        BootstrapPaginatorComponent
    ]
})
export class DataTableModule {

}
