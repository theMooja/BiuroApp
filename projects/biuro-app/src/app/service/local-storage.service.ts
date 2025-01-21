import { inject, Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, ResolveFn, RouterStateSnapshot } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class LocalStorageService {

  constructor() { }

  async getLastUserName() {
    return await window.electron.getLastUserName();
  }

  async getAppVersion() {
    return await window.electron.getVersion();
  }
}

export const lastUserNameResolver: ResolveFn<string> = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot,
) => {
  return inject(LocalStorageService).getLastUserName();
};

export const appVersionResolver: ResolveFn<string> = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot,
) => {
  return inject(LocalStorageService).getAppVersion();
};
