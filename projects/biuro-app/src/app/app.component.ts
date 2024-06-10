import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
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

  constructor(private readonly dateAdapter: DateAdapter<any>) {
    setDefaultOptions({ locale: pl });
    dateAdapter.setLocale(pl);
  }
}
