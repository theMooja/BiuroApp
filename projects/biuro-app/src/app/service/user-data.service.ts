import { Injectable } from '@angular/core';
import { IUser } from '../../../../electron/src/interfaces';

@Injectable({
  providedIn: 'root'
})
export class UserDataService {

  constructor() { }

  async getUsers(): Promise<IUser[]> {
    return await window.electron.getUsers();
  }

  async saveUser(user: IUser) {
    return await window.electron.saveUser(user);
  }
}
