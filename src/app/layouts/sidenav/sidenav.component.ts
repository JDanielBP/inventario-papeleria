import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

import { MatRippleModule } from '@angular/material/core';

@Component({
  selector: 'app-sidenav',
  standalone: true,
  imports: [
    RouterModule,
    MatRippleModule,
  ],
  templateUrl: './sidenav.component.html',
  styleUrl: './sidenav.component.scss'
})
export class SidenavComponent {
  
}
