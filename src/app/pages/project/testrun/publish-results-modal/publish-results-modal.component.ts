import { Component, Input, OnInit, Output, ViewChild } from '@angular/core';
import { ModalComponent } from 'src/app/elements/modals/modal.component';
import { ReferenceService } from 'src/app/services/integrations/reference.service';
import { Test } from 'src/app/shared/models/test';
import { TestResult } from 'src/app/shared/models/test-result';
import { TestRun } from 'src/app/shared/models/testrun';
import { Reference } from 'src/app/shared/models/integrations/reference';
import { ReferenceType, referenceTypes } from 'src/app/shared/models/integrations/reference-type';
import { ResolutionType, resolutionTypesArray } from 'src/app/shared/models/resolution-type';
import { Issue } from 'src/app/shared/models/issue';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { forkJoin } from 'rxjs';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { EventEmitter } from '@angular/core';
import { NotificationsService } from 'angular2-notifications';
import { TtsStatusService } from 'src/app/services/integrations/tts-status.service';
import { TtsStatus } from 'src/app/shared/models/integrations/tts-status';
import { finalResultNames } from 'src/app/shared/models/final-result';
import { SystemWorkflowStatusServiceService } from 'src/app/services/integrations/system-workflow-status-service.service';
import { SystemWorkflowStatus } from 'src/app/shared/models/integrations/system-workflow-status';
import { workflowStatusTypes } from 'src/app/shared/models/integrations/system-workflow-status-type';
import { MatDialog } from '@angular/material/dialog';
import { DialogReferencesComponent } from '../../references/dialog-references/dialog-references.component';
import { IEntityId } from 'src/app/shared/models/i-entity-id';
import { PublishService } from 'src/app/services/integrations/publish.service';
import { PubItem } from 'src/app/shared/models/integrations/pub-item';

@Component({
  selector: 'app-publish-results-modal',
  templateUrl: './publish-results-modal.component.html',
  styleUrls: ['./publish-results-modal.component.scss']
})
export class PublishResultsModalComponent extends ModalComponent implements OnInit {

  @Input() title = 'Publish Result';
  @Input() projectId: number;
  @Input() testRun: TestRun;
  @Input() runReferences: Reference[];
  @Input() testResults: TestResult[];
  @Output() onCancel = new EventEmitter();
  @Output() onPublish = new EventEmitter();

  selectedRun: Reference;
  testReferences = new Map<number, Reference>();
  issueReferences = new Map<number, Reference>();
  referenceTypes = referenceTypes;

  icons = { faTimes }

  tableColumns = {
    ResultId: new TableColumn('resultId', 'Result Id'),
    TestName: new TableColumn('testName', 'Test Name'),
    TestRef: new TableColumn('testRef', 'Test Ref'),
    Resolution: new TableColumn('resultRes', 'Resolution'),
    IssueName: new TableColumn('issueName', 'Issue Name'),
    IssueRef: new TableColumn('issueRef', 'Issue Ref')
  }

  displayedColumns = [
    this.tableColumns.ResultId.id,
    this.tableColumns.TestName.id,
    this.tableColumns.TestRef.id,
    this.tableColumns.Resolution.id,
    this.tableColumns.IssueName.id,
    this.tableColumns.IssueRef.id
  ];
  dataSource: MatTableDataSource<DataEntry>;
  data: DataEntry[] = [];

  @ViewChild(MatPaginator) paginator: MatPaginator;

  constructor(
    private referenceService: ReferenceService,
    private ttsStatusService: TtsStatusService,
    private wflStatusService: SystemWorkflowStatusServiceService,
    private notificationService: NotificationsService,
    private publishService: PublishService,
    public dialog: MatDialog
  ) {
    super();
  }

