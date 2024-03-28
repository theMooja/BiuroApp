import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TestDataService {

  constructor() { }

  getString(): String {
    return window.electron.testData();
  }
}
