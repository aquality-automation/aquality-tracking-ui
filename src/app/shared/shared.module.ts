import { NgModule} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BasePopupComponent } from '../elements/modals/basePopup.component';
import { CommonModule } from '@angular/common';
import { TableFilterComponent } from '../elements/table/table.filter.component';
import { DataTableModule } from 'angular2-datatable';
import { TableSorterDerective } from '../derectives/mfTableSorter.derective';
import { LookupAutocompleteComponent } from '../elements/lookup/lookupAutocomplete.component';
import { LargeTextContainerComponent } from '../elements/containers/largeTextContainer.component';
import { LookupColorsComponent } from '../elements/lookup/lookupColors.component';
import { LookupComponent } from '../elements/lookup/lookup.component';
import { SetClassDirective } from '../derectives/setClass.derective';
import { CustomEventListener } from '../derectives/customEventListener.derective';
import { CommentsComponent } from '../elements/comments/comments.component';
import { NgxEditorModule } from 'ngx-editor';
import { PanelsRowDirective } from '../derectives/panels-row.derective';
import { FileUploadModule } from 'ng2-file-upload/file-upload/file-upload.module';
import { UploaderComponent } from '../elements/file-uploader/uploader.element';
import { LookupAutocompleteMultiselectComponent } from '../elements/lookup/lookupAutocompleteMultiselect.component';
import { RouterModule } from '@angular/router';
import { SetHTMLDirective } from '../derectives/show-html-data.derective';
import { AutofocusDirective } from '../derectives/auto-focus.derective';
import { NgDatepickerModule } from 'custom-a1qa-ng2-datepicker';
import { BaseLookupComponent } from '../elements/lookup/baseLookup';
import { ClickableLinks } from '../derectives/clickableLinks.derective';
import { InlineEditorModule } from '@qontu/ngx-inline-editor';
import { TextMaskModule } from 'angular2-text-mask';
import { MaxLength } from '../derectives/maxLength.derective';
import { UiSwitchModule } from 'ngx-ui-switch';
import { ManageColumnsModalComponent } from '../elements/table/manage-columns-modal/manage-columns-modal.component';
import { DragulaModule } from 'ng2-dragula';
import { OverflowDirective } from '../derectives/overflow.derective';
import { ClickOutsideModule } from 'ng-click-outside';
import { DisabledInlineDerective } from '../derectives/disabled-inline-editor.derective';
import { HttpModule } from '@angular/http';
import { HttpClientModule } from '@angular/common/http';
import { ChartsModule } from 'ng2-charts';
import { InputTrimModule } from 'ng2-trim-directive';

@NgModule({
  imports: [
    FormsModule,
    DataTableModule,
    CommonModule,
    InlineEditorModule,
    NgxEditorModule,
    FileUploadModule,
    RouterModule,
    NgDatepickerModule,
    TextMaskModule,
    UiSwitchModule,
    DragulaModule,
    ClickOutsideModule,
    HttpClientModule,
    ChartsModule,
    HttpModule,
    InputTrimModule
  ],
  declarations: [
    ClickableLinks,
    LookupAutocompleteComponent,
    BasePopupComponent,
    TableFilterComponent,
    DisabledInlineDerective,
    TableSorterDerective,
    SetClassDirective,
    LargeTextContainerComponent,
    CommentsComponent,
    LookupColorsComponent,
    LookupComponent,
    CustomEventListener,
    PanelsRowDirective,
    UploaderComponent,
    LookupAutocompleteMultiselectComponent,
    BaseLookupComponent,
    SetHTMLDirective,
    AutofocusDirective,
    MaxLength,
    ManageColumnsModalComponent,
    OverflowDirective
  ],
  exports: [
    ClickableLinks,
    NgDatepickerModule,
    LookupAutocompleteComponent,
    TableSorterDerective,
    DisabledInlineDerective,
    FormsModule,
    InlineEditorModule,
    DataTableModule,
    BasePopupComponent,
    TableFilterComponent,
    LargeTextContainerComponent,
    LookupColorsComponent,
    LookupComponent,
    SetClassDirective,
    CustomEventListener,
    CommentsComponent,
    NgxEditorModule,
    PanelsRowDirective,
    FileUploadModule,
    UploaderComponent,
    LookupAutocompleteMultiselectComponent,
    BaseLookupComponent,
    RouterModule,
    SetHTMLDirective,
    AutofocusDirective,
    TextMaskModule,
    MaxLength,
    UiSwitchModule,
    ManageColumnsModalComponent,
    DragulaModule,
    OverflowDirective,
    ClickOutsideModule,
    HttpClientModule,
    ChartsModule,
    HttpModule,
    InputTrimModule
  ]
})
export class SharedModule {}
