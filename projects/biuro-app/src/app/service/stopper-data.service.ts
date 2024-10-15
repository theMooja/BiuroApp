import { Injectable } from '@angular/core';
import { IStopperEntity } from "./../../../../electron/src/interfaces";


@Injectable({
  providedIn: 'root'
})
export class StopperDataService {

  constructor() { }

  async addTime(data: IStopperEntity) {
  }
}
