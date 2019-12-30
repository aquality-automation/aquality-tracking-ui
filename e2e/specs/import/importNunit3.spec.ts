import { logIn } from '../../pages/login.po';
import { projectList } from '../../pages/project/list.po';
import { projectView } from '../../pages/project/view.po';
import { testRunView } from '../../pages/testrun/view.po';
import { importPage } from '../../pages/import.po';
import { Project } from '../../../src/app/shared/models/project';
import { prepareProject } from '../project.hooks';
import { testRunList } from '../../pages/testrun/list.po';
import { testData } from '../../utils/testData.util';
import users from '../../data/users.json';
import projects from '../../data/projects.json';
import { compareCSVStrings } from '../../utils/csv.util';

describe('Import Test Run: Nunit V3', () => {
    const project: Project = projects.nunit3Import;
    const featureName = {
        buildName: 'build 1',
        suiteName: 'featureName'
    };
    const className = {
        buildName: 'build 2',
        suiteName: 'className'
    };
    const importFiles = {
        nunitV3: '/import/Nunit3.xml'
    };
    let apiToken: string;
    let projectId: number;

    beforeAll(async () => {
        await logIn.logInAs(users.admin.user_name, users.admin.password);
        apiToken = await prepareProject(project);
        projectId = await projectView.getCurrentProjectId();
    });

    afterAll(async () => {
        await projectList.removeProject(project.name);
        if (await projectList.menuBar.isLogged()) {
            return projectList.menuBar.clickLogOut();
        }
    });

    it('NUnit v3 option can be selected and Files can be uploaded', async () => {
        await projectView.menuBar.import();
        await importPage.selectImportType(importPage.importTypes.nunitV3);
        await importPage.uploadFile(testData.getFullPath(importFiles.nunitV3));
        return expect(importPage.isFileUploaded(importFiles.nunitV3)).toBe(true, 'File was not added!');
    });

    it('Only Feature: TestName and Class name options available for Test name Key', async () => {
        await expect(importPage.isTestNameTypeVisible(importPage.testNameTypes.featureTestName))
            .toBe(true, 'featureTestName should be Visible');
        await expect(importPage.isTestNameTypeVisible(importPage.testNameTypes.className))
            .toBe(true, 'className should be Visible');
        await expect(importPage.isTestNameTypeVisible(importPage.testNameTypes.testName))
            .toBe(false, 'testName should not be Visible');
        await expect(importPage.isTestNameTypeVisible(importPage.testNameTypes.testDescription))
            .toBe(false, 'testDescription should not be Visible');
    });

    it('Only one Test name Key can be selected', async () => {
        await importPage.selectTestNameType(importPage.testNameTypes.featureTestName);
        await expect(importPage.isTestNameTypeSelected(importPage.testNameTypes.featureTestName))
            .toBe(true, 'featureTestName should be selected');
        await importPage.selectTestNameType(importPage.testNameTypes.className);
        await expect(importPage.isTestNameTypeSelected(importPage.testNameTypes.className))
            .toBe(true, 'className should be selected');
        await expect(importPage.isTestNameTypeSelected(importPage.testNameTypes.featureTestName))
            .toBe(false, 'featureTestName should not be selected');
        await importPage.selectTestNameType(importPage.testNameTypes.featureTestName);
        await expect(importPage.isTestNameTypeSelected(importPage.testNameTypes.featureTestName))
            .toBe(true, 'featureTestName should be selected');
        await expect(importPage.isTestNameTypeSelected(importPage.testNameTypes.className))
            .toBe(false, 'className should not be selected');
    });

    it('You can import Nunit v3 with Feature: TestName names', async () => {
        await importPage.createAndSelectTestSuite(featureName.suiteName);
        await importPage.setBuilName(featureName.buildName);
        const lastImportDate: Date = await importPage.getLatestImportedTestRunDate();
        await importPage.clickImportAll();
        await expect(importPage.waitForNewImportResult(lastImportDate)).toBe(true, 'Nunit 3 with featureName was not imported');
    });

    it('Only one testrun was created during Feature: TestName import results via UI', async () => {
        await importPage.menuBar.testRuns();
        await testRunList.filterByBuildName(featureName.buildName);
        return expect(testRunList.getTestRunsCount()).toBe(1, 'Should be only one test run in table!');
    });

    it('Results were correctly created during Feature: TestName import results via UI', async () => {
        await testRunList.openTestRun(featureName.buildName);
        await testRunView.sortResultsByName();
        const actualResults = await testRunView.getResultsCSV();
        const expected = await testData.readAsString('/resultsTable/nunitV3FeatureName.csv');
        const comparisonResult = compareCSVStrings(actualResults, expected);
        expect(comparisonResult.missedFromActual.length)
            .toBe(0, `Not all actual results are in expected list:\n${comparisonResult.missedFromActual.join('\n')}`);
        expect(comparisonResult.missedFromActual.length)
            .toBe(0, `Not all expected results are in actual list:\n${comparisonResult.missedFromExpected.join('\n')}`);
    });

    it('You can import Nunit v3 with Class Name names', async () => {
        await projectView.menuBar.import();
        await importPage.selectImportType(importPage.importTypes.nunitV3);
        await importPage.uploadFile(testData.getFullPath(importFiles.nunitV3));
        await importPage.selectTestNameType(importPage.testNameTypes.className);
        await importPage.createAndSelectTestSuite(className.suiteName);
        await importPage.setBuilName(className.buildName);
        const lastImportDate: Date = await importPage.getLatestImportedTestRunDate();
        await importPage.clickImportAll();
        await expect(importPage.waitForNewImportResult(lastImportDate)).toBe(true, 'Nunit 3 with Class name was not imported');
    });

    it('Only one testrun was created during Class Name import results via UI', async () => {
        await importPage.menuBar.testRuns();
        await testRunList.filterByBuildName(className.buildName);
        return expect(testRunList.getTestRunsCount()).toBe(1, 'Should be only one test run in table!');
    });

    it('Results were correctly created during Class Name import results via UI', async () => {
        await testRunList.openTestRun(className.buildName);
        await testRunView.sortResultsByName();
        const actualResults = await testRunView.getResultsCSV();
        const expected = await testData.readAsString('/resultsTable/nunitV3ClassName.csv');
        const comparisonResult = compareCSVStrings(actualResults, expected);
        expect(comparisonResult.missedFromActual.length)
            .toBe(0, `Not all actual results are in expected list:\n${comparisonResult.missedFromActual.join('\n')}`);
        expect(comparisonResult.missedFromActual.length)
            .toBe(0, `Not all expected results are in actual list:\n${comparisonResult.missedFromExpected.join('\n')}`);
    });
});
