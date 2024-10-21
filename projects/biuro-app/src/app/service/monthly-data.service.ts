import { Injectable } from '@angular/core';
import { IClientEntity, IMarchEntity, IMonthlyEntity } from '../../../../electron/src/interfaces';

@Injectable({
  providedIn: 'root'
})
export class MonthlyDataService {

  constructor() { }

  async getMonthlies(month: number, year: number): Promise<IMonthlyEntity[]> {
    let monthlies = await window.electron.getMonthlies(year, month);
    return monthlies;
  }

  async updateNotes(monthlyId: number, notes: string) {
    await window.electron.updateNotes(monthlyId, notes);
  }

  async getLatestMonthly(client: IClientEntity): Promise<IMonthlyEntity> {
    return await window.electron.getLatestMonthly(client);
  }

  async updateMarches(monthlyId: number, marches: IMarchEntity[]) {
    await window.electron.updateMarches(monthlyId, marches);
  }

  async recreateMonthlies(year: number, month: number, monthlies: IMonthlyEntity[]) {
    await window.electron.recreateMonthlies(year, month, monthlies);
  }
}
