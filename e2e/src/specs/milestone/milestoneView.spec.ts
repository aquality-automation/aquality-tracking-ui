import { logIn } from '../../pages/login.po';
import { projectList } from '../../pages/project/list.po';
import { milestoneList } from '../../pages/milestone/list.po';
import { milestoneView } from '../../pages/milestone/view.po';
import { ProjectHelper } from '../../helpers/project.helper';
import { TestRun } from '../../../../src/app/shared/models/testRun';
import { Milestone } from '../../../../src/app/shared/models/milestone';
import usersTestData from '../../data/users.json';
import using from 'jasmine-data-provider';
import loginTestRunJson from '../../data/import/milestoneView/login.json';
import testRun_ManagerTestRunJson from '../../data/import/milestoneView/testRunManager.json';
import testRun_ViewerTestRunJson from '../../data/import/milestoneView/testRunViewer.json';

const projectHelper: ProjectHelper = new ProjectHelper();

const milestones: { version1: Milestone, version2: Milestone, version3: Milestone } = {
    version1: { name: 'v1.1.0' },
    version2: { name: 'v1.2.0' },
    version3: { name: 'v1.3.0' }
};

const suites = {
    login: 'Login',
    testRun_Manager: 'Test Run: Manager',
    testRun_Viewer: 'Test Run: Viewer',
    base: 'Base'
};

const importedRuns: { login: TestRun, testRun_Manager: TestRun, testRun_Viewer: TestRun } = {
    login: undefined,
    testRun_Manager: undefined,
    testRun_Viewer: undefined
};

const assigneMilestone = (testRun: TestRun, milestone: Milestone) => {
    return projectHelper.editorAPI.createTestRun({
        id: testRun.id,
        project_id: testRun.project_id,
        milestone_id: milestone.id
    });
};

const unassigneMilestone = (testRun: TestRun) => {
    return projectHelper.editorAPI.createTestRun({
        id: testRun.id,
        project_id: testRun.project_id,
        milestone_id: 0
    });
};

const editorExamples = {
    localManager: usersTestData.localManager,
    manager: usersTestData.manager,
    localEngineer: usersTestData.localEngineer
};

const notEditorExamples = {
    localAdmin: usersTestData.localAdmin,
    viewer: usersTestData.viewer
};

