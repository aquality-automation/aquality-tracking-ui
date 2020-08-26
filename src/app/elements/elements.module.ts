import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { TableFilterComponent } from './table-filter/table-filter.component';
import { DataTableModule } from './table-filter/data-table/DataTableModule';
import { ManageColumnsModalComponent } from './table-filter/manage-columns-modal/manage-columns-modal.component';
import { TableSorterDerective } from './table-filter/tf-sorter.derective';
import { ListToCsvService } from 'src/app/services/listToCsv.service';
import { TransformationsService } from 'src/app/services/transformations.service';
import { LookupComponent } from './lookup/simple/lookup.component';
import { CustomEventListener } from 'src/app/derectives/custom-event-listener.derective';
import { SetClassDirective } from 'src/app/derectives/set-class.derective';
import { LookupAutocompleteComponent } from './lookup/autocomplete/lookupAutocomplete.component';
import { LookupColorsComponent } from './lookup/colored/lookupColors.component';
import { LookupAutocompleteMultiselectComponent } from './lookup/multiselect/lookupAutocompleteMultiselect.component';
import { InlineEditorComponent } from './inline-editor/inline-editor.component';
import { LargeTextContainerComponent } from './containers/largeTextContainer.component';
import { AttachmentInlineComponent } from './attachment-inline/attachment-inline.component';
import { ColorDotsComponent } from './color-dots/color-dots.component';
import { TristateCheckboxComponent } from './tristate-checkbox/tristate-checkbox.component';
import { ModalComponent } from './modals/modal.component';
import { MatMenuModule } from '@angular/material/menu';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DragulaModule } from 'ng2-dragula';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ClickOutsideModule } from 'ng-click-outside';
import { CommentsComponent } from './comments/comments.component';
import { SetHTMLDirective } from '../derectives/show-html-data.derective';
import { RouterModule } from '@angular/router';
import { NgxWigModule } from 'ngx-wig';
import { LabeledInputComponent } from './labeled-element/labeled-input/labeled-input.component';
import { DatepickerComponent } from './datepicker/datepicker.component';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core';
import { NgxMaskModule, IConfig } from 'ngx-mask';
import { NumberRangeComponent } from './number-range/number-range.component';
import { AttachmentModalComponent } from './lookup/attachment-modal/attachment-modal.component';

const maskConfigFunction: () => Partial<IConfig> = () => {
  return {
    validation: true,
  };
};

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule,
    DataTableModule,
    MatMenuModule,
    FontAwesomeModule,
    ClickOutsideModule,
    DragulaModule.forRoot(),
    NgxMaskModule.forRoot(maskConfigFunction),
    NgxWigModule,
    MatDatepickerModule,
    MatMenuModule,
    MatIconModule,
    MatListModule,
    MatButtonModule,
    MatSlideToggleModule,
    MatFormFieldModule,
    MatInputModule,
    MatNativeDateModule,
  ],
  declarations: [
    DatepickerComponent,
    LookupComponent,
    CustomEventListener,
    SetClassDirective,
    LookupAutocompleteComponent,
    LookupColorsComponent,
    LookupAutocompleteMultiselectComponent,
    InlineEditorComponent,
    LargeTextContainerComponent,
    AttachmentInlineComponent,
    ColorDotsComponent,
    TristateCheckboxComponent,
    ModalComponent,
    TableSorterDerective,
    TableFilterComponent,
    ManageColumnsModalComponent,
    CommentsComponent,
    SetHTMLDirective,
    LabeledInputComponent,
    NumberRangeComponent,
    AttachmentModalComponent
  ],
  exports: [
    DatepickerComponent,
    InlineEditorComponent,
    LookupAutocompleteMultiselectComponent,
    LookupColorsComponent,
    LookupAutocompleteComponent,
    LookupComponent,
    TableFilterComponent,
    AttachmentInlineComponent,
    ModalComponent,
    CommentsComponent,
    LargeTextContainerComponent,
    SetHTMLDirective,
    LabeledInputComponent,
    MatIconModule,
    MatListModule,
    MatButtonModule,
    MatSlideToggleModule,
    MatFormFieldModule,
    MatInputModule,
    MatNativeDateModule,
    NgxMaskModule,
    NumberRangeComponent,
    AttachmentModalComponent
  ],
  providers: [
    ListToCsvService,
    TransformationsService,
    DatePipe
  ]
})
export class AppElementsModule { }
