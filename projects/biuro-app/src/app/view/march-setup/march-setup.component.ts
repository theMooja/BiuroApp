import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { FormArray, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { CommonModule } from '@angular/common';
import { MarchDataService } from '../../service/march-data.service';


@Component({
  selector: 'app-march-setup',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule, ReactiveFormsModule, MatInputModule, MatFormFieldModule],
  templateUrl: './march-setup.component.html',
  styleUrl: './march-setup.component.scss'
})
export class MarchSetupComponent {
  marchForm: FormGroup

  constructor(private formBuilder: FormBuilder,
    private dataService: MarchDataService
  ) {

    this.marchForm = this.formBuilder.group({
      name: this.formBuilder.control(''),
      steps: this.formBuilder.array([])
    });
  }

  get steps() {
    return this.marchForm.get('steps') as FormArray;
  }

  addStep() {
    this.steps.push(this.createStepGroup());
  }

  createStepGroup(): FormGroup {
    return this.formBuilder.group({
      title: this.formBuilder.control('')
    });
  }

  onSubmit() {
    console.log(this.marchForm.value);
    this.dataService.createTemplate(this.marchForm.value);
  }
}
