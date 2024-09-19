import { Injectable } from '@angular/core';
import { IMarchTemplate } from "./../../../../electron/src/interfaces";

@Injectable({
  providedIn: 'root'
})
export class MarchDataService {

  constructor() { }

  // async createTemplate(value: any) {
  //   window.electron.saveMarchTemplate(value)
  // }

  // async findTemplates(filter?: string): Promise<IMarchTemplate[]> { 
  //   return await window.electron.findMarchTemplates(filter);
  // }

}
