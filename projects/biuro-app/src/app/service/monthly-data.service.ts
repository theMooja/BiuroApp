import { Injectable } from '@angular/core';
import { IClientEntity, IMarchEntity, IMonthlyEntity, INoteEntity } from '../../../../electron/src/interfaces';

@Injectable({
  providedIn: 'root'
})
export class MonthlyDataService {

  constructor() { }

  async getMonthlies(month: number, year: number): Promise<IMonthlyEntity[]> {
    let monthlies = await window.electron.getMonthlies(year, month);
    return monthlies;
  }

  async getMonthly(id: number): Promise<IMonthlyEntity> {
    let monthly = await window.electron.getMonthly(id);
    return monthly;
  }

  async updateNote(note: INoteEntity) {
    await window.electron.updateNote(note);
  }

  async deleteNote(note: INoteEntity) {
    await window.electron.deleteNote(note);
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

  async updateInfo(entity: IMonthlyEntity) {
    await window.electron.updateInfo(entity);
  }
}
