import { Injectable } from '@angular/core';
import { IClient, IClientMonthly } from "./../../../../electron/src/interfaces";

@Injectable({
  providedIn: 'root'
})
export class ClientDataService {

  constructor() { }

  // async getClientsMonthly(year: number, month: number): Promise<IClient[]> {
  //   return await window.electron.getClientsMonthly(year, month);
  // }

  // async updateClient(client: string, data: any) {
  //   return await window.electron.updateClient(client, data);
  // }

  // async updateMarchValue(client: IClientMonthly, idx: number, value: number){
  //   return await window.electron.updateMarchValue(client, idx, value);
  // }
}
