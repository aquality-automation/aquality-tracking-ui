import { Component, Input, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { RefStatus } from 'src/app/shared/models/integrations/ref-status';

@Component({
  selector: 'app-dialog-confirm-publish',
  templateUrl: './dialog-confirm-publish.component.html',
  styleUrls: ['./dialog-confirm-publish.component.scss']
})
export class DialogConfirmPublishComponent implements OnInit {

  @Input() refs: RefStatus[];

  constructor(public dialogRef: MatDialogRef<DialogConfirmPublishComponent>) { }

  ngOnInit(): void {
    this.dialogRef.updateSize('50%', '50%');
  }
}
