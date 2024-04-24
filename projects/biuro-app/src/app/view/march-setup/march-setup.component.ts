import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { FormArray, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-march-setup',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule, ReactiveFormsModule, MatInputModule, MatFormFieldModule],
  templateUrl: './march-setup.component.html',
  styleUrl: './march-setup.component.scss'
})
export class MarchSetupComponent {
  marchForm: FormGroup = this.formBuilder.group({
    name: new FormControl(''),
    steps: this.formBuilder.array([])
  });

  constructor(private formBuilder: FormBuilder) { }

  addStep() {
    const step = this.formBuilder.group({
      name: ['', Validators.required],
      type: ['', Validators.required],
    });

    (this.marchForm.get('steps') as FormArray).push(step);
  }

  get steps(): FormControl[] {
    return (this.marchForm.get('steps') as FormArray).controls as FormControl[];
  }
}
