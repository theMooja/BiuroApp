import { Routes } from '@angular/router';
import { HomeComponent } from './view/home/home.component';
import { SettingsComponent } from './view/settings/settings.component';
import { MarchSetupComponent } from './view/march-setup/march-setup.component';
import { UserSetupComponent } from './view/user-setup/user-setup.component';
import { LoginComponent } from './view/login/login.component';
import { MinimalComponent } from './view/minimal/minimal.component';
import { userResolver } from './service/user-data.service';
import { appVersionResolver, lastUserNameResolver } from './service/local-storage.service';
import { ReportsComponent } from './view/reports/reports.component';
import { ClientSetupComponent } from './view/client-setup/client-setup.component';
import { InfoComponent } from './view/info/info.component';

export const routes: Routes = [
    { path: 'home', component: HomeComponent },
    { path: 'settings', component: SettingsComponent },
    { path: 'info', component: InfoComponent },
    { path: 'marchSetup', component: MarchSetupComponent },
    { path: 'userSetup', component: UserSetupComponent },
    { path: 'reports', component: ReportsComponent },
    { path: 'clientSetup', component: ClientSetupComponent },
    { path: '', redirectTo: '/login', pathMatch: 'full' },
    {
        path: 'login', component: LoginComponent, resolve: {
            users: userResolver,
            lastUserName: lastUserNameResolver,
            appVersion: appVersionResolver
        }
    },
    { path: 'minimal', component: MinimalComponent }
];