describe('Milestone:', () => {

    beforeAll(async () => {
        await projectHelper.init({
            localAdmin: usersTestData.localAdmin,
            localManager: usersTestData.localManager,
            localEngineer: usersTestData.localEngineer,
            manager: usersTestData.manager,
            viewer: usersTestData.viewer
        });

        milestones.version1 = await projectHelper.editorAPI.createMilestone(milestones.version1);
        milestones.version2 = await projectHelper.editorAPI.createMilestone(milestones.version2);
        milestones.version3 = await projectHelper.editorAPI.createMilestone(milestones.version3);
        return projectHelper.editorAPI.createSuite({ name: suites.base });
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
            await assigneMilestone(importedRuns.login, milestones.version1);
            await milestoneView.menuBar.milestones();
            await milestoneList.openMilestone(milestones.version1.name);
            await milestoneView.removeGenericColumn();

            const tableComparisonResult = await milestoneView
                .checkIfTableEqualToCSv('/expected/milestoneView/firstAssignedTestRun.csv');
            return expect(tableComparisonResult.result).toBe(true, tableComparisonResult.message);
        });

        it('I can see Not Executed results from second suite', async () => {
            const imported = await projectHelper.importer
                .executeCucumberImport(suites.testRun_Manager, [testRun_ManagerTestRunJson], ['ManagerTestRunJson.json']);
            importedRuns.testRun_Manager = imported[0];
            await projectHelper.editorAPI.addSuiteToMilestone(milestones.version1.name, suites.testRun_Manager);

            await milestoneView.menuBar.milestones();
            await milestoneList.openMilestone(milestones.version1.name);
            await milestoneView.removeGenericColumn();

            const tableComparisonResult = await milestoneView
                .checkIfTableEqualToCSv('/expected/milestoneView/assignedAndUnissigned.csv');
            return expect(tableComparisonResult.result).toBe(true, tableComparisonResult.message);
        });

        it('I can see Distinct Tests test results', async () => {
            const imported = await projectHelper.importer
                .executeCucumberImport(suites.testRun_Viewer, [testRun_ViewerTestRunJson], ['ViewerTestRunJson.json']);
            importedRuns.testRun_Viewer = imported[0];

            await assigneMilestone(importedRuns.testRun_Manager, milestones.version1);
            await assigneMilestone(importedRuns.testRun_Viewer, milestones.version1);

            await milestoneView.menuBar.milestones();
            await milestoneList.openMilestone(milestones.version1.name);
            await milestoneView.removeGenericColumn();

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
            return expect(milestoneView.resultsAreFilteredByIssue(clickedSectionName, ''))
                .toBe(true, 'Results are not filtered by Resolution');
        });
    });

    using(editorExamples, (user, description) => {
        describe(`Milestone View: ${description} role:`, () => {
            let testrun: TestRun;
            beforeAll(async () => {
                await logIn.logInAs(user.user_name, user.password);
                await projectHelper.openProject();
                await projectList.menuBar.milestones();
                testrun = (await projectHelper.importer
                    .executeCucumberImport(suites.base, [testRun_ViewerTestRunJson], ['Base.json']))[0];
                return milestoneList.openMilestone(milestones.version3.name);
            });

            it('I can assign suite to milestone', async () => {
                await milestoneView.addSuite(suites.base);
                return milestoneView.notification.assertIsSuccess(`The milestone '${milestones.version3.name}' was updated.`);
            });

            it('I can see not executed suites', async () => {
                const notExecutedAcual = await milestoneView.getNotExecutedSuites();
                expect(notExecutedAcual).toBe(suites.base, 'Wrong Not Executed Suites value!');
            });

            it('I can not see not executed suites when all suites were executed', async () => {
                await assigneMilestone(testrun, milestones.version3);
                await milestoneView.refreshByBackButton();
                return expect(milestoneView.isNotExecutedSuitesExist())
                    .toBe(false, 'Not executed suites are shown when all suites are executed');
            });

            it('I can remove all suites from milestone', async () => {
                await milestoneView.removeSuite(suites.base);
                await milestoneView.notification.assertIsSuccess(`The milestone '${milestones.version3.name}' was updated.`);
                return unassigneMilestone(testrun);
            });

            it('I can set Due Date', async () => {
                const date = new Date();
                date.setDate(date.getDate() + 1);
                await milestoneView.setDueDate(date);
                return milestoneView.notification.assertIsSuccess(`The milestone '${milestones.version3.name}' was updated.`);
            });

            it('I can not see warning when Due date is in future', async () => {
                return expect(milestoneView.isWarningPresent()).toBe(false, 'Warning should not present when due date is in future!');
            });

            it('I can see warning when Due date is today', async () => {
                const date = new Date();
                await milestoneView.setDueDate(date);
                await milestoneView.notification.assertIsSuccess(`The milestone '${milestones.version3.name}' was updated.`);
                await expect(milestoneView.isWarningPresent()).toBe(true, 'Warning should present when due date is today!');
                return expect(milestoneView.getWarningTitle())
                    .toBe(`Today is the last day for the '${milestones.version3.name}' Milestone`, `Title is wrong! Current date: ${new Date()}, Due date: ${date}`);
            });

            it('I can see warning when Due date is in past', async () => {
                const date = new Date();
                date.setDate(date.getDate() - 1);
                await milestoneView.setDueDate(date);
                await milestoneView.notification.assertIsSuccess(`The milestone '${milestones.version3.name}' was updated.`);
                await expect(milestoneView.isWarningPresent()).toBe(true, `Warning should present when due date is in past! Current date: ${new Date()}, Due date: ${date}`);
                return expect(milestoneView.getWarningTitle())
                    .toBe(`Past due by 1 day`);
            });

            it('I can make Milestone inactive', async () => {
                await milestoneView.setActive(false);
                return milestoneView.notification.assertIsSuccess(`The milestone '${milestones.version3.name}' was updated.`);
            });

            it('I can not see warning when Due date is in past and Milestone is inactive', async () => {
                return expect(milestoneView.isWarningPresent()).toBe(false, 'Warning should not present when milestone is inactive!');
            });

            it('I can not edit due date for inactive milestone', async () => {
                return expect(milestoneView.isDueDateEditable()).toBe(false, 'Due Date should be not editable when milestone is inactive!');
            });

            it('I can not edit suites for inactive milestone', async () => {
                return expect(milestoneView.isSuitesEditable()).toBe(false, 'Sutes should be not editable when milestone is inactive!');
            });

            it('I can make Milestone active', async () => {
                await milestoneView.setActive(true);
                return milestoneView.notification.assertIsSuccess(`The milestone '${milestones.version3.name}' was updated.`);
            });
        });
    });


    using(notEditorExamples, (user, description) => {
        describe(`Milestone View: ${description} role:`, () => {
            beforeAll(async () => {
                await logIn.logInAs(user.user_name, user.password);
                await projectHelper.openProject();
                await projectList.menuBar.milestones();
                return milestoneList.openMilestone(milestones.version3.name);
            });

            it('I can not edit due date for milestone', async () => {
                return expect(milestoneView.isDueDateEditable()).toBe(false, `Due Date should be not editable for ${description} role!`);
            });

            it('I can not edit suites for milestone', async () => {
                return expect(milestoneView.isSuitesEditable()).toBe(false, `Suites should be not editable for ${description} role!`);
            });

            it('I can not edit active status for milestone', async () => {
                return expect(milestoneView.isActiveSwitcherEditable())
                    .toBe(false, `Active Switcher should be not editable for ${description} role!`);
            });
        });
    });
});

