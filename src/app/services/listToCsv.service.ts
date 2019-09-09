import { Injectable } from '@angular/core';
import { LocalPermissions } from '../shared/models/LocalPermissions';
import { TestSuiteStat } from '../shared/models/testSuite';
import { ElementFinder } from 'protractor';

@Injectable()
export class ListToCsvService {
  constructor() { }

  generateTestCsvString(tests: TestSuiteStat[], users: LocalPermissions[]): string {
    let csv = 'Test Id,Test Name,Test Author,Total Runs,Passed,Failed,Application Issue,Autotest Issue,Bug Not Assigned\r\n';
    tests.forEach(test => {
      const user = users.find(x => x.user.id === test.developer_id);
      let newString = '';
      newString += `${test.id},`;
      newString += `"${test.name}",`;
      newString += user === undefined ? '"not assigned",' : `"${user.user.first_name} ${user.user.second_name}",`;
      newString += `${test.total_runs},`;
      newString += `${test.passed},`;
      newString += `${test.failed},`;
      newString += `${test.app_issue},`;
      newString += `${test.autotest_issue},`;
      newString += `${test.resolution_na}\r\n`;
      csv += newString;
    });
    return csv;
  }

  generateCSVString(data: any[], columns) {
    const columnsForCSV: string[] = [];
    const rowsCSV: string[] = [];
    columns.forEach((element: ElementFinder) => {
      if (element.name !== 'Selector' && element.name !== 'Action') {
        columnsForCSV.push(element.name);
      }
    });
    data.forEach(entity => {
      const rowValues: string[] = [];
      columns.forEach((element: ElementFinder) => {
        if (element.name !== 'Selector' && element.name !== 'Action') {
          rowValues.push(this.correctValue(this.getPropertyValue(entity, element)));
        }
      });
      rowsCSV.push(rowValues.join(','));
    });
    rowsCSV.unshift(columnsForCSV.join(','));

    return rowsCSV.join('\n');
  }

  correctValue(object: any) {
    if (object === undefined) {
      return '';
    }
    const stringValue: String = object.toString();
    return `"${stringValue.replace(/(\r\n|\r|\n)/g, ' ')}"`;
  }

  getPropertyValue(entity: any, column) {
    const props = column.property.toString().split('.');
    let val = entity;
    props.forEach(prop => {
      if (val) { val = val[prop]; }
    });
    if (column.type === 'date') {
      val = new Date(val).toLocaleString();
    }
    return val;
  }
}
