import { logIn } from '../../pages/login.po';
import { projectList } from '../../pages/project/list.po';
import { ProjectView } from '../../pages/project/view.po';
import { Matrix } from '../../pages/testrun/matrix.po';
import { Project } from '../../../src/app/shared/models/project';
import { prepareProject, executeCucumberImport, generateBuilds } from '../project.hooks';
import { TestRunList } from '../../pages/testrun/list.po';
import { testData } from '../../utils/testData.util';
import { compareCSVStrings } from '../../utils/csv.util';

import cucumberImport from '../../data/import/cucumber.json';
import users from '../../data/users.json';
import projects from '../../data/projects.json';
import { TestRunView } from '../../pages/testrun/view.po';

describe('Test Run Matrix', () => {
    const projectView = new ProjectView();
    const testRunList = new TestRunList();
    const testRunView = new TestRunView();
    const matrix = new Matrix();
    const project: Project = projects.customerOnly;
    project.name = new Date().getTime().toString();
    let importToken: string;
    let projectId: number;
    const builds = generateBuilds(6);
    const imports =
    [
        JSON.stringify(cucumberImport),
        JSON.stringify(cucumberImport),
        JSON.stringify(cucumberImport),
        JSON.stringify(cucumberImport),
        JSON.stringify(cucumberImport),
        JSON.stringify(cucumberImport)
    ];

    beforeAll(async () => {
        await logIn.logInAs(users.admin.user_name, users.admin.password);
        importToken = await prepareProject(project);
        projectId = await projectView.getCurrentProjectId();
        await executeCucumberImport(projectId, 'Test', importToken, imports, builds.filenames);
        await projectView.menuBar.testRuns();
        const isTestRunAppear = await testRunList.waitForTestRun(builds.names.build_6);
        expect(isTestRunAppear).toBe(true, 'Imports were not finished!');
    });

    afterAll(async () => {
        await projectList.removeProject(project.name);
        if (await projectList.menuBar.isLogged()) {
            return projectList.menuBar.clickLogOut();
        }
    });

    it('Can Open Matrix Page', async () => {
        await testRunList.clickSuiteMatrix();
        return expect(matrix.isOpened()).toBe(true, 'Matrix page was not opened!');
    });

    it('Show button is hidden when Suite is not selected', async () => {
        return expect(matrix.isShowButtonAvailable()).toBe(false, 'Show button should be invisible when Suite is not selected');
    });

    it('Show button is visible when Suite is selected', async () => {
        await matrix.selectSuite('Test');
        return expect(matrix.isShowButtonAvailable()).toBe(true, 'Show button should be visible when Suite is selected');
    });

    it('Results Number is 20 by default', async () => {
        return expect(matrix.getResultsNumberLookupValue()).toBe('20', '20 should be selected in Results Number');
    });

    it('All option is available in Results Number lookup', async () => {
        await matrix.setResultsNumberLookupValue('All');
        return expect(matrix.getResultsNumberLookupValue()).toBe('All', 'All should be selected in Results Number');
    });

    it('Search can be executed without selecting Label (Show Resolution)', async () => {
        await matrix.clickShow();
        const actualTableCSV = await matrix.getCSV();
        const expectedTableCSV = await testData.readAsString('/matrixTable/allShowResolution.csv');
        const comparisonResult = compareCSVStrings(actualTableCSV, expectedTableCSV, true);
        expect(comparisonResult.missedFromActual.length)
            .toBe(0, `Not all actual results are in expected list:\n${comparisonResult.missedFromActual.join('\n')}`);
        expect(comparisonResult.missedFromActual.length)
            .toBe(0, `Not all expected results are in actual list:\n${comparisonResult.missedFromExpected.join('\n')}`);
    });

    it('Show Resolution is selected by default', async () => {
        return expect(matrix.isShowResolutionSelected()).toBe(true, 'Show resolution Should be selected!');
    });

    it('Results are changed when Show Resolution is changed (Show Result)', async () => {
        await matrix.swithOffShowResolution();
        const actualTableCSV = await matrix.getCSV();
        const expectedTableCSV = await testData.readAsString('/matrixTable/allShowResults.csv');
        const comparisonResult = compareCSVStrings(actualTableCSV, expectedTableCSV, true);
        expect(comparisonResult.missedFromActual.length)
            .toBe(0, `Not all actual results are in expected list:\n${comparisonResult.missedFromActual.join('\n')}`);
        expect(comparisonResult.missedFromActual.length)
            .toBe(0, `Not all expected results are in actual list:\n${comparisonResult.missedFromExpected.join('\n')}`);
    });

    it('Search can be executed with Result Number filter (5) (Show Result)', async () => {
        await matrix.setResultsNumberLookupValue('5');
        await matrix.clickShow();
        const actualTableCSV = await matrix.getCSV();
        const expectedTableCSV = await testData.readAsString('/matrixTable/5ShowResults.csv');
        const comparisonResult = compareCSVStrings(actualTableCSV, expectedTableCSV, true);
        expect(comparisonResult.missedFromActual.length)
            .toBe(0, `Not all actual results are in expected list:\n${comparisonResult.missedFromActual.join('\n')}`);
        expect(comparisonResult.missedFromActual.length)
            .toBe(0, `Not all expected results are in actual list:\n${comparisonResult.missedFromExpected.join('\n')}`);
    });

    it('Search can be executed with Label filter (Manual) (Show Result)', async () => {
        await matrix.setResultsNumberLookupValue('All');
        await matrix.setLabelLookupValue('Manual');
        await matrix.clickShow();
        const actualTableCSV = await matrix.getCSV();
        const expectedTableCSV = await testData.readAsString('/matrixTable/allManual.csv');
        const comparisonResult = compareCSVStrings(actualTableCSV, expectedTableCSV);
        expect(comparisonResult.missedFromActual.length)
            .toBe(0, `Not all actual results are in expected list:\n${comparisonResult.missedFromActual.join('\n')}`);
        expect(comparisonResult.missedFromActual.length)
            .toBe(0, `Not all expected results are in actual list:\n${comparisonResult.missedFromExpected.join('\n')}`);
    });

    it('Test Run can be opened by rightclick header', async () => {
        await matrix.setResultsNumberLookupValue('All');
        await matrix.setLabelLookupValue('Auto');
        await matrix.clickShow();
        const header = await matrix.getFirstHeader();
        const testRunId = matrix.getTestRunIdFromColumnName(header);
        await matrix.rightClickTestRunHeader(header);
        expect(testRunView.isOpened()).toBe(true, 'Test run was not opened!');
        expect(testRunView.getId()).toBe(testRunId, 'Wrong Test run was opened!');
    });
});
