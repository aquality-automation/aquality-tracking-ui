import { Injectable } from '@angular/core';
import { LocalPermissions } from '../shared/models/LocalPermissions';
import { TestSuiteStat } from '../shared/models/testSuite';



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
    let csv = '';
    columns.forEach((element, index) => {
      if (index < columns.length - 1) { csv += `${element.name},`; }
      if (index === columns.length - 1) { csv += `${element.name}\r\n`; }
    });
    data.forEach(entity => {
      columns.forEach((element, index) => {
        if (index < columns.length - 1) { csv += `"${this.emptyStrIfUndefined(this.getPropertyValue(entity, element))}",`; }
        if (index === columns.length - 1) { csv += `"${this.emptyStrIfUndefined(this.getPropertyValue(entity, element))}"\r\n`; }
      });
    });

    return csv;
  }

  emptyStrIfUndefined(obj) {
    if (obj === undefined) {
      return '';
    }
    return obj;
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
