import { inject, Injectable } from '@angular/core';
import { IUserEntity } from '../../../../electron/src/interfaces';
import { ActivatedRouteSnapshot, ResolveFn, RouterStateSnapshot } from '@angular/router';
import { NotificationsService } from 'angular2-notifications';

@Injectable({
  providedIn: 'root'
})
export class UserDataService {
  user?: IUserEntity;
  data: IUserEntity[] = [];


  constructor(private notificationsService: NotificationsService) { }

  async getUsers(refresh: boolean = false): Promise<IUserEntity[]> {
    if (this.data.length === 0 || refresh)
      this.data = await window.electron.getUsers();
    return this.data;
  }

  async saveUser(user: IUserEntity) {
    return await window.electron.saveUser(user).then((res) => {
      this.notificationsService.success('Użytkownik został zapisany', res.name);
    }, (err) => {
      this.notificationsService.error('Nie można zapisać użytkownika', err.message);
    });
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
