import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'large-text-container',
  templateUrl: './largeTextContainer.component.html',
  styleUrls: ['./largeTextContainer.component.scss']
})

export class LargeTextContainerComponent implements OnInit {
  @Input() text: string[];
  @Input() hint: string;
  textToShow: string | string[];
  showFull = false;
  wrap = true;
  addOverflow = false;

  ngOnInit(): void {
    this.selectTestToShow();
  }

  toggleFullView() {
    this.showFull = !this.showFull;
    if (this.showFull) {
      this.revertView();
      setTimeout(() => this.addOverflow = true, 500);
    } else {
      setTimeout(() => this.revertView(), 500);
      this.addOverflow = false;
    }
  }

  revertView() {
    this.wrap = !this.wrap;
    this.selectTestToShow();
  }

  selectTestToShow() {
    this.textToShow = this.showFull
      ? this.text
      : this.hint
        ? this.hint
        : this.text;
  }
}
