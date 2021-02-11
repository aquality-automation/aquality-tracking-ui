import { Component, Input, OnInit, ViewChild } from '@angular/core';
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
import { IEntityId } from 'src/app/shared/models/i-entity-id';
import { Data } from '@angular/router';

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

  selectedRun: Reference;
  testReferences = new Map<number, Reference>();
  issueReferences = new Map<number, Reference>();
  referenceTypes = referenceTypes;

  icons = { faTimes }

  tableColumns = {
    TestName: new TableColumn('testName', 'Test Name'),
    TestRef: new TableColumn('testRef', 'Test Ref'),
    IssueName: new TableColumn('issueName', 'Issue Name'),
    IssueRef: new TableColumn('issueRef', 'Issue Ref')
  }

  displayedColumns = [
    this.tableColumns.TestName.id,
    this.tableColumns.TestRef.id,
    this.tableColumns.IssueName.id,
    this.tableColumns.IssueRef.id
  ];
  dataSource: MatTableDataSource<DataEntry>;
  data: DataEntry[] = [];

  @ViewChild(MatPaginator) paginator: MatPaginator;

  constructor(private referenceService: ReferenceService) {
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
        return entry.test?.name?.toLowerCase().includes(value) ||
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
    this.dataSource.data.find(entry => reference.entity_id === entry.issue?.id).issue = reference;
  }

  editReference(entry: DataEntry) {
    entry.edit = true;
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
