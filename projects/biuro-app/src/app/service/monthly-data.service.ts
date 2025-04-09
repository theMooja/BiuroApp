import { Injectable, signal, WritableSignal } from '@angular/core';
import { IClientEntity, IMarchEntity, IMonthlyEntity, INoteEntity, PayloadOperation } from '../../../../electron/src/interfaces';
import { ActivatedRouteSnapshot, ResolveFn, RouterStateSnapshot } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class MonthlyDataService {

  monthlies: WritableSignal<IMonthlyEntity[]> = signal([]);


  constructor() {
    window.electron.onMonthlyTrigger((monthly, operation) => this.handleTrigger(monthly, operation));
  }

  private emit(data: IMonthlyEntity[]) {
    this.monthlies.set([...data]);
  }

  handleTrigger(monthly: IMonthlyEntity, operation: string) {
    console.log('handleTrigger', monthly, operation);
    const current = this.monthlies();

    switch (operation) {
      case PayloadOperation.UPDATE: {
        const index = current.findIndex(m => m.id === monthly.id);
        if (index !== -1) {
          current[index] = monthly;
        } else {
          current.push(monthly);
        }
        break;
      }
      case PayloadOperation.DELETE:
        this.emit(current.filter(m => m.id !== monthly.id));
        return;
      case PayloadOperation.INSERT:
        current.push(monthly);
        break;
    }

    this.emit(current);
  }

  async getMonthlies(month: number, year: number): Promise<IMonthlyEntity[]> {
    let monthlies = await window.electron.getMonthlies(year, month);
    this.monthlies.set(monthlies);
    return monthlies;
  }

  async getMonthly(id: number): Promise<IMonthlyEntity> {
    let monthly = await window.electron.getMonthly(id);

    const current = this.monthlies(); // get current value
    const index = current.findIndex(m => m.id === id);

    if (index !== -1) {
      // Replace the item immutably
      const updated = [...current];
      updated[index] = monthly;
      this.monthlies.set(updated);
    } else {
      // Optionally: insert if not found
      this.monthlies.set([...current, monthly]);
    }

    return monthly;
  }

  async updateNote(note: INoteEntity): Promise<INoteEntity> {
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
