import { logIn } from '../../pages/login.po';
import { projectView } from '../../pages/project/view.po';
import { testRunView } from '../../pages/testrun/view.po';
import { importPage } from '../../pages/import.po';
import { ProjectHelper } from '../../helpers/project.helper';
import { testRunList } from '../../pages/testrun/list.po';
import { testData } from '../../utils/testData.util';

import users from '../../data/users.json';
import cucumberImport from '../../data/import/cucumber.json';
import { ImportFormats } from '../../api/importer.api';

describe('Import Test Run: Add to Last Testrun', () => {
    const projectHelper: ProjectHelper = new ProjectHelper();
    const ui = {
        buildName: 'cucumber',
        suiteName: 'UIImport'
    };
    const api = {
        buildName: 'AddToLast',
        suiteName: 'AddToLast'
    };
    const importFiles = {
        cucumber: '/import/cucumber.json',
        mstest: '/import/mstest.trx'
    };

    beforeAll(async () => {
        await projectHelper.init();
        await logIn.logInAs(users.admin.user_name, users.admin.password);
        await projectHelper.openProject();
    });

    afterAll(async () => {
        await projectHelper.dispose();
    });

    it('You can import results into Last Test Run via UI', async () => {
        await projectView.menuBar.import();
        await importPage.selectImportType(importPage.importTypes.cucumber);
        await importPage.uploadFile(testData.getFullPath(importFiles.cucumber));
        await importPage.createAndSelectTestSuite(ui.suiteName);
        let lastImportDate: Date = await importPage.getLatestImportedTestRunDate();
        await importPage.clickImportAll();
        await expect(importPage.waitForNewImportResult(lastImportDate)).toBe(true, 'Cucumber was not imported as first test run');
        await importPage.selectImportType(importPage.importTypes.msTest);
        await importPage.uploadFile(testData.getFullPath(importFiles.mstest));
        await importPage.selectTestSuite(ui.suiteName);
        await importPage.switchOnIntoLastTestRun();
        await importPage.switchOnUnitTestDescription();
        lastImportDate = await importPage.getLatestImportedTestRunDate();
        await importPage.clickImportAll();
        await expect(importPage.waitForNewImportResult(lastImportDate)).toBe(true, 'Trx Was not imported as second test run');
        const lastImportedTestRunID = await importPage.getTestRunIdFromImportRow(0);
        const previousImportedTestRunID = await importPage.getTestRunIdFromImportRow(1);
        return expect(lastImportedTestRunID).toBe(previousImportedTestRunID, 'Test run ID should be the same for both imports!');
    });

    it('Only one testrun was created during import results via UI', async () => {
        await importPage.menuBar.testRuns();
        await testRunList.filterByBuildName(ui.buildName);
        return expect(testRunList.getTestRunsCount()).toBe(1, 'Should be only one test run in table!');
    });

    it('7 results where created during import results via UI', async () => {
        await testRunList.openTestRun(ui.buildName);
        return expect(testRunView.getResultsCount()).toBe(7, '7 results should be imported!');
    });

    it('You can import into Last Test Run via API', async () => {
        await projectView.menuBar.import();
        let lastImportDate: Date = await importPage.getLatestImportedTestRunDate();
        await projectHelper.importer.executeCucumberImport(api.suiteName, [cucumberImport], [`${api.buildName}.json`]);
        await expect(importPage.waitForNewImportResult(lastImportDate)).toBe(true, 'Cucumber was not imported as first test run');
        lastImportDate = await importPage.getLatestImportedTestRunDate();
        projectHelper.importer.executeImport({
            suite: api.suiteName,
            format: ImportFormats.msTest,
            addToLastTestRun: true,
            testNameKey: 'descriptionNode'
        }, [await testData.readAsString(importFiles.mstest)], ['mstest.trx']);
        await expect(importPage.waitForNewImportResult(lastImportDate)).toBe(true, 'Trx Was not imported as second test run');
        const lastImportedTestRunID = await importPage.getTestRunIdFromImportRow(0);
        const previousImportedTestRunID = await importPage.getTestRunIdFromImportRow(1);
        return expect(lastImportedTestRunID).toBe(previousImportedTestRunID, 'Test run ID should be the same for both imports!');
    });

    it('Only one testrun was created during import results via API', async () => {
        await importPage.menuBar.testRuns();
        await testRunList.filterByBuildName(api.buildName);
        return expect(testRunList.getTestRunsCount()).toBe(1, 'Should be only one test run in table!');
    });

    it('7 results where created during import results via API', async () => {
        await testRunList.openTestRun(api.buildName);
        return expect(testRunView.getResultsCount()).toBe(7, '7 results should be imported!');
    });
});
