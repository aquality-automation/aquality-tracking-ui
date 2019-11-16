import { LogIn } from '../../../pages/login.po';
import { ProjectList } from '../../../pages/project/list.po';
import { Project } from '../../../../src/app/shared/models/project';
import { UserAdministration } from '../../../pages/administration/users.po';
import { prepareProject, setProjectPermissions, executeCucumberImport } from '../../project.hooks';
import usersTestData from '../../../data/users.json';
import projects from '../../../data/projects.json';
import resolutions from '../../../data/resolutions.json';
import differentError from '../../../data/import/regexImportErrorSearch/differentError.json';
import firstError from '../../../data/import/regexImportErrorSearch/firstError.json';
import sameError from '../../../data/import/regexImportErrorSearch/sameError.json';
import { ProjectSettingsAdministration } from '../../../pages/administration/projectSettings.po';
import { PermissionsAdministration } from '../../../pages/administration/permissions.po';
import { ProjectView } from '../../../pages/project/view.po';
import { TestRunList } from '../../../pages/testrun/list.po';
import { TestRunView } from '../../../pages/testrun/view.po';
import { User } from '../../../../src/app/shared/models/user';

const importFiles = {
    differentError: JSON.stringify(differentError),
    firstError: JSON.stringify(firstError),
    sameError: JSON.stringify(sameError)
};

const builds = {
    build_1: 'build_1',
    build_2: 'build_2',
    build_3: 'build_3',
};

const localManager: User = usersTestData.localManager;

describe('Administartion: Project Settings:', () => {
    const logInPage: LogIn = new LogIn();
    const projectsList: ProjectList = new ProjectList();
    const userAdministration: UserAdministration = new UserAdministration();
    const permissionsAdministration: PermissionsAdministration = new PermissionsAdministration();
    const projectSettingsAdministration: ProjectSettingsAdministration = new ProjectSettingsAdministration();
    const projectView: ProjectView = new ProjectView();
    const testRunList: TestRunList = new TestRunList();
    const testRunView: TestRunView = new TestRunView();

    const project: Project = projects.customerOnly;
    project.name = new Date().getTime().toString();
    let importToken: string;
    let projectId: number;
    const testFailed = 'Test Feature with all results: step failed';
    const testPending = 'Test Feature with all results: Step skipped';
    const commentRegex = 'Should be filled by regex';
    const commentFulText = 'Should be filled by full text';

    beforeAll(async () => {
        await logInPage.logIn(usersTestData.admin.user_name, usersTestData.admin.password);
        importToken = await prepareProject(project);
        projectId = await projectView.getCurrentProjectId();
        await (await projectsList.menuBar.user()).administration();
        await userAdministration.sidebar.permissions();
        await setProjectPermissions(project, {
            localManager: usersTestData.localManager,
        });
        return permissionsAdministration.menuBar.clickLogOut();
    });

    afterAll(async () => {
        await logInPage.logIn(usersTestData.admin.user_name, usersTestData.admin.password);
        await projectsList.isOpened();
        await projectsList.removeProject(project.name);
    });
    describe(`Search Pattern:`, () => {
        beforeAll(async () => {
            await logInPage.logIn(localManager.user_name, localManager.password);
            await projectsList.openProject(project.name);
            await (await projectsList.menuBar.user()).administration();
            await userAdministration.sidebar.projectSettings();
            await executeCucumberImport(projectId, 'Regex', importToken, [importFiles.firstError], [`${builds.build_1}.json`]);
        });

        it('I can set Import Compare Results Pattern', async () => {
            await projectSettingsAdministration.selectProject(project.name);
            await projectSettingsAdministration.setImportCompareResultsPattern('\\[error\\]\\n(.*)\\n\\[error\\]');
            await projectSettingsAdministration.clickSave();
            await expect(projectSettingsAdministration.notification.isSuccess())
                .toBe(true, 'Success meessage is not shown on save settings!');
            await expect(projectSettingsAdministration.notification.getContent())
                .toBe(`'${project.name}' project was updated!`, 'Success meessage is wrong!');
            await projectSettingsAdministration.notification.close();
        });

        it('Results can be inherithed from previous run using Regexp', async () => {
            await projectSettingsAdministration.menuBar.clickLogo();
            await projectsList.openProject(project.name);
            await projectView.menuBar.testRuns();
            await testRunList.openTestRun(builds.build_1);
            await testRunView.setResolution(resolutions.global.appIssue.name, testFailed);
            await testRunView.setComment(commentRegex, testFailed);
            await testRunView.setResolution(resolutions.global.environmentIssue.name, testPending);
            await testRunView.setComment(commentFulText, testPending);
            await executeCucumberImport(projectId, 'Regex', importToken, [importFiles.sameError], [`${builds.build_2}.json`]);
            await projectView.menuBar.testRuns();
            await testRunList.openTestRun(builds.build_2);
            expect(await testRunView.getResolution(testFailed))
                .toBe(resolutions.global.appIssue.name, 'Resolution was not autofilled!');
            expect(await testRunView.getComment(testFailed))
                .toBe(commentRegex, 'Comment was not autofilled!');
            expect(await testRunView.getResolution(testPending))
                .toBe(resolutions.global.environmentIssue.name, 'Resolution was not autofilled!');
            expect(await testRunView.getComment(testPending))
                .toBe(commentFulText, 'Comment was not autofilled!');
        });

        it('Results is not inherithed when Regex group is not equal', async () => {
            await executeCucumberImport(projectId, 'Regex', importToken, [importFiles.differentError], [`${builds.build_3}.json`]);
            await projectView.menuBar.testRuns();
            await testRunList.openTestRun(builds.build_3);
            expect(await testRunView.getResolution(testFailed))
                .toBe(resolutions.global.notAssigned.name, 'Resolution was autofilled!');
            expect(await testRunView.getComment(testFailed))
                .toBe('Add...', 'Comment was autofilled!');
            expect(await testRunView.getResolution(testPending))
                .toBe(resolutions.global.environmentIssue.name, 'Resolution was not autofilled!');
            expect(await testRunView.getComment(testPending))
                .toBe(commentFulText, 'Comment was not autofilled!');
        });
    });
});

