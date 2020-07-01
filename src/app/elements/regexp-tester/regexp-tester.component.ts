import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'regexp-tester',
  templateUrl: './regexp-tester.component.html',
  styleUrls: ['./regexp-tester.component.scss']
})
export class RegexpTesterComponent implements OnInit {

  @Input() expression: string;
  @Input() text: string;

  constructor() { }

  ngOnInit() {
  }

}
