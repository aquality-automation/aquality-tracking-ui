import { Component, Input, OnInit } from '@angular/core';
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
import { IEntityId } from 'src/app/shared/models/i-entity-id';

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

  constructor(private referenceService: ReferenceService) {
    super();
  }

  ngOnInit(): void {
    this.selectedRun = this.runReferences[0];
    this.initTestReferences();
    this.initIssueeReferences();
  }

  private initTestReferences() {
    let tests: Test[] = this.testResults
      .map(result => {
        let test: Test = { id: result.test.id };
        return test;
      })
    this.testReferences = this.initReferences<TestResult>(tests, referenceTypes.Test);
  }

  private initIssueeReferences() {
    let issues = this.testResults
      .map(result => result.issue)
      .filter(issue => issue !== undefined);

    this.issueReferences = this.initReferences<Issue>(issues, referenceTypes.Issue);
  }

  private initReferences<T extends IEntityId>(items: T[], refType: ReferenceType): Map<number, Reference> {
    let data: Map<number, Reference> = new Map<number, Reference>();
    items.forEach(item => {
      data.set(item.id, null);
    })

    this.referenceService.getAll(this.projectId, refType)
      .subscribe(referenes => {
        referenes.forEach(ref => {
          let entityId = ref.entity_id;
          if (data.has(entityId)) {
            data.set(entityId, ref);
          }
        })
      });

    return data;
  }

  hasTestReference(test: Test): boolean {
    return this.testReferences.get(test.id) != undefined;
  }

  hasReferencedIssue(result: TestResult): boolean {
    return this.hasIssue(result) && this.hasIssueReference(result.issue);
  }

  private hasIssue(result: TestResult): boolean {
    return result.issue === undefined ? false : true;
  }

  private hasIssueReference(issue: Issue): boolean {
    return this.issueReferences.get(issue.id) !== null;
  }

  getTestReference(test: Test): Reference {
    return this.getReference(this.testReferences, test);
  }

  getIssueReference(issue: Issue): Reference {
    return this.getReference(this.issueReferences, issue);
  }

  private getReference<T extends IEntityId>(data: Map<number, Reference>, entity: T): Reference {
    return data.get(entity.id);
  }

  getResolutionType(result: TestResult): ResolutionType {
    return resolutionTypesArray.find(type => type.color === result.final_result.color);
  }

  addTestReference(reference: Reference) {
    this.testReferences.set(reference.entity_id, reference);
  }
}
