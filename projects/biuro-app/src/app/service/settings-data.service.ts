import { Injectable } from '@angular/core';
import { NotificationsService } from 'angular2-notifications';

@Injectable({
  providedIn: 'root'
})
export class SettingsDataService {

  constructor() { }

  async getSettings(key: string): Promise<string> {
    return await window.electron.getAppSettings(key);
  }

  async setSettings(key: string, value: string): Promise<string> {
    return await window.electron.setAppSettings(key, value);
  }
}
