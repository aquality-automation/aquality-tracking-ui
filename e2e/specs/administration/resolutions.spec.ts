import { LogIn } from '../../pages/login.po';

import { ProjectList } from '../../pages/project/list.po';
import { ProjectCreate } from '../../pages/project/create.po';
import { ProjectView } from '../../pages/project/view.po';
import { SuiteCreate } from '../../pages/suite/create.po';
import { TestCreate } from '../../pages/test/create.po';
import { TestRunCreate } from '../../pages/testrun/create.po';
import { Project } from '../../../src/app/shared/models/project';
import { ResolutionAdministration } from '../../pages/administration/resolutions.po';
import { ResultResolution } from '../../../src/app/shared/models/result_resolution';
import { TestRunList } from '../../pages/testrun/list.po';
import { TestRunView } from '../../pages/testrun/view.po';
import { TestResultView } from '../../pages/testresult.po';
import { browser } from 'protractor';
import { colors } from '../../pages/administration/resolutions.po/constants';

import users from '../../data/users.json';
import projects from '../../data/projects.json';
import suites from '../../data/suites.json';
import tests from '../../data/tests.json';
import testruns from '../../data/testRuns.json';
import resolutions from '../../data/resolutions.json';

describe('Full Admin Administartion Resolution Flow', () => {

    const logInPage: LogIn = new LogIn();
    const projectList: ProjectList = new ProjectList();
    const projectCreate: ProjectCreate = new ProjectCreate();
    const projectView: ProjectView = new ProjectView();
    const suiteCreate: SuiteCreate = new SuiteCreate();
    const testCreate: TestCreate = new TestCreate();
    const testRunCreate: TestRunCreate = new TestRunCreate();
    const testRunList: TestRunList = new TestRunList();
    const testRunView: TestRunView = new TestRunView();
    const testResultView = new TestResultView();
    const resolutionAdministration: ResolutionAdministration = new ResolutionAdministration();
    const resolution: ResultResolution = resolutions.flowTest;
    const globalResolutions: ResultResolution[] = resolutions.global;

    const createTestProject = async (project: Project) => {
        await projectList.clickCreateProjectButton();
        await projectCreate.createProject(project);
        await projectList.openProject(project.name);
        await (await projectView.menuBar.create()).suite();
        await suiteCreate.createSuite(suites.testCreation);
        await (await projectView.menuBar.create()).test();
        await testCreate.createTest(tests.creationTest, suites.testCreation.name);
        await (await projectView.menuBar.create()).testRun();
        await testRunCreate.creteTestRun(testruns.build1, suites.testCreation.name);
        return projectView.menuBar.clickLogo();
    };

    beforeAll(async () => {
        await logInPage.logIn(users.admin.user_name, users.admin.password);
        await createTestProject(projects.resolutionProject);
        await createTestProject(projects.noResolutionProject);
        await (await projectList.menuBar.user()).administration();
        return resolutionAdministration.sidebar.resolutions();
    });

    afterAll(async () => {
        await projectList.removeProject(projects.resolutionProject.name);
        await projectList.removeProject(projects.noResolutionProject.name);
        if (await logInPage.menuBar.isLogged()) {
            return logInPage.menuBar.clickLogOut();
        }
    });

    describe('Create', () => {
        it('I can create Resolution', async () => {
            await resolutionAdministration.selectProject(projects.resolutionProject.name);
            await resolutionAdministration.openCreation();
            await resolutionAdministration.fillName(resolution.name);
            await resolutionAdministration.selectColor(resolution.color as string);
            return resolutionAdministration.clickCreate();
        });
    });

    describe('Usage', () => {
        it('I can select created resolution on test run view Resolution', async () => {
            await resolutionAdministration.menuBar.clickLogo();
            await projectList.openProject(projects.resolutionProject.name);
            await projectView.menuBar.testRuns();
            await testRunList.openTestRun(testruns.build1.build_name);
            await testRunView.setResolution(resolution.name, tests.creationTest.name);
            return expect(testRunView.getResolution(tests.creationTest.name)).toBe(resolution.name, 'Resolution was not selected');
        });

        it('I can select created resolution on test result view Resolution', async () => {
            await testRunView.openResult(tests.creationTest.name);
            await testResultView.waitForIsOpened();
            await testResultView.setResolution(resolution.name);
            await testResultView.saveResult();
            return expect(testResultView.notification.isSuccess()).toBe(true);
        });

        it('I can not select created resolution on test run view Resolution for other projects', async () => {
            await resolutionAdministration.menuBar.clickLogo();
            await projectList.openProject(projects.resolutionProject.name);
            await projectView.menuBar.testRuns();
            await testRunList.openTestRun(testruns.build1.build_name);
            return expect(testRunView.isResolutionPresent(resolution.name, tests.creationTest.name))
                .toBe(false, 'Resolution should not present');
        });
    });

    describe('Update', () => {
        it('I can update created resolution', async () => {
            const newName = new Date().getTime().toString();
            await (await projectList.menuBar.user()).administration();
            await resolutionAdministration.sidebar.resolutions();
            await resolutionAdministration.selectProject(projects.resolutionProject.name);
            await resolutionAdministration.updateResolution(newName, resolutionAdministration.columns.name,
                resolution.name, resolutionAdministration.columns.name);
            resolution.name = newName;
            resolution.color = resolutionAdministration.colors.warning;
            await resolutionAdministration.updateResolution(resolution.color, resolutionAdministration.columns.color,
                resolution.name, resolutionAdministration.columns.name);
            await browser.refresh();
            await resolutionAdministration.sidebar.resolutions();
            await resolutionAdministration.selectProject(projects.resolutionProject.name);
            await expect(await resolutionAdministration.isResolutionPresent(resolution.name)).toBe(true, 'Resolution Name is not Updated');
            await expect(await resolutionAdministration.getResolutionColor(resolution.name))
                .toBe(resolution.color, 'Resolution Color is not Updated');
        });

        it('I can not update global resolutions', async () => {
            for (let i = 0; i < globalResolutions.length; i++) {
                await expect(await resolutionAdministration.isResolutionEditable(globalResolutions[i].name))
                    .toBe(false, `Resulution '${globalResolutions[i].name}' is editable!`);
            }
        });
    });

    describe('Remove', () => {
        it('I can delete used resolution', async () => {
            await resolutionAdministration.clickRemoveResolution(resolution.name);
            await expect(resolutionAdministration.modal.isVisible()).toBe(true, 'Remove Resolution modal is not opened');

            await resolutionAdministration.modal.clickActionBtn('yes');
            await resolutionAdministration.refresh();
            await resolutionAdministration.sidebar.resolutions();
            await resolutionAdministration.selectProject(projects.resolutionProject.name);
            await expect(await resolutionAdministration.isResolutionPresent(resolution.name))
                .toBe(false, 'Resolution was not removed');
        });

        it('Results with deleted resolutions become Not Assigned', async () => {
            await resolutionAdministration.menuBar.clickLogo();
            await projectList.openProject(projects.resolutionProject.name);
            await projectView.menuBar.testRuns();
            await testRunList.openTestRun(testruns.build1.build_name);
            return expect(testRunView.getResolution(tests.creationTest.name))
                .toBe(globalResolutions.find(x => x.color === colors.primary).name, 'Resolution was not reset to primary');
        });
    });
});

