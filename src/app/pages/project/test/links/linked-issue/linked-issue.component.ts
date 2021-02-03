import { Component, Input, OnInit } from '@angular/core';
import { SystemType } from 'src/app/shared/models/integrations/system-type';

@Component({
  selector: 'app-linked-issue',
  templateUrl: './linked-issue.component.html',
  styleUrls: ['./linked-issue.component.scss']
})
export class LinkedIssueComponent implements OnInit {

  @Input() system : SystemType;
  
  constructor() { }

  ngOnInit(): void {
  }

}
