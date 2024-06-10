import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideDateFnsAdapter } from '@angular/material-date-fns-adapter';

import { registerLocaleData } from '@angular/common';
import localePL from '@angular/common/locales/pl';

registerLocaleData(localePL);


export const appConfig: ApplicationConfig = {
  providers: [provideRouter(routes), provideAnimationsAsync(), provideDateFnsAdapter()]
};
