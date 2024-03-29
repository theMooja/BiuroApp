import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TestDataService {

  constructor() { }

  async getString(): Promise<String> {
    return await window.electron.testData();
  }
}
