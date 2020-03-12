import { Component, Input } from '@angular/core';
import { BaseLookupComponent } from '../baseLookup';

@Component({
  selector: 'lookup-colored',
  templateUrl: './lookupColors.component.html',
  styleUrls: ['./lookupColors.component.css', '../baseLookup.css']
})
export class LookupColorsComponent extends BaseLookupComponent {
  @Input() colorProperty: string;
  hidden = true;
  emptyValue = undefined;

  getColorFromHash(item: { [x: string]: any; }) {
    if (item) {
      if (typeof item[this.colorProperty] === 'string' && isNaN(item[this.colorProperty])) {
        return {
          'background-color': item[this.colorProperty],
          'color': '#ffffff'
        };
      } else {
        return;
      }
    }
  }

  getColorId(item: { [x: string]: number | string; }): number {
    if (item) {
      if (typeof item[this.colorProperty] === 'number' || !isNaN(+item[this.colorProperty])) {
        return +item[this.colorProperty];
      } else {
        return;
      }
    }
  }
}
