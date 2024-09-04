import { Component } from '@angular/core';
import { NavigationEnd, NavigationStart, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { pl } from 'date-fns/locale';
import { setDefaultOptions } from 'date-fns';
import { DateAdapter } from '@angular/material/core';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, MatButtonModule, MatIconModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'BiuroApp';
  isLogin: boolean = true;
  isMinimized: boolean = true;

  constructor(private readonly dateAdapter: DateAdapter<any>,
    private router: Router
  ) {
    setDefaultOptions({ locale: pl });
    dateAdapter.setLocale(pl);

    router.events.forEach((event) => {
      if (event instanceof NavigationEnd) {
        this.isLogin = event.urlAfterRedirects === '/login';
        this.isMinimized = event.urlAfterRedirects ==='/minimal';
      }
    });
  }

  onMinimize() {
    window.electron.minimize();
  }

  onClose() {
    window.electron.close();
  }
}
