import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ClickOutsideModule } from 'ng-click-outside';
import { RouterModule } from '@angular/router';
import { SingleLineBarChartComponent } from '../elements/single-line-bar-chart/single-line-bar-chart.component';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { ChartsModule } from 'ng2-charts';
import { RegexpTesterComponent } from '../elements/regexp-tester/regexp-tester.component';
import { HighliteTextDirective } from '../derectives/highlite-text.derective';
import { SafePipe } from '../pipes/safe.pipe';
import { UploaderComponent } from '../elements/uploader/uploader.element';
import { FileUploadModule } from 'ng2-file-upload';
import { AppElementsModule } from 'src/app/elements/elements.module';
import { DragulaModule } from 'ng2-dragula';
import { NgxWigModule } from 'ngx-wig';
import {TestingSupportModule} from '../testing-support/testing-support.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    FontAwesomeModule,
    ClickOutsideModule,
    RouterModule,
    TooltipModule.forRoot(),
    ChartsModule,
    FileUploadModule,
    AppElementsModule,
    DragulaModule.forRoot(),
    NgxWigModule
  ],
  declarations: [
    SingleLineBarChartComponent,
    RegexpTesterComponent,
    HighliteTextDirective,
    SafePipe,
    UploaderComponent,
  ],
  exports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    FontAwesomeModule,
    SingleLineBarChartComponent,
    ClickOutsideModule,
    RouterModule,
    TooltipModule,
    ChartsModule,
    RegexpTesterComponent,
    HighliteTextDirective,
    SafePipe,
    UploaderComponent,
    FileUploadModule,
    AppElementsModule,
    DragulaModule,
    NgxWigModule,
    TestingSupportModule
  ]
})
export class SharedModule { }
