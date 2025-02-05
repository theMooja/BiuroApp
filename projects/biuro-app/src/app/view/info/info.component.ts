import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { hasAccess, Permission } from './../../../../../electron/src/interfaces';
import { UserDataService } from '../../service/user-data.service';

@Component({
  selector: 'app-info',
  standalone: true,
  imports: [MatButtonModule, MatCardModule],
  templateUrl: './info.component.html',
  styleUrl: './info.component.scss'
})
export class InfoComponent {
  hasAccess = hasAccess;  
  Permission = Permission;

  constructor(private userService: UserDataService) { }

  get user() {
    return this.userService.user;
  }

  onInfo() {
    window.electron.toggleDevTools();
  }
}
