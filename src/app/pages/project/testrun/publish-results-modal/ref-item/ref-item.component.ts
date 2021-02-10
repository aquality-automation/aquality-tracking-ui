import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ReferenceService } from 'src/app/services/integrations/reference.service';
import { IEntityId } from 'src/app/shared/models/i-entity-id';
import { Reference } from 'src/app/shared/models/integrations/reference';
import { ReferenceType } from 'src/app/shared/models/integrations/reference-type';
import { TestResult } from 'src/app/shared/models/test-result';

@Component({
  selector: 'app-ref-item',
  templateUrl: './ref-item.component.html',
  styleUrls: ['./ref-item.component.scss']
})
export class RefItemComponent implements OnInit {

  @Input() projectId: number;
  @Input() runReference: Reference;
  @Input() testResult: TestResult;
  @Input() refType: ReferenceType;

  @Output() onReferenceAdded: EventEmitter<Reference> = new EventEmitter<Reference>();

  constructor(private referenceService: ReferenceService) { }

  ngOnInit(): void {
  }

  addReference(entity: IEntityId, key: string) {
    let ref = new Reference();
    ref.key = key;
    ref.entity_id = entity.id;
    ref.project_id = this.projectId;
    ref.int_system = this.runReference.int_system;
    this.referenceService.create(ref, this.refType)
      .subscribe(reference => {
        this.onReferenceAdded.emit(reference);
      })
  }

}
