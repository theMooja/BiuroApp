import { Injectable } from '@angular/core';
import { IClient, IClientMonthly } from "./../../../../electron/src/interfaces";

@Injectable({
  providedIn: 'root'
})
export class ClientDataService {

  constructor() { }

  async getMonthlies(): Promise<IClientMonthly[]> {
    let monthlies = await window.electron.getClientsMonthlies();

    return monthlies;
  }
}
