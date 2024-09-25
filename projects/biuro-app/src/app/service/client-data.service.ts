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
}
