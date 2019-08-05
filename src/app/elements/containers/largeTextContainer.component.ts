import { Component, Input } from '@angular/core';

@Component({
  selector: 'large-text-container',
  templateUrl: './largeTextContainer.component.html',
  styleUrls: ['./largeTextContainer.component.css']
})

export class LargeTextContainerComponent {
  @Input() text: string[];
  showFull = false;
  wrap = true;

  toggleFullView() {
    this.showFull = !this.showFull;
    if (this.showFull) {
      this.wrap = !this.wrap;
    } else {
      setTimeout(() => this.wrap = !this.wrap, 500);
    }
  }
}
