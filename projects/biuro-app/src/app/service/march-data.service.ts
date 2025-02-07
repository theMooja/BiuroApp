import { Injectable } from '@angular/core';
import { IMarchEntity, IStopperEntity } from "./../../../../electron/src/interfaces";
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MarchDataService {

  private runningMarch: Subject<IMarchEntity> = new Subject();
  public runningMarch$ = this.runningMarch.asObservable();

  constructor() { }

  async startMarch(march: IMarchEntity, clientName: string) {
    this.runningMarch.next(march);
    console.log(march);
    window.electron.setTitle('▶ ' + clientName);
  }

  async updateMarchValue(march: IMarchEntity) {
    await window.electron.updateMarchValue(march);
  }

  async addStopper(march: IMarchEntity, time: number, from: Date) : Promise<IStopperEntity> {
    window.electron.setTitle('BiuroApp');
    return await window.electron.addStopper(march, time, from);
  }
}
