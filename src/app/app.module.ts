import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HttpClientModule } from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service';
import { httpInterceptorProviders } from './services/interceptors';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { NgProgressModule } from 'ngx-progressbar';
import { LoaderComponent } from './elements/loader/loader.component';
import { SimpleNotificationsModule } from 'angular2-notifications';
import { GlobalDataService } from './services/globaldata.service';
import { AuthService } from './services/auth/auth.service';
import { UserService } from './services/user/user.services';
import { ProjectService } from './services/project/project.service';
import { ApplicationSettingsService } from './services/application-settings/application-settings.service';
import { PermissionsService } from './services/permissions/current-permissions.service';
import { CommonModule } from '@angular/common';
import { NotFoundComponent } from './pages/general/not-found/not-found.component';
import { UserSettingsComponent } from './pages/general/user-settings/user-settings.component';
import { LoginComponent } from './pages/general/authorization/Login.component';
import { CalculateHeightDerective } from './derectives/calculate-height.derective';
import { LoginGuard, AuthGuard } from './shared/guards/login-guard.service';
import { FormsModule } from '@angular/forms';
import { ProjectModule } from './pages/project/project.module';
import { DragulaModule } from 'ng2-dragula';
import { AuditModule } from './pages/audit/audit.module';
import { CustomerModule } from './pages/customer/customer.module';
import { AdministrationModule } from './pages/administration/main/administration.module';

@NgModule({
  declarations: [
    AppComponent,
    NotFoundComponent,
    UserSettingsComponent,
    LoginComponent,
    CalculateHeightDerective,
    LoaderComponent
  ],
  imports: [
    ProjectModule,
    AuditModule,
    CustomerModule,
    AdministrationModule,
    CommonModule,
    BrowserModule,
    FormsModule,
    HttpClientModule,
    AppRoutingModule,
    FontAwesomeModule,
    NgProgressModule,
    BrowserAnimationsModule,
    SimpleNotificationsModule.forRoot(),
    DragulaModule.forRoot()
  ],
  providers: [
    CookieService,
    httpInterceptorProviders,
    GlobalDataService,
    AuthService,
    UserService,
    ProjectService,
    ApplicationSettingsService,
    PermissionsService,
    LoginGuard,
    AuthGuard
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
