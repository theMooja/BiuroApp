import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-info',
  standalone: true,
  imports: [MatButtonModule],
  templateUrl: './info.component.html',
  styleUrl: './info.component.scss'
})
export class InfoComponent {

  onInfo() {
    window.electron.toggleDevTools();
  }
}
