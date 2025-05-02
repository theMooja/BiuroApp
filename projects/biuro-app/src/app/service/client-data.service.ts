import { Injectable } from '@angular/core';
import { IClientEntity } from "./../../../../electron/src/interfaces";
import { NotificationsService } from 'angular2-notifications';

@Injectable({
  providedIn: 'root'
})
export class ClientDataService {
  data: IClientEntity[] = [];

  constructor(private notificationsService: NotificationsService) { }

  async getClients(refresh: boolean = false): Promise<IClientEntity[]> {
    if (refresh || this.data.length === 0)
      this.data = await window.electron.getClients();
    return this.data;
  }

  async saveClient(client: IClientEntity): Promise<IClientEntity> {
    let saved = await window.electron.saveClient(client).then(async (res) => {
      this.notificationsService.success('Klient został zapisany', res.name);
      await this.getClients(true);
      return res;
    }, (err) => {
      this.notificationsService.error('Nie można zapisać klienta', err.message);
      return null;
    });

    return saved;
  }

  async syncFakturowniaIds(): Promise<void> {
    await window.electron.syncFakturowniaIds().then(async () => {
      this.notificationsService.success('Pobrano indentyfikatory fakturowni');
    }, (err) => {
      this.notificationsService.error('Błąd', err.message);
    });
  }
}