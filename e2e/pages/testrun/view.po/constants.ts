import { by, element } from 'protractor';
import { SmartTable } from '../../../elements/smartTable.element';
import { ResultSearcher } from '../../../elements/searcher';

export const baseUrl = function (projectId, testRunId) {
    return `#/project/${projectId}/testrun/${testRunId}`;
};

export const names = {
    pageName: 'Test Run View Page',
    buildNameLabel: 'Build Name:',
    milestoneLabel: 'Milestone:',
    testSuiteLabel: 'Test Suite:',
    startTimeLabel: 'Start Time:'
};

export const elements = {
    uniqueElement: element(by.id('test-run-view')),
    buildNameLink: element(by.xpath(`//li[.//label[contains(text(), '${names.buildNameLabel}')]]//a`)),
    milestoneField: element(by.xpath(`//li[.//label[contains(text(), '${names.milestoneLabel}')]]//input`)),
    testSuiteLink: element(by.xpath(`//li[.//label[contains(text(), '${names.testSuiteLabel}')]]//a`)),
    startTimeLabel: element(by.xpath(`//li[.//label[contains(text(), '${names.startTimeLabel}')]]//p`)),
    resultsTable: new SmartTable(by.css('#testRunViewResultsGrid #resultsGridMain')),
    resultSearcher: new ResultSearcher(by.id('resultSearcher')),
    resultsChart: element(by.id('finalResultsChart')),
    resolutionsChart: element(by.id('resultResolutionsChart')),
};

export const regexps = {
    // tslint:disable-next-line: max-line-length
    startDateRegexp: '(?<day>(\\d{2}))\\/(?<month>(\\d{2}))\\/(?<year>(\\d{2}))\\s(?<hours>(\\d{2})):(?<minutes>(\\d{2})):(?<seconds>(\\d{2}))\\s(?<period>(\\w{2}))'
};

export const columns = {
    testName: 'Test Name',
    failReason: 'Fail Reason',
    result: 'Result',
    resolution: 'Resolution',
    assignee: 'Assignee',
    comment: 'Comment',
};

export const results = {
    none: { chartId: -1, name: 'None' },
    passed: { chartId: 1, name: 'Passed' }
};

export const resolutions = {
    none: { chartId: -1, name: 'None' },
    testIssue: { chartId: 3, name: 'Test Issue' }
};

export const pieChartClickSectionScript = `
(function clickChart(el, etype, eventActiveProperty) {
  if (el.fireEvent) {
      el.fireEvent('on' + etype);
  } else {
      var evObj = document.createEvent('Events');
      evObj.initEvent(etype, true, false);
      evObj['active'] = eventActiveProperty;
      el.dispatchEvent(evObj);
  }
})(arguments[0], 'chartClick', [{_index: arguments[1]}])
`;
