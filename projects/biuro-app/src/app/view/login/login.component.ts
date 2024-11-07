import { Component, ViewChild } from '@angular/core';
import { UserDataService } from '../../service/user-data.service';
import { IUserEntity } from '../../../../../electron/src/interfaces';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { ActivatedRoute, Router } from '@angular/router';
import { MonthlyDataService } from '../../service/monthly-data.service';
import { MatListModule, MatSelectionList } from '@angular/material/list';
import { FormControl, FormGroup, FormsModule, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [MatInputModule, ReactiveFormsModule, CommonModule, MatButtonModule, MatListModule, MatSelectionList, FormsModule, MatFormFieldModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  users: IUserEntity[] = [];
  selectedUser!: IUserEntity;
  loginForm!: FormGroup;

  constructor(private userService: UserDataService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private monthlyDataService: MonthlyDataService
  ) {

    this.loginForm = new FormGroup({
      name: new FormControl('', Validators.required),
      password: new FormControl('', Validators.required)
    });
  }

  ngOnInit() {
    this.activatedRoute.data.subscribe((data) => {
      this.users = data['users'];
      let lastUserName = data['lastUserName'];
      if (lastUserName) {
        let user = this.users.find((u) => u.name === lastUserName);
        if(user) {
          this.onSelect(user);
        }
      }
    });    
  }

  onSelect(user: IUserEntity) {
    this.selectedUser = user;
    this.loginForm.get('name')?.setValue(user.name);
  }

  onLogin() {
    this.userService.setLoggedUser(this.selectedUser);
    this.router.navigateByUrl('/home');
  }

  async test() {
    let data = await this.monthlyDataService.getMonthlies(1, 2024);
    console.log(data);
  }
}
