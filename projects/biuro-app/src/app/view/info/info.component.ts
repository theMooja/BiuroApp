import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-info',
  standalone: true,
  imports: [MatButtonModule, MatCardModule],
  templateUrl: './info.component.html',
  styleUrl: './info.component.scss'
})
export class InfoComponent {

  onInfo() {
    window.electron.toggleDevTools();
  }
}
