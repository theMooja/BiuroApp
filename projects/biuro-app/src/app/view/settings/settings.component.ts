import { Component } from '@angular/core';
import { MarchSetupComponent } from '../march-setup/march-setup.component';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [MarchSetupComponent],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss'
})
export class SettingsComponent {

}
