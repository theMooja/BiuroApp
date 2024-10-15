import { Component } from '@angular/core';
import { UserDataService } from '../../service/user-data.service';
import { IUserEntity } from '../../../../../electron/src/interfaces';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { ActivatedRoute, Router } from '@angular/router';
import { MonthlyDataService } from '../../service/monthly-data.service';


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, MatButtonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  users: IUserEntity[] = [];

  constructor(private userService: UserDataService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private ms: MonthlyDataService
  ) {
  }

  ngOnInit() {
    this.activatedRoute.data.subscribe((data) => {
      this.users = data['users'];
    });
  }


  onLogin(user: IUserEntity) {
    this.userService.setLoggedUser(user);
    this.router.navigateByUrl('/home');
  }

  async test() {
    let data = await this.ms.getMonthlies(1, 2024);
    console.log(data);
  }
}
