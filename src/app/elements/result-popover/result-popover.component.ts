import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-result-popover',
  templateUrl: './result-popover.component.html',
  styleUrls: ['./result-popover.component.css']
})
export class ResultPopoverComponent implements OnInit {

  constructor() { }

  @Input() resultId: number;

  ngOnInit() {
  }
}
