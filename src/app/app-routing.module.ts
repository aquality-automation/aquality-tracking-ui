import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginComponent } from './pages/general/authorization/Login.component';
import { NotFoundComponent } from './pages/general/not-found/not-found.component';
import { UserSettingsComponent } from './pages/general/user-settings/user-settings.component';
import { LoginGuard, AuthGuard } from './shared/guards/login-guard.service';


const routes: Routes = [
  { path: '', component: LoginComponent, canActivate: [LoginGuard] },
  { path: 'settings', component: UserSettingsComponent, canActivate: [AuthGuard] },
  { path: '**', component: NotFoundComponent, canActivate: [AuthGuard] }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
