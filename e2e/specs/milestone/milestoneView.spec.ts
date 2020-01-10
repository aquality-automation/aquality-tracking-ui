import { logIn } from '../../pages/login.po';
import { projectList } from '../../pages/project/list.po';
import { milestoneList } from '../../pages/milestone/list.po';
import { milestoneView } from '../../pages/milestone/view.po';

import usersTestData from '../../data/users.json';

import loginTestRunJson from '../../data/import/milestoneView/login.json';
import testRun_ManagerTestRunJson from '../../data/import/milestoneView/testRunManager.json';
import testRun_ViewerTestRunJson from '../../data/import/milestoneView/testRunViewer.json';

import { ProjectHelper } from '../../helpers/project.helper';
import { TestRun } from '../../../src/app/shared/models/testRun';
import { Milestone } from '../../../src/app/shared/models/milestone';

const projectHelper: ProjectHelper = new ProjectHelper();

const milestones: { version1: Milestone, version2: Milestone } = {
    version1: { name: 'v1.1.0' },
    version2: { name: 'v1.2.0' }
};

const suites = {
    login: 'Login',
    testRun_Manager: 'Test Run: Manager',
    testRun_Viewer: 'Test Run: Viewer'
};

const importedRuns: { login: TestRun, testRun_Manager: TestRun, testRun_Viewer: TestRun } = {
    login: undefined,
    testRun_Manager: undefined,
    testRun_Viewer: undefined
};

const assigneMilestone = (testRun: TestRun) => {
    return projectHelper.editorAPI.createTestRun({
        id: testRun.id,
        project_id: testRun.project_id,
        milestone_id: milestones.version1.id
    });
};

describe('Milestone:', () => {

    beforeAll(async () => {
        await projectHelper.init({
            viewer: usersTestData.viewer
        });

        milestones.version1 = await projectHelper.editorAPI.createMilestone(milestones.version1);
        milestones.version2 = await projectHelper.editorAPI.createMilestone(milestones.version2);
    });

    afterAll(async () => {
        return projectHelper.dispose();
    });

    describe(`Milestone View: Viewer role:`, () => {
        beforeAll(async () => {
            await logIn.logInAs(usersTestData.viewer.user_name, usersTestData.viewer.password);
            return projectHelper.openProject();
        });

        it('I can open Milestone View page', async () => {
            await projectList.menuBar.milestones();
            await milestoneList.openMilestone(milestones.version1.name);
            return expect(milestoneView.isOpened()).toBe(true, `Milestone ${milestones.version1.name} view page is not opened!`);
        });

        it('I can see empty table when no testruns assigned to Milestone', async () => {
            return expect(milestoneView.isEmpty())
                .toBe(true, `Milestone ${milestones.version1.name} view page should not contain any results!`);
        });

        it('I can see not executed tests when imported test run is not assigned to milestone', async () => {
            const imported = await projectHelper.importer.executeCucumberImport(suites.login, [loginTestRunJson], ['login.json']);
            importedRuns.login = imported[0];

            await milestoneView.menuBar.milestones();
            await milestoneList.openMilestone(milestones.version1.name);

            const tableComparisonResult = await milestoneView.checkIfTableEqualToCSv('/expected/milestoneView/noAssignedTestRuns.csv');
            return expect(tableComparisonResult.result).toBe(true, tableComparisonResult.message);
        });

        it('I can see results from test run that assigned to milestone', async () => {
            await assigneMilestone(importedRuns.login);
            await milestoneView.menuBar.milestones();
            await milestoneList.openMilestone(milestones.version1.name);
            await milestoneView.removeFinishedColumn();

            const tableComparisonResult = await milestoneView.checkIfTableEqualToCSv('/expected/milestoneView/firstAssignedTestRun.csv');
            return expect(tableComparisonResult.result).toBe(true, tableComparisonResult.message);
        });

        it('I can see Not Executed results from second suite', async () => {
            const imported = await projectHelper.importer
                .executeCucumberImport(suites.testRun_Manager, [testRun_ManagerTestRunJson], ['ManagerTestRunJson.json']);
            importedRuns.testRun_Manager = imported[0];

            await milestoneView.menuBar.milestones();
            await milestoneList.openMilestone(milestones.version1.name);
            await milestoneView.removeFinishedColumn();

            const tableComparisonResult = await milestoneView.checkIfTableEqualToCSv('/expected/milestoneView/assignedAndUnissigned.csv');
            return expect(tableComparisonResult.result).toBe(true, tableComparisonResult.message);
        });

        it('I can see Distinct Tests test results', async () => {
            const imported = await projectHelper.importer
                .executeCucumberImport(suites.testRun_Viewer, [testRun_ViewerTestRunJson], ['ViewerTestRunJson.json']);
            importedRuns.testRun_Viewer = imported[0];

            await assigneMilestone(importedRuns.testRun_Manager);
            await assigneMilestone(importedRuns.testRun_Viewer);

            await milestoneView.menuBar.milestones();
            await milestoneList.openMilestone(milestones.version1.name);
            await milestoneView.removeFinishedColumn();

            await milestoneView.setDistinctTest(true);

            const tableComparisonResult = await milestoneView.checkIfTableEqualToCSv('/expected/milestoneView/distinctResults.csv');
            return expect(tableComparisonResult.result).toBe(true, tableComparisonResult.message);
        });

        it('I can see Suite Tests test results', async () => {
            await milestoneView.setDistinctTest(false);

            const tableComparisonResult = await milestoneView.checkIfTableEqualToCSv('/expected/milestoneView/suitesResults.csv');
            return expect(tableComparisonResult.result).toBe(true, tableComparisonResult.message);
        });

        it('I can Filter results by clicking Final Result chart', async () => {
            const clickedSectionName = await milestoneView.clickResultPieChartPassedSection();
            return expect(milestoneView.resultsAreFilteredByResult(clickedSectionName))
                .toBe(true, 'Results are not filtered by Result');
        });

        it('I can Filter results by clicking Result Resolution chart', async () => {
            const clickedSectionName = await milestoneView.clickResolutionPieChartNotAssignedSection();
            return expect(milestoneView.resultsAreFilteredByResolution(clickedSectionName))
                .toBe(true, 'Results are not filtered by Resolution');
        });
    });
});

