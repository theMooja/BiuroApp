import { Injectable } from '@angular/core';
import { IClient, ClientMonthly } from "./../../../../electron/src/interfaces";

@Injectable({
  providedIn: 'root'
})
export class ClientDataService {

  constructor() { }

  async getMonthlies(year: number, month: number): Promise<ClientMonthly[]> {
    let monthlies = await window.electron.getClientsMonthlies(year, month);

    return monthlies;
  }

  async recreateMonthlies(year: number, month: number, monthlies: ClientMonthly[]) {
    await window.electron.recreateMonthlies(year, month, monthlies);
  }

  async updateMonthly(client: ClientMonthly) {
    await window.electron.updateMonthly(client);
  }
}
