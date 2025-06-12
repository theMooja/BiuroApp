import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SystemService {

  constructor() { }

  async pickFolder(): Promise<string> {
    return await window.electron.pickFolder() as string;
  }

  async openFolder(path: string) {
    await window.electron.openFolder(path);
  }

  async pickFile(): Promise<string> {
    return await window.electron.pickFile() as string;
  }

  async openFile(path: string) {
    await window.electron.openFile(path);
  }

  async convertFromOEM852(data: string): Promise<string> {
    return await window.electron.convertFromOEM852(data) as string;
  }
}
