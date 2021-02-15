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
    private notificationService: NotificationsService
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
    let testRefValidationResult: boolean = this.validateOn(entry => entry.testRef === undefined, referenceTypes.Test);
    let issueRefValidationResult: boolean = this.validateOn(entry => entry.issue !== undefined && entry.issueRef === undefined, referenceTypes.Issue);
    if(testRefValidationResult && issueRefValidationResult){
      this.notificationService.success('Everything looks fine', 'Results will be submitted');
    }
    // validation that all resoltions have mapping to Xray status, if not - warning
    // call to jira and check if issues are not closed, then auto remove closed refs and provide message
    // if everything fine send request for integration.
    //this.onPublish.emit();
  }

  private validateOn(filter: (entry: DataEntry) => boolean, refType: ReferenceType): boolean {
    let noRefsEntries = this.dataSource.data.filter(filter);
    let size: number = noRefsEntries.length;
    if (size > 0) {
      let maxToDisplay: number = 5;
      this.notificationService.error(`Results have missed ${refType.name} references`,
        `Please, add ${refType.name} references to results: ${noRefsEntries.map(entry => entry.result.id).slice(0, maxToDisplay).join(',')}${size > maxToDisplay ? ' and others...' : ''}`);
      return false;
    }
    return true;
  }

  private validateOnIssueRefsStatusNotClosed() { }

  cancel() {
    this.onCancel.emit();
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
