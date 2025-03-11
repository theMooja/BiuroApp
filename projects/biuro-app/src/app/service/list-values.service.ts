import { Injectable } from '@angular/core';
import { IListValue } from '../../../../electron/src/interfaces';

@Injectable({
  providedIn: 'root'
})
export class ListValuesService {

  constructor() { }

  private listValues = new Map<string, IListValue[]>();

  async get(target: string): Promise<IListValue[]> {
    if (!this.listValues.has(target)) {
      let values = await window.electron.getListValues(target) as IListValue[]
      this.listValues.set(target, values.map(x => {
        return { text: x.text, value: x.value, sequence: x.sequence, target: x.target };
      }));
    }

    return this.listValues.get(target) || [];
  }
}
