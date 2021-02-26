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
    @Inject(MAT_DIALOG_DATA) public addedReferences: Reference[]
  ) { }

  ngOnInit(): void {
    this.dialogRef.updateSize('450px');
  }

  onClose(): void {
    this.dialogRef.close();
  }

  onReferencesChanged(references: Reference[]) {
    this.addedReferences = references;
  }
}
