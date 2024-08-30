import { Component } from '@angular/core';
import { UserDataService } from '../../service/user-data.service';
import { IUser } from '../../../../../electron/src/interfaces';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, MatButtonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  users: IUser[] = [];

  constructor(private userService: UserDataService,
    private router: Router
  ) {

  }

  async ngOnInit() {
    this.users = await this.userService.getUsers();
    console.log(this.users);
  }

  onLogin(user: IUser) {
    this.userService.setLoggedUser(user);
    this.router.navigateByUrl('/home');
  }
}