  ngOnInit(): void {
    this.selectedRun = this.runReferences[0];
    forkJoin([
      this.referenceService.getAll(this.projectId, referenceTypes.Test),
      this.referenceService.getAll(this.projectId, referenceTypes.Issue)
    ]
    ).subscribe(([testReferences, issueReferences]) => {
      this.testResults.forEach(result => {
        let entry = new DataEntry();
        entry.result = result;
        entry.test = result.test;
        entry.issue = result.issue;

        let findRef = (refereces: Reference[], entityId: number) =>
          refereces.find(ref => ref.entity_id === entityId);
        entry.testRef = findRef(testReferences, result.test.id);
        entry.issueRef = findRef(issueReferences, result.issue?.id);
        this.data.push(entry);
      })
      this.dataSource = new MatTableDataSource<DataEntry>(this.data);
      this.dataSource.paginator = this.paginator;
      this.dataSource.filterPredicate = (entry, value) => {
        return entry.result.id.toString().toLowerCase().includes(value) ||
          entry.test?.name?.toLowerCase().includes(value) ||
          entry.testRef?.key?.toLowerCase().includes(value) ||
          entry.issue?.title?.toLowerCase().includes(value) ||
          entry.issueRef?.key?.toLowerCase().includes(value)
      };
    });
  }

  applyFilter(filterValue: string) {
    filterValue = filterValue.trim().toLowerCase();
    this.dataSource.filter = filterValue;
  }

  hasTestReference(entry: DataEntry): boolean {
    return entry.testRef !== undefined;
  }

  hasReferencedIssue(entry: DataEntry): boolean {
    return this.hasIssue(entry) && this.hasIssueReference(entry);
  }

  private hasIssueReference(entry: DataEntry): boolean {
    return entry.issueRef != undefined;
  }

  hasIssue(entry: DataEntry): boolean {
    return entry.issue !== undefined;
  }

  getResolutionType(result: TestResult): ResolutionType {
    return resolutionTypesArray.find(type => type.color === result.final_result.color);
  }

  addTestReference(reference: Reference) {
    let entry = this.dataSource.data.find(entry => reference.entity_id === entry.test?.id);
    entry.testRef = reference;
    entry.edit = false;
  }

  addIssueReference(reference: Reference) {
    this.dataSource.data.find(entry => reference.entity_id === entry.issue?.id).issueRef = reference;
  }

  publish() {
    forkJoin(
      [
        this.ttsStatusService.get(this.projectId, this.selectedRun.int_system),
        this.wflStatusService.get(this.projectId, this.selectedRun.int_system)
      ]
    ).subscribe(([statuses, wflStatuses]) => {
      if (
        this.hasNoInProgress() &&
        this.hasNoPending() &&
        this.hasNoMissedTestRef() &&
        this.hasNoFailedWithoutIssue() &&
        this.hasNoMissedIssueRef() &&
        this.hasNoMappedResolutions(statuses) &&
        this.hasClosedTypeWflStatus(wflStatuses)
      ) {

        let items: PubItem[] = [];
        this.dataSource.data.forEach(entry => {
          let item: PubItem = new PubItem();
          item.result_id = entry.result.id;
          item.test_ref = entry.testRef.key;
          item.status = this.getTtsStatus(entry, statuses).status_id;
          if (entry.issueRef != undefined) {
            item.issue_ref = entry.issueRef.key;
          }
          items.push(item);
        });

        this.publishService.publish(
          items,
          this.projectId,
          this.selectedRun.int_system,
          this.testRun.id,
          this.selectedRun.key
        ).subscribe(() => {
          this.notificationService.success('Success', 'Results were successfully sent');
          this.onPublish.emit();
        });
      }
    });
    // call to jira and check if issues are not closed, then auto remove closed refs and provide message
  }

  private getTtsStatus(entry: DataEntry, statuses: TtsStatus[]): TtsStatus {
    if (entry.issue !== undefined) {
      return statuses.find(status => status.resolution_id === entry.issue.resolution_id);
    } else {
      return statuses.find(status => status.final_result_id === entry.result.final_result_id);
    }
  }

