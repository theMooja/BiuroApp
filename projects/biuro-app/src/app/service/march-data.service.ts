import { Injectable } from '@angular/core';
import { IMarchEntity } from "./../../../../electron/src/interfaces";
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MarchDataService {

  private runningMarch: Subject<IMarchEntity> = new Subject();
  public runningMarch$ = this.runningMarch.asObservable();

  constructor() { }

  async startMarch(march: IMarchEntity) {
    this.runningMarch.next(march);
  }

  async updateMarchValue(march: IMarchEntity) {
    await window.electron.updateMarchValue(march);
  }

  async addStopper(march: IMarchEntity, time: number, from: Date){
    await window.electron.addStopper(march, time, from);
  }
}
