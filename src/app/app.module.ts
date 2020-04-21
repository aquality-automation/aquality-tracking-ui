import { NgModule } from '@angular/core';
import { BrowserXhr, HttpModule } from '@angular/http';
import { HashLocationStrategy, LocationStrategy, CommonModule } from '@angular/common';
import { CookieService, CookieOptions } from 'angular2-cookie/core';
import { appRouting } from './app.routing';
import { AppComponent } from './app.component';
import { NgProgressModule, NgProgressBrowserXhr } from 'ngx-progressbar';
import { AdministrationModule } from './pages/administration/main/administration.module';
import { NotFoundComponent } from './pages/general/not-found/not-found.component';
import { LoginComponent } from './pages/general/authorization/Login.component';
import { LoginGuard, AuthGuard } from './shared/guards/login-guard.service';
import { GlobalDataService } from './services/globaldata.service';
import { SimpleRequester } from './services/simple-requester';
import { UserService } from './services/user.services';
import { ProjectModule } from './pages/project/project.module';
import { SimpleNotificationsModule } from 'angular2-notifications';
import { AuditModule } from './pages/audit/audit.module';
import { AuditService } from './services/audits.service';
import { CalcHeightsDirective } from './derectives/bodyHeight.derective';
import { UserSettingsComponent } from './pages/general/user-settings/user-settings.component';
import { CustomerModule } from './pages/customer/customer.module';
import { CustomerService } from './services/customer.service';
import { ResultViewCanDeactivate } from './shared/guards/can-deactivate-guard.service';
import { GuardService } from './shared/guards/guard.service';
import { LoaderComponent } from './elements/loader/loader.component';
import { FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { MatMenuModule, MatIconModule, MatListModule, MatButtonModule } from '@angular/material';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { UiSwitchModule } from 'ngx-ui-switch';

@NgModule({
  declarations: [
    AppComponent,
    NotFoundComponent,
    UserSettingsComponent,
    LoginComponent,
    CalcHeightsDirective,
    LoaderComponent,
  ],
  imports: [
    FormsModule,
    CommonModule,
    BrowserAnimationsModule,
    HttpModule,
    HttpClientModule,
    AdministrationModule,
    MatMenuModule,
    MatIconModule,
    MatListModule,
    MatButtonModule,
    FontAwesomeModule,
    UiSwitchModule,
    appRouting,
    ProjectModule,
    AuditModule,
    CustomerModule,
    NgProgressModule,
    SimpleNotificationsModule.forRoot()
  ],
  providers: [
    ResultViewCanDeactivate,
    GuardService,
    AuthGuard,
    CookieService,
    LoginGuard,
    GlobalDataService,
    SimpleRequester,
    UserService,
    AuditService,
    CustomerService,
    { provide: BrowserXhr, useClass: NgProgressBrowserXhr },
    { provide: LocationStrategy, useClass: HashLocationStrategy },
    { provide: CookieOptions, useValue: {} }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
