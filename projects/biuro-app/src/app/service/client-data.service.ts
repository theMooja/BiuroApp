import { Injectable } from '@angular/core';
import { IClientEntity } from "./../../../../electron/src/interfaces";

@Injectable({
  providedIn: 'root'
})
export class ClientDataService {
  data: IClientEntity[] = [];

  constructor() { }

  async getClients(refresh: boolean = false): Promise<IClientEntity[]> {
    if (refresh || this.data.length === 0)
      this.data = await window.electron.getClients();
    return this.data;
  }
}
