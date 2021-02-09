import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { NotificationsService } from 'angular2-notifications';
import { TtsStatusService } from 'src/app/services/integrations/tts-status.service';
import { TtsTypeService } from 'src/app/services/integrations/tts-type.service';
import { TtsStatus } from 'src/app/shared/models/integrations/tts-status';
import { TtsType } from 'src/app/shared/models/integrations/tts-type';
import { ResolutionType, resolutionTypesArray } from 'src/app/shared/models/resolution-type';

@Component({
  selector: 'app-tts-status',
  templateUrl: './tts-status.component.html',
  styleUrls: ['./tts-status.component.scss']
})
export class TtsStatusComponent implements OnInit {

  @Input() projectId: number;

  ngOnChanges() {
    this.loadStatuses();
  }

  addStatusForm: FormGroup;
  types: TtsType[] = [];
  resolutions: ResolutionType[] = resolutionTypesArray;
  statuses: TtsStatus[] = [];
  hasStatuses: boolean;

  constructor(
    private ttsTypeService: TtsTypeService,
    private ttsStatusService: TtsStatusService,
    private notificationsService: NotificationsService
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

    this.addStatusForm.controls.resolution.setValue(this.resolutions[0]);

    this.loadStatuses();
  }

  loadStatuses() {
    this.ttsStatusService.get(this.projectId).subscribe(
      statuses => {
        this.statuses = statuses;
        this.hasStatuses = true;
      },
      error => {
        this.ttsStatusService.createTable(this.projectId).subscribe(result => {
          if (result.created == true) {
            this.notificationsService.success('Successful', 'Test tracking statuses has been enabled for project!');
            this.loadStatuses();
          } else {
            this.notificationsService.error('Error', 'Test tracking statuses has not been enabled for project. Please, contact your administrator.');
          }
        })
      }
    );
  }

  getResolutionName(id: number): string {
    return this.resolutions.find(res => res.id === id).title;
  }

  addStatus() {
    let status = new TtsStatus();
    status.project_id = this.projectId;
    status.resolution_id = this.addStatusForm.controls.resolution.value.id;
    status.status_id = this.addStatusForm.controls.id.value;
    status.status_name = this.addStatusForm.controls.name.value;
    status.tts_type = this.addStatusForm.controls.type.value.id;
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
