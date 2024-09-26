import { Component } from '@angular/core';
import { UserDataService } from '../../service/user-data.service';
import { IUser } from '../../../../../electron/src/interfaces';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { ActivatedRoute, Router } from '@angular/router';


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
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {
  }

  ngOnInit() {
    this.activatedRoute.data.subscribe((data) => {
      this.users = data['users'];
    });
  }


  onLogin(user: IUser) {
    this.userService.setLoggedUser(user);
    this.router.navigateByUrl('/home');
  }
}
