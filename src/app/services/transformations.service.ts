import { Injectable } from '@angular/core';
import { TFOrder } from '../elements/table-filter/tfColumn';

@Injectable()
export class TransformationsService {

  msToDurationString(ms: number): string {
    if (!ms) { return '0s'; }
    const duration = ms / 1000;
    const hours = (duration - duration % 3600) / 3600;
    const minutes = (duration - hours * 3600 - (duration - hours * 3600) % 60) / 60;
    const seconds = duration - (hours * 3600 + minutes * 60);
    return `${hours > 9 ? hours : '0' + hours}${minutes > 9 ? minutes : '0' + minutes}${seconds > 9 ? seconds : '0' + seconds}`;
  }

  getPropertyValue(entity: any, property: string) {
    if (!property || !entity) { return false; }
    let props = property.toString().split('.');
    let val = entity;
    if (!val[props[0]]) { props = props.filter(x => x !== props[0]); }
    if (props.length < 1) { return undefined; }
    props.forEach(prop => {
      if (val) { val = val[prop]; }
    });
    return val;
  }

  sort(data: any[], by: { order: string, property: string }) {
    const propVal = data.filter(x => this.getPropertyValue(x, by.property));
    if (propVal.length > 0) {
      if (typeof this.getPropertyValue(propVal[0], by.property) === 'string') {
        if (by.order === TFOrder.asc) {
          data.sort((a, b) => {
            const aVal = `${this.getPropertyValue(a, by.property)}`;
            const bVal = `${this.getPropertyValue(b, by.property)}`;
            return 0 - (aVal.toLowerCase() > bVal.toLowerCase() ? 1 : -1);
          });
        } else if (by.order === TFOrder.desc) {
          data.sort((a, b) => {
            const aVal = `${this.getPropertyValue(a, by.property)}`;
            const bVal = `${this.getPropertyValue(b, by.property)}`;
            return 0 - (aVal.toLowerCase() < bVal.toLowerCase() ? 1 : -1);
          });
        }
      } else if (typeof this.getPropertyValue(propVal[0], by.property) === 'number') {
        if (by.order === TFOrder.asc) {
          data.sort((a, b) => {
            const aProp = this.getPropertyValue(a, by.property) ? this.getPropertyValue(a, by.property) : 0;
            const bProp = this.getPropertyValue(b, by.property) ? this.getPropertyValue(b, by.property) : 0;
            return 0 - (aProp - bProp > 0 ? 1 : -1);
          });
        } else if (by.order === TFOrder.desc) {
          data.sort((a, b) => {
            const aProp = this.getPropertyValue(a, by.property) ? this.getPropertyValue(a, by.property) : 0;
            const bProp = this.getPropertyValue(b, by.property) ? this.getPropertyValue(b, by.property) : 0;
            return 0 - (aProp - bProp < 0 ? 1 : -1);
          });
        }
      } else if (typeof this.getPropertyValue(propVal[0], by.property) === 'object') {
        if (by.order === TFOrder.asc) {
          data.sort((a, b) => {
            const aProp = this.getPropertyValue(a, by.property) ? this.getPropertyValue(a, by.property) : 0;
            const bProp = this.getPropertyValue(b, by.property) ? this.getPropertyValue(b, by.property) : 0;
            return 0 - (aProp - bProp > 0 ? 1 : -1);
          });
        } else if (by.order === TFOrder.desc) {
          data.sort((a, b) => {
            const aProp = this.getPropertyValue(a, by.property) ? this.getPropertyValue(a, by.property) : 0;
            const bProp = this.getPropertyValue(b, by.property) ? this.getPropertyValue(b, by.property) : 0;
            return 0 - (aProp - bProp < 0 ? 1 : -1);
          });
        }
      }
    }
  }

  sortArrayByWeight(data: any[], by: { order: string, property: string, weights?: { value: any, weight: number }[] }) {
    if (by.order === TFOrder.asc) {
      data.sort((a, b) => {
        const aProp = this.getPropertyValue(a, by.property) ? this.getWeight(this.getPropertyValue(a, by.property), by.weights) : 0;
        const bProp = this.getPropertyValue(b, by.property) ? this.getWeight(this.getPropertyValue(b, by.property), by.weights) : 0;
        return 0 - (aProp - bProp > 0 ? 1 : -1);
      });
    } else if (by.order === TFOrder.desc) {
      data.sort((a, b) => {
        const aProp = this.getPropertyValue(a, by.property) ? this.getWeight(this.getPropertyValue(a, by.property), by.weights) : 0;
        const bProp = this.getPropertyValue(b, by.property) ? this.getWeight(this.getPropertyValue(b, by.property), by.weights) : 0;
        return 0 - (aProp - bProp < 0 ? 1 : -1);
      });
    }
  }

  private getWeight(value: any[], weights: { value: any, weight: number }[]): number {
    let weight = 0;
    value.forEach(x => {
      const valueWieght = weights.find(y => y.value === x);
      if (valueWieght) {
        weight += valueWieght.weight;
      } else {
        console.log(`${value} is not described in ${JSON.stringify(weights)}`);
      }
    });

    return weight;
  }

  calculateDuration(duration) {
    if (duration) {
      let newduration = duration / 1000;
      const hours = (newduration - newduration % 3600) / 3600;
      const minutes = (newduration - hours * 3600 - (newduration - hours * 3600) % 60) / 60;
      const seconds = newduration - (hours * 3600 + minutes * 60);
      newduration = seconds + minutes * 100 + hours * 10000;
      return this.zeroPad(newduration, 6);
    }
    return '000000';
  }

  zeroPad(num, places) {
    const zero = places - num.toString().length + 1;
    return Array(+(zero > 0 && zero)).join('0') + num;
  }

  getFileNameFromPath(path: string) {
    return path.split('\\').pop().split('/').pop();
  }
}
