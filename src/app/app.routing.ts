import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginComponent } from './pages/general/authorization/Login.component';
import { NotFoundComponent } from './pages/general/not-found/not-found.component';
import { LoginGuard } from './pages/general/authorization/Login.guard';
import { UserSettingsComponent } from './pages/general/user-settings/user-settings.component';
import { AuthGuard } from './shared/guards/auth-guard.service';

const appRoutes: Routes = [
  { path: '', component: LoginComponent, canActivate: [LoginGuard] },
  { path: 'settings', component: UserSettingsComponent, canActivate: [AuthGuard] },
  { path: '**', component: NotFoundComponent, canActivate: [AuthGuard] }
];

export const appRouting: ModuleWithProviders = RouterModule.forRoot(appRoutes);
