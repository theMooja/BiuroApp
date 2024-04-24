import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class MarchDataService {

  constructor() { }

  async createTemplate(value: any) {
    window.electron.createMarchTemplate(value)
  }
}
