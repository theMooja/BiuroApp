import { Component } from '@angular/core';
import { NotificationsService } from 'angular2-notifications';
import { SettingsDataService } from '../../service/settings-data.service';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormField, MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-app-setup',
  standalone: true,
  imports: [MatButtonModule, MatIconModule, MatInputModule, MatFormField, FormsModule],
  templateUrl: './app-setup.component.html',
  styleUrl: './app-setup.component.scss'
})
export class AppSetupComponent {
  networkDiscName: string = '';

  constructor(private notificationsService: NotificationsService, private settingsService: SettingsDataService) { }

  async ngOnInit() {
    this.networkDiscName = await this.settingsService.getSettings('networkDiscName');
  }

  async saveNetworkDiscName() {
    await this.settingsService.setSettings('networkDiscName', this.networkDiscName).then((res) => {
      this.notificationsService.success('Ustawienia zostały zapisane', res);
    }, () => {
      this.notificationsService.error('Nie można zapisać ustawienia');
    });
  }
}
