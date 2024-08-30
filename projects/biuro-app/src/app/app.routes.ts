import { Routes } from '@angular/router';
import { HomeComponent } from './view/home/home.component';
import { SettingsComponent } from './view/settings/settings.component';
import { MarchSetupComponent } from './view/march-setup/march-setup.component';
import { UserSetupComponent } from './view/user-setup/user-setup.component';
import { LoginComponent } from './view/login/login.component';

export const routes: Routes = [
    { path: 'home', component: HomeComponent },
    { path: 'settings', component: SettingsComponent },
    { path: 'marchSetup', component: MarchSetupComponent },
    { path: 'userSetup', component: UserSetupComponent },
    { path: '', redirectTo: '/login', pathMatch: 'full' },
    { path: 'login', component: LoginComponent},

];
