import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { SystemService } from 'src/app/services/integrations/system.service';
import { System } from 'src/app/shared/models/integrations/system';

@Component({
  selector: 'app-system-view',
  templateUrl: './system-view.component.html',
  styleUrls: ['./system-view.component.scss']
})
export class SystemViewComponent implements OnInit {

  @Input() projectId: number;
  @Input() system: System;
  @Output() onDelete = new EventEmitter<System>();

  constructor(private systemService: SystemService) { }

  ngOnInit(): void {
  }

  deleteSystem(system: System) {
    this.systemService.delete(this.projectId, system.id).subscribe(() => {
      this.onDelete.emit(system);
    })
  }

}
