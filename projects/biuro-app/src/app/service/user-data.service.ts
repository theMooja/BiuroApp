import { inject, Injectable } from '@angular/core';
import { IUser } from '../../../../electron/src/interfaces';
import { ActivatedRouteSnapshot, ResolveFn, RouterStateSnapshot } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class UserDataService {
  user?: IUser;
  data: IUser[] = [];


  constructor() { }

  async getUsers(refresh: boolean = false): Promise<IUser[]> {
    if (this.data.length === 0 || refresh)
      this.data = await window.electron.getUsers();
    return this.data;
  }

  async saveUser(user: IUser) {
    return await window.electron.saveUser(user);
  }

  setLoggedUser(user: IUser) {
    this.user = user;
  }
}

export const userResolver: ResolveFn<IUser[]> = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot,
) => {
  return inject(UserDataService).getUsers();
};
