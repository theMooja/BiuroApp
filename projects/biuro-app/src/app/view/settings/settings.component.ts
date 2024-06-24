import { Component } from '@angular/core';
import { MarchSetupComponent } from '../march-setup/march-setup.component';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [MarchSetupComponent, MatButtonModule, RouterLink, RouterOutlet],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss'
})
export class SettingsComponent {

}
