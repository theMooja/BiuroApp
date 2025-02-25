import { Injectable } from '@angular/core';
import { IClientEntity, IMarchEntity, IMonthlyEntity, INoteEntity } from '../../../../electron/src/interfaces';
import { ActivatedRouteSnapshot, ResolveFn, RouterStateSnapshot } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class MonthlyDataService {

  monthlies: IMonthlyEntity[] = [];

  constructor() { }

  async getMonthlies(month: number, year: number): Promise<IMonthlyEntity[]> {
    let monthlies = await window.electron.getMonthlies(year, month);
    this.monthlies = monthlies;
    return monthlies;
  }

  async getMonthly(id: number): Promise<IMonthlyEntity> {
    let monthly = await window.electron.getMonthly(id);
    let index = this.monthlies.findIndex(m => m.id === id);
    this.monthlies[index] = monthly;
    return monthly;
  }

  async updateNote(note: INoteEntity) : Promise<INoteEntity> {
    return await window.electron.updateNote(note);
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
