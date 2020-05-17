import { logIn } from '../../pages/login.po';
import { matrix } from '../../pages/testrun/matrix.po';
import { testRunList } from '../../pages/testrun/list.po';
import { testRunView } from '../../pages/testrun/view.po';
import { ProjectHelper } from '../../helpers/project.helper';

import cucumberImport from '../../data/import/cucumber.json';
import users from '../../data/users.json';

describe('Test Run Matrix', () => {
    const projectHepler: ProjectHelper = new ProjectHelper();
    const builds = projectHepler.generateBuilds(6);
    const imports =
    [
        cucumberImport,
        cucumberImport,
        cucumberImport,
        cucumberImport,
        cucumberImport,
        cucumberImport
    ];

    beforeAll(async () => {
        await projectHepler.init({
            manager: users.manager
        });
        await projectHepler.importer.executeCucumberImport('Test', imports, builds.filenames);
        await logIn.logInAs(users.manager.user_name, users.manager.password);
        await projectHepler.openProject();
    });

    afterAll(async () => {
        await projectHepler.dispose();
    });

    it('Can Open Matrix Page', async () => {
        await testRunList.menuBar.testRuns();
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

        const tableComparisonResult = await matrix.checkIfTableEqualToCSv('/matrixTable/allShowResolution.csv');
        return expect(tableComparisonResult.result).toBe(true, tableComparisonResult.message);
    });

    it('Show Resolution is selected by default', async () => {
        return expect(matrix.isShowResolutionSelected()).toBe(true, 'Show resolution Should be selected!');
    });

    it('Results are changed when Show Resolution is changed (Show Result)', async () => {
        await matrix.swithOffShowResolution();

        const tableComparisonResult = await matrix.checkIfTableEqualToCSv('/matrixTable/allShowResults.csv');
        return expect(tableComparisonResult.result).toBe(true, tableComparisonResult.message);
    });

    it('Search can be executed with Result Number filter (5) (Show Result)', async () => {
        await matrix.setResultsNumberLookupValue('5');
        await matrix.clickShow();

        const tableComparisonResult = await matrix.checkIfTableEqualToCSv('/matrixTable/5ShowResults.csv');
        return expect(tableComparisonResult.result).toBe(true, tableComparisonResult.message);
    });

    it('Search can be executed with Label filter (Manual) (Show Result)', async () => {
        await matrix.setResultsNumberLookupValue('All');
        await matrix.setLabelLookupValue('Manual');
        await matrix.clickShow();

        const tableComparisonResult = await matrix.checkIfTableEqualToCSv('/matrixTable/allManual.csv');
        return expect(tableComparisonResult.result).toBe(true, tableComparisonResult.message);
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
