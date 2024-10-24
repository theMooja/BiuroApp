import { Injectable } from '@angular/core';
import { IListValue } from '../../../../electron/src/interfaces';

@Injectable({
  providedIn: 'root'
})
export class ListValuesService {

  constructor() { }

  private listValues = new Map<string, string[]>();

  async get(target: string): Promise<string[]> {
    if (!this.listValues.has(target)) {
      let values = await window.electron.getListValues(target) as IListValue[]
      this.listValues.set(target, values.map(x => x.text));
    }

    return this.listValues.get(target) || [];
  }
}
