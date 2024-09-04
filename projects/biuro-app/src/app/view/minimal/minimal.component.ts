import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';


@Component({
  selector: 'app-minimal',
  standalone: true,
  imports: [RouterLink, MatButtonModule, MatIconModule],
  templateUrl: './minimal.component.html',
  styleUrl: './minimal.component.scss'
})
export class MinimalComponent {
  
  onMaximize() {
    window.electron.maximize();
  }
}
