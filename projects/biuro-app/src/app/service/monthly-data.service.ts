import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class MonthlyDataService {

  constructor() { }

  async getMonthlies(month: number, year: number) {
    let monthlies = await window.electron.getMonthlies(year, month);
    return monthlies;
  }

  async updateNotes(monthlyId: number, notes: string) {
    await window.electron.updateNotes(monthlyId, notes);
  }
}
