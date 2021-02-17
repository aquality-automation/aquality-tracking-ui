import { Component, Inject, Input, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Reference } from 'src/app/shared/models/integrations/reference';
import { ReferenceType } from 'src/app/shared/models/integrations/reference-type';

@Component({
  selector: 'dialog-references',
  templateUrl: './dialog-references.component.html',
  styleUrls: ['./dialog-references.component.scss']
})
export class DialogReferencesComponent implements OnInit {

  @Input() projectId: number;
  @Input() entityId: number;
  @Input() referenceType: ReferenceType;

  constructor(
    public dialogRef: MatDialogRef<DialogReferencesComponent>,
    @Inject(MAT_DIALOG_DATA) public addedRef: Reference
  ) { }

  ngOnInit(): void {
  }

  onClose(): void {
    this.dialogRef.close();
  }

  onAddReference(reference: Reference) {
    this.addedRef = reference;
  }
}
