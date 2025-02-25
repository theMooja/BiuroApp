import { Component, HostListener } from '@angular/core';
import { NavigationEnd, NavigationStart, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { pl } from 'date-fns/locale';
import { setDefaultOptions } from 'date-fns';
import { DateAdapter } from '@angular/material/core';
import { UserDataService } from './service/user-data.service';
import { Permission, hasAccess } from '../../../electron/src/interfaces';
import { NotificationsService, SimpleNotificationsModule } from 'angular2-notifications';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, MatButtonModule, MatIconModule, SimpleNotificationsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  Permission = Permission;
  hasAccess = hasAccess;
  title = 'BiuroApp';
  isLogin: boolean = true;
  isMinimized: boolean = true;

  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (event.ctrlKey && event.key === 'l') {
      this.router.navigateByUrl('/login');
    }
  }

  constructor(private readonly dateAdapter: DateAdapter<any>,
    private router: Router,
    private userService: UserDataService,
    private notificationService: NotificationsService 
  ) {
    setDefaultOptions({ locale: pl });
    dateAdapter.setLocale(pl);

    router.events.forEach((event) => {
      if (event instanceof NavigationEnd) {
        this.isLogin = event.urlAfterRedirects === '/login';
        this.isMinimized = event.urlAfterRedirects === '/minimal';
      }
    });
  }

  get user() {
    return this.userService.user;
  }

  onMinimize() {
    window.electron.minimize();
  }

  onClose() {
    window.electron.close();
  }

  onResize() {
    window.electron.resize();
  }

  onTest() {
    this.notificationService.success('Test', 'Test');
  }
}

