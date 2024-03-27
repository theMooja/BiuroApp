import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';




@Component({
  selector: 'app-home',
  standalone: true,
  imports: [MatButtonModule, MatInputModule, FormsModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
  testVal: String = "tu";
}
