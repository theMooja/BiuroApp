import { Injectable } from '@angular/core';
import { IStopper } from "./../../../../electron/src/interfaces";


@Injectable({
  providedIn: 'root'
})
export class StopperDataService {

  constructor() { }

  async addTime(data: IStopper) {
    window.electron.addTime(data);
  }
}
