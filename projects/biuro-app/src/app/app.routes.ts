import { Routes } from '@angular/router';
import { HomeComponent } from './view/home/home.component';
import { SettingsComponent } from './view/settings/settings.component';

export const routes: Routes = [
    { path: 'home', component: HomeComponent },
    { path: 'settings', component: SettingsComponent },
    { path: '',   redirectTo: '/home', pathMatch: 'full' },
];
