import { Injectable } from '@angular/core';
import { IClient } from "./../../../../electron/src/interfaces";

@Injectable({
  providedIn: 'root'
})
export class ClientDataService {

  constructor() { }

  async getClientsMonthly(year: number, month: number): Promise<IClient[]> {
    return await window.electron.getClientsMonthly(year, month);
  }
}
