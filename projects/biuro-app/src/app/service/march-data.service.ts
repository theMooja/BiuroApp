import { Injectable } from '@angular/core';
import { IMarchTemplate } from "./../../../../electron/src/interfaces";

@Injectable({
  providedIn: 'root'
})
export class MarchDataService {

  constructor() { }

  async getTemplates(): Promise<IMarchTemplate[]> {
    let templates = window.electron.getMarchTemplates();

    return templates;
  }

  async saveTemplate(template: IMarchTemplate) {
    window.electron.saveMarchTemplate(template);
  }
}
