import { inject, Injectable } from '@angular/core';
import { IUserEntity } from '../../../../electron/src/interfaces';
import { ActivatedRouteSnapshot, ResolveFn, RouterStateSnapshot } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class UserDataService {
  user?: IUserEntity;
  data: IUserEntity[] = [];


  constructor() { }

  async getUsers(refresh: boolean = false): Promise<IUserEntity[]> {
    if (this.data.length === 0 || refresh)
      this.data = await window.electron.getUsers();
    return this.data;
  }

  async saveUser(user: IUserEntity) {
    return await window.electron.saveUser(user);
  }

  async setLoggedUser(user: IUserEntity) {
    this.user = user;
    await window.electron.setUser(user);
  }
}

export const userResolver: ResolveFn<IUserEntity[]> = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot,
) => {
  return inject(UserDataService).getUsers();
};
