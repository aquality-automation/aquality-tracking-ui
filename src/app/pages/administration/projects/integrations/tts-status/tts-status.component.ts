import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { FinalResultService } from 'src/app/services/final-result/final_results.service';
import { TtsStatusService } from 'src/app/services/integrations/tts-status.service';
import { TtsTypeService } from 'src/app/services/integrations/tts-type.service';
import { ResultResolutionService } from 'src/app/services/result-resolution/result-resolution.service';
import { FinalResolution } from 'src/app/shared/models/integrations/final-resolution';
import { FinalResolutionType, finalResolutionTypes } from 'src/app/shared/models/integrations/final-resolution-type';
import { System } from 'src/app/shared/models/integrations/system';
import { TtsStatus } from 'src/app/shared/models/integrations/tts-status';
import { TtsType } from 'src/app/shared/models/integrations/tts-type';

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
  finalResolutions: FinalResolution[] = [];
  statuses: TtsStatus[] = [];
  hasStatuses: boolean;
  ttsType: TtsType;

  constructor(
    private resolutionService: ResultResolutionService,
    private finalResultService: FinalResultService,
    private ttsTypeService: TtsTypeService,
    private ttsStatusService: TtsStatusService
  ) { }

  ngOnInit(): void {
    this.addStatusForm = new FormGroup({
      finalResolution: new FormControl(''),
      name: new FormControl(''),
      id: new FormControl('', Validators.pattern("^[0-9]+$"))
    });

    this.ttsTypeService.getTypes().subscribe(types => {
      this.ttsType = types.find(type => type.id === this.system.int_tts_type);
    });


    forkJoin([this.resolutionService.getResolution(this.projectId),
    this.finalResultService.getFinalResult({})]).subscribe(([resolutions, finalResults]) => {

      resolutions.forEach(resolution => {
        let res: FinalResolution = new FinalResolution();
        res.id = resolution.id;
        res.name = resolution.name;
        res.type = finalResolutionTypes.Resolution;
        this.finalResolutions.push(res);
      });

      finalResults.forEach(finalResult => {
        let res: FinalResolution = new FinalResolution();
        res.id = finalResult.id;
        res.name = finalResult.name;
        res.type = finalResolutionTypes.FinalResult;
        this.finalResolutions.push(res);
      });

      console.log(JSON.stringify(this.finalResolutions))

      this.addStatusForm.controls.finalResolution.setValue(this.finalResolutions[0]);
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

  getResolutionName(status: TtsStatus): string {
    let type: FinalResolutionType = status.final_result_id === undefined ?
      finalResolutionTypes.Resolution : finalResolutionTypes.FinalResult;
    let id: number = type === finalResolutionTypes.Resolution ? status.resolution_id : status.final_result_id;

    return this.finalResolutions.find(res => (res.id === id) && (res.type.name === type.name))?.name;
  }

  private isResolutionType(resolution: FinalResolution): boolean {
    return resolution.type === finalResolutionTypes.Resolution;
  }

  addStatus() {
    let status = new TtsStatus();
    status.project_id = this.projectId;
    status.int_system_id = this.system.id;
    status.tts_type_id = this.system.int_tts_type;
    status.status_name = this.addStatusForm.controls.name.value;
    status.status_id = this.addStatusForm.controls.id.value;

    let resolution: FinalResolution = this.addStatusForm.controls.finalResolution.value;
    if (this.isResolutionType(resolution)) {
      status.resolution_id = this.addStatusForm.controls.finalResolution.value.id;
    } else {
      status.final_result_id = this.addStatusForm.controls.finalResolution.value.id;
    }

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
