import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { SystemService } from 'src/app/services/integrations/system.service';
import { System } from 'src/app/shared/models/integrations/system';

@Component({
  selector: 'int-system-select',
  templateUrl: './int-system-select.component.html',
  styleUrls: ['./int-system-select.component.scss']
})
export class IntSystemSelectComponent implements OnInit {

  @Input() projectId: number;
  @Output() onSystemSelected: EventEmitter<System> = new EventEmitter();
  @Output() onSystemsReceived: EventEmitter<System[]> = new EventEmitter();

  selectedSystem: System;
  systems: System[] = [];

  constructor(private systemService: SystemService) { }

  ngOnInit(): void {
    this.systemService.getAll(this.projectId)
      .subscribe(systems => {
        this.systems = systems;
        this.onSystemsReceived.emit(systems);

        this.selectedSystem = systems[0];
        this.onSystemSelected.emit(this.selectedSystem);
      });
  }

  onSelect(system: System) {
    this.selectedSystem = system;
    this.onSystemSelected.emit(system);
  }
}
