import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-single-line-bar-chart',
  templateUrl: './single-line-bar-chart.component.html',
  styleUrls: ['./single-line-bar-chart.component.css']
})
export class SingleLineBarChartComponent implements OnInit {

  @Input() data: SingleLineBarChartData[];
  dataToShow: SingleLineBarChartData[];

  constructor() { }

  ngOnInit() {
    this.updateData();
  }

  ngOnChanges() {
    this.updateData()
  }

  updateData() {
    if (this.data) {
      const sum = this.data.map(item => item.value).reduce((prev, next) => prev + next);
      this.data.forEach(element => {
        element['percent'] = (element.value / sum) * 100;
      });

      this.dataToShow = this.data.filter(x => x.value !== 0)
    }
  }

}

export class SingleLineBarChartData {
  value: number;
  color: string;
  label: string;
}
