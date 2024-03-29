import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { TestDataService } from '../../service/test-data.service';




@Component({
  selector: 'app-home',
  standalone: true,
  imports: [MatButtonModule, MatInputModule, FormsModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
  testVal: String = "tu";

  constructor(private dataService: TestDataService) {
  }

  async onTestButtonClick(): Promise<void> {
    this.testVal = await this.dataService.getString();
  }

}