  private hasClosedTypeWflStatus(statuses: SystemWorkflowStatus[]) {

    // TODO create an 
    let result: boolean = statuses.find(status => status.wf_sts_type_id === workflowStatusTypes.Closed.id) !== undefined;
    if (!result) {
      this.notificationService.error(`Workflow status is not defined`,
        `Wokflow status type ${workflowStatusTypes.Closed.name} is not defined for integration system. Please, configure it in the project -> integrations settings`);
    }
    return result;
  }

  private hasNoMappedResolutions(statuses: TtsStatus[]): boolean {
    let resolutions: number[] = statuses.map(status => status.resolution_id);
    return this.validateOn(entry => {
      return entry.result.final_result?.name.toLowerCase() === finalResultNames.Failed &&
        !resolutions.includes(entry.issue?.resolution_id)
    }, 'mapped resolution');
  }

  private hasNoPending(): boolean {
    return this.validateOnInComplete(finalResultNames.Pending);
  }

  private hasNoInProgress(): boolean {
    return this.validateOnInComplete(finalResultNames.InProgress);
  }

  private validateOnInComplete(status: string): boolean {
    return this.validateOn(entry => {
      return (entry.result.final_result?.name.toLowerCase() === status);
    }, `result (for ${status})`);
  }

  private hasNoFailedWithoutIssue() {
    return this.validateOn(entry => {
      return (entry.result.final_result?.name.toLowerCase() === finalResultNames.Failed) &&
        entry.issue === undefined;
    }, 'issue');
  }

  private hasNoMissedTestRef(): boolean {
    return this.validateOnRef(entry => entry.testRef === undefined, referenceTypes.Test);
  }

  private hasNoMissedIssueRef(): boolean {
    return this.validateOnRef(entry => entry.issue !== undefined && entry.issueRef === undefined, referenceTypes.Issue);
  }

  private validateOnRef(filter: (entry: DataEntry) => boolean, refType: ReferenceType): boolean {
    return this.validateOn(filter, `${refType.name} reference`)
  }

  private validateOn(filter: (entry: DataEntry) => boolean, missedEntityName: string): boolean {
    let invalidEntries = this.dataSource.data.filter(filter);
    let size: number = invalidEntries.length;
    if (size > 0) {
      let maxToDisplay: number = 5;
      this.notificationService.error(`Results have missed ${missedEntityName}`,
        `Please add ${missedEntityName} to results: ${invalidEntries.map(entry => entry.result.id).slice(0, maxToDisplay).join(',')}${size > maxToDisplay ? ' and others...' : ''}`);
      return false;
    }
    return true;
  }

  private validateOnIssueRefsStatusNotClosed() { }

  cancel() {
    this.onCancel.emit();
  }

  openAddRefDialog(projectId: number, entity: IEntityId, referenceType: ReferenceType): void {
    const dialogRef = this.dialog.open(DialogReferencesComponent, {
      width: '450px'
    });
    let instance = dialogRef.componentInstance;
    instance.projectId = projectId;
    instance.entityId = entity.id;
    instance.referenceType = referenceType;

    dialogRef.afterClosed().subscribe(references => {
      let ref = references.find(ref => ref.int_system === this.selectedRun.int_system);
      if (referenceType.id === referenceTypes.Test.id) {
        this.dataSource.data.find(entry => entry.test.id === entity.id).testRef = ref;
      } else {
        this.dataSource.data.find(entry => entry.issue.id === entity.id).issueRef = ref;
      }
    });
  }
}

export class TableColumn {
  id: string;
  name: string;

  constructor(id: string, name: string) {
    this.id = id;
    this.name = name;
  }
}

export class DataEntry {
  result: TestResult;
  test: Test;
  testRef?: Reference;
  issue?: Issue;
  issueRef?: Reference;
  edit: boolean;
}
