import { Component, Input, OnInit } from '@angular/core';
import { IntegrationSystem } from 'src/app/shared/models/integration-system';

@Component({
  selector: 'app-linked-issue',
  templateUrl: './linked-issue.component.html',
  styleUrls: ['./linked-issue.component.scss']
})
export class LinkedIssueComponent implements OnInit {

  @Input() system : IntegrationSystem;
  
  constructor() { }

  ngOnInit(): void {
  }

}
