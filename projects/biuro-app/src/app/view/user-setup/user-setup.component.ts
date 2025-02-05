import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserDataService } from '../../service/user-data.service';
import { IUserEntity, Permission } from '../../../../../electron/src/interfaces';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';


@Component({
  selector: 'app-user-setup',
  standalone: true,
  imports: [MatInputModule, MatButtonModule, MatIconModule, MatFormFieldModule, ReactiveFormsModule, CommonModule, MatSelectModule],
  templateUrl: './user-setup.component.html',
  styleUrl: './user-setup.component.scss'
})
export class UserSetupComponent {
  roles: string[] = [Permission.FULL, Permission.SUPER, Permission.USER];
  userForm: FormGroup;

  constructor(private fb: FormBuilder,
    private userService: UserDataService
  ) {

    this.userForm = this.fb.group({
      users: this.fb.array([])
    });
  }

  async ngOnInit() {
    let users = await this.userService.getUsers();
    this.setUsers(users);
  }

  setUsers(users: IUserEntity[]) {
    const userFormGroups = users.map(user => this.createUser(user));
    const userFormArray = this.fb.array(userFormGroups);
    this.userForm.setControl('users', userFormArray);
  }

  get users() {
    return this.userForm.get('users') as FormArray;
  }

  addNewUser() {
    const userGroup = this.fb.group({
      name: ['', Validators.required],
      password: ['', Validators.required],
      permission: [Permission.FULL]
    });
    this.users.push(userGroup);
  }

  createUser(user: IUserEntity): FormGroup {
    return this.fb.group({
      name: [user.name, Validators.required],
      password: [user.password, Validators.required],
      permission: [user.permission]
    });
  }

  async saveUser(index: number) {
    let user = this.users.value[index];
    await this.userService.saveUser(user);
    await this.userService.getUsers(true);
  }
}
