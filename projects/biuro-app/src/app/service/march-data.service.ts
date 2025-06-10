import { inject, Injectable } from '@angular/core';
import { IMarchEntity, IStopperEntity } from "./../../../../electron/src/interfaces";
import { Subject } from 'rxjs';
import { NotificationsService } from 'angular2-notifications';

@Injectable({
  providedIn: 'root'
})
export class MarchDataService {

  private runningMarch: Subject<IMarchEntity> = new Subject();
  public runningMarch$ = this.runningMarch.asObservable();

  private marchChange: Subject<void> = new Subject();
  public marchChange$ = this.marchChange.asObservable();

  private notificationsService = inject(NotificationsService);

  constructor() { }

  async marchChanged() {
    this.marchChange.next();
  }

  async updateMarchValue(march: IMarchEntity) {
    await window.electron.updateMarchValue(march);
  }

  async addStopper(march: IMarchEntity, time: number, from: Date): Promise<IStopperEntity> {
    window.electron.setTitle('Ostrze');
    return await window.electron.addStopper(march, time, from);
  }

  async updateStopper(stopper: IStopperEntity): Promise<IStopperEntity> {
    return await window.electron.updateStopper(stopper).then(updatedStopper => {
      this.notificationsService.success('Zapisano stoper');
      return updatedStopper;
    });
  }
}
