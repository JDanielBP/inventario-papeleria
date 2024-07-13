import { Component, Inject } from '@angular/core';

import { ConfirmMsg } from '../../../interfaces/confirm-msg.interface';

import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogClose, MatDialogContent, MatDialogTitle } from '@angular/material/dialog';


@Component({
  selector: 'app-confirm',
  standalone: true,
  imports: [
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatDialogClose,
    MatButtonModule
  ],
  templateUrl: './confirm.component.html',
  styleUrl: './confirm.component.scss'
})
export class ConfirmComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public confirmMsg: ConfirmMsg) {}
  
}
