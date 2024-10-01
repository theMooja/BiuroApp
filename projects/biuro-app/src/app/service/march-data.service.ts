import { Injectable } from '@angular/core';
import { IMarchTemplate, MarchValue } from "./../../../../electron/src/interfaces";

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

  async updateMarchValue(marchValue: MarchValue) {
    window.electron.updateMarchValue(marchValue);
  }

  async addStopper(mv: MarchValue, seconds: number, from: Date) {
    window.electron.addStopper(mv, seconds, from);
  }
}
