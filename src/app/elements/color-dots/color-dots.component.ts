import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-color-dots',
  templateUrl: './color-dots.component.html',
  styleUrls: ['./color-dots.component.css']
})
export class ColorDotsComponent implements OnInit {
  @Input() numericColors: number[];
  @Input() entitiesId: number[];

  constructor() { }

  ngOnInit() {
  }

}
