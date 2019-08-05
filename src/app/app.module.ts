import { NgModule } from '@angular/core';
import { BrowserModule,  } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import { HttpModule, BrowserXhr } from '@angular/http';
import { HashLocationStrategy, LocationStrategy } from '@angular/common';
import { CookieService, CookieOptions } from 'angular2-cookie/core';
import { appRouting } from './app.routing';
import { AuthGuard } from './shared/guards/auth-guard.service';
import { AppComponent } from './app.component';
import { NgProgressModule, NgProgressBrowserXhr } from 'ngx-progressbar';
import { AdministrationModule } from './pages/administration/administration.module';
import { NotFoundComponent } from './pages/general/not-found/not-found.component';
import { LoginComponent } from './pages/general/authorization/Login.component';
import { LoginGuard } from './pages/general/authorization/Login.guard';
import { GlobalDataService } from './services/globaldata.service';
import { SimpleRequester } from './services/simple-requester';
import { UserService } from './services/user.services';
import { ProjectModule } from './pages/project/project.module';
import { SimpleNotificationsModule } from 'angular2-notifications';
import { SharedModule } from './shared/shared.module';
import { AuditModule } from './pages/audit/audit.module';
import { AuditService } from './services/audits.service';
import { CalcHeightsDirective } from './derectives/bodyHeight.derective';
import { UserSettingsComponent } from './pages/general/user-settings/user-settings.component';
import { CustomerModule } from './pages/customer/customer.module';
import { CustomerService } from './services/customer.service';
import { PendingChanges } from './shared/guards/can-deactivate-guard.service';

@NgModule({
  imports: [
    BrowserAnimationsModule,
    AdministrationModule,
    BrowserModule,
    FormsModule,
    appRouting,
    HttpModule,
    ProjectModule,
    AuditModule,
    CustomerModule,
    NgProgressModule,
    SharedModule,
    SimpleNotificationsModule.forRoot()
  ],
  declarations: [
    AppComponent,
    NotFoundComponent,
    UserSettingsComponent,
    LoginComponent,
    CalcHeightsDirective
  ],
  providers: [
    PendingChanges,
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
  bootstrap: [ AppComponent ]
})
export class AppModule {}
