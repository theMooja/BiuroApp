import { Injectable, signal, WritableSignal } from '@angular/core';
import { IClientEntity, IMarchEntity, IMonthlyEntity, INoteEntity, PayloadOperation } from '../../../../electron/src/interfaces';
import { NotificationsService } from 'angular2-notifications';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MonthlyDataService {

  monthlies: WritableSignal<IMonthlyEntity[]> = signal([]);

  private noteChange: Subject<void> = new Subject();
  public noteChange$ = this.noteChange.asObservable();

  constructor(private notificationsService: NotificationsService) {
    window.electron.onMonthlyTrigger((monthly, operation) => this.handleTrigger(monthly, operation));
  }

  private emitMonthly(data: IMonthlyEntity[]) {
    this.monthlies.set([...data]);
  }

  handleTrigger(monthly: IMonthlyEntity, operation: string) {
    console.log('handleTrigger', monthly, operation);
    const current = [...this.monthlies()];

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
        this.emitMonthly(current.filter(m => m.id !== monthly.id));
        return;
      case PayloadOperation.INSERT:
        current.push(monthly);
        break;
    }

    this.emitMonthly(current);
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
    let res = await window.electron.updateNote(note);
    this.noteChange.next();
    return res as INoteEntity;
  }

  async deleteNote(note: INoteEntity) {
    await window.electron.deleteNote(note);
  }

  async getLatestMonthly(client: IClientEntity): Promise<IMonthlyEntity> {
    return await window.electron.getLatestMonthly(client);
  }

  async updateMarches(monthly: IMonthlyEntity, marches: IMarchEntity[]) {
    await window.electron.updateMarches(monthly.id, marches).then((res) => {
      this.notificationsService.success('Zapisano marsz', monthly.client.name);
    }, (err) => {
      this.notificationsService.error('Nie można zapisać marszu', err.message);
    });
  }

  async recreateMonthlies(year: number, month: number, monthlies: IMonthlyEntity[]) {
    await window.electron.recreateMonthlies(year, month, monthlies);
  }

  async updateInfo(entity: IMonthlyEntity) {
    await window.electron.updateInfo(entity).then((res) => {
      this.notificationsService.success('Zapisano informacje', entity.client.name);
    }, (err) => {
      this.notificationsService.error('Nie można zapisać informacji', err.message);
    });;
  }
}
