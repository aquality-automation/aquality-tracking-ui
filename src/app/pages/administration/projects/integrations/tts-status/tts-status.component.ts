import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { TtsStatusService } from 'src/app/services/integrations/tts-status.service';
import { TtsTypeService } from 'src/app/services/integrations/tts-type.service';
import { ResultResolutionService } from 'src/app/services/result-resolution/result-resolution.service';
import { System } from 'src/app/shared/models/integrations/system';
import { TtsStatus } from 'src/app/shared/models/integrations/tts-status';
import { TtsType } from 'src/app/shared/models/integrations/tts-type';
import { ResultResolution } from 'src/app/shared/models/result-resolution';

@Component({
  selector: 'app-tts-status',
  templateUrl: './tts-status.component.html',
  styleUrls: ['./tts-status.component.scss']
})
export class TtsStatusComponent implements OnInit {

  @Input() projectId: number;
  @Input() system: System;

  ngOnChanges() {
    this.loadStatuses();
  }

  addStatusForm: FormGroup;
  types: TtsType[] = [];
  resolutions: ResultResolution[] = [];
  statuses: TtsStatus[] = [];
  hasStatuses: boolean;

  constructor(
    private resolutionService: ResultResolutionService,
    private ttsTypeService: TtsTypeService,
    private ttsStatusService: TtsStatusService
  ) { }

  ngOnInit(): void {
    this.addStatusForm = new FormGroup({
      type: new FormControl(''),
      resolution: new FormControl(''),
      name: new FormControl(''),
      id: new FormControl('', Validators.pattern("^[0-9]+$"))
    })

    this.ttsTypeService.getTypes().subscribe(types => {
      this.types = types;
      this.addStatusForm.controls.type.setValue(types[0]);
    })

    this.resolutionService.getResolution(this.projectId).then(resolutions => {
      this.resolutions = resolutions;
      this.addStatusForm.controls.resolution.setValue(resolutions[0]);
    });

    this.loadStatuses();
  }

  loadStatuses() {
    this.ttsStatusService.get(this.projectId, this.system.id).subscribe(
      statuses => {
        this.statuses = statuses;
        this.hasStatuses = true;
      }
    );
  }

  getResolutionName(id: number): string {
    return this.resolutions.find(res => res.id === id)?.name;
  }

  addStatus() {
    let status = new TtsStatus();
    status.project_id = this.projectId;
    status.int_system_id = this.system.id;
    status.tts_type_id = this.addStatusForm.controls.type.value.id;
    status.status_name = this.addStatusForm.controls.name.value;
    status.status_id = this.addStatusForm.controls.id.value;
    status.resolution_id = this.addStatusForm.controls.resolution.value.id;
    this.ttsStatusService.create(status).subscribe(status => {
      this.statuses.push(status);
    });
  }

  deleteStatus(status: TtsStatus) {
    this.ttsStatusService.delete(this.projectId, status.id).subscribe(() => {
      this.statuses = this.statuses.filter(currentStatus => currentStatus.id !== status.id);
    });
  }
}
