import { Component, OnInit, Input, ViewChild, ElementRef, OnChanges } from '@angular/core';

@Component({
  selector: 'app-single-line-bar-chart',
  templateUrl: './single-line-bar-chart.component.html',
  styleUrls: ['./single-line-bar-chart.component.scss']
})
export class SingleLineBarChartComponent implements OnInit, OnChanges {

  @Input() data: SingleLineBarChartData[];
  @Input() activateParts: number[];
  @ViewChild('lineHolder') lineHolder: ElementRef;
  dataToShow: SingleLineBarChartData[];

  constructor() { }

  ngOnInit() {
    this.updateData();
  }

  ngOnChanges() {
    this.updateData();
    if (this.lineHolder) {
     this.setActiveParts(this.activateParts);
    }
  }

  updateData() {
    if (this.data) {
      const sum = this.data.map(item => item.value).reduce((prev, next) => prev + next);
      for (let i = 0; i < this.data.length; i++) {
        const element = this.data[i];
        element['percent'] = (element.value / sum) * 100;
        element['index'] = i;
      }

      this.dataToShow = this.data.filter(x => x.value !== 0);
    }
  }

  setActiveParts(partIndexes: number[]) {
    if (this.data) {
      const holder = this.lineHolder.nativeElement as HTMLElement;
      this.data.forEach(dataItem => {
        if (this.dataToShow.find(x => x['index'] === dataItem['index'])) {
          const part = holder.getElementsByClassName(`slc-part-${dataItem['index']}`).item(0);
          if (part) {
            if (partIndexes.includes(dataItem['index'])) {
              part.classList.add('active');
              part.dispatchEvent(new CustomEvent('mouseover'));
            } else {
              part.classList.remove('active');
              part.dispatchEvent(new CustomEvent('mouseout'));
            }
          }
        }
      });
    }
  }

  setActive(event: MouseEvent) {
    const target = event.target as HTMLElement;
    target.classList.add('active');
  }

  setInactive(event: MouseEvent) {
    const target = event.target as HTMLElement;
    target.classList.remove('active');
  }
}

export class SingleLineBarChartData {
  value: number;
  color: string;
  label: string;
}
