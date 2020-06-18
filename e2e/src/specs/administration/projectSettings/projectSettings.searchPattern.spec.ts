import { logIn } from '../../../pages/login.po';
import { projectList } from '../../../pages/project/list.po';
import usersTestData from '../../../data/users.json';
import resolutions from '../../../data/resolutions.json';
import differentError from '../../../data/import/regexImportErrorSearch/differentError.json';
import firstError from '../../../data/import/regexImportErrorSearch/firstError.json';
import sameError from '../../../data/import/regexImportErrorSearch/sameError.json';
import { projectSettingsAdministration } from '../../../pages/administration/projectSettings.po';
import { userAdministration } from '../../../pages/administration/users.po';
import { projectView } from '../../../pages/project/view.po';
import { testRunList } from '../../../pages/testrun/list.po';
import { testRunView } from '../../../pages/testrun/view.po';
import { User } from '../../../../../src/app/shared/models/user';
import { ProjectHelper } from '../../../helpers/project.helper';
import { Issue } from '../../../../../src/app/shared/models/issue';

const importFiles = {
    differentError: differentError,
    firstError: firstError,
    sameError: sameError
};

const builds = {
    build_1: 'build_1',
    build_2: 'build_2',
    build_3: 'build_3',
};

let issueApp: Issue;
let issueEnv: Issue;

const localManager: User = usersTestData.localManager;

describe('Administartion: Project Settings:', () => {
    const projectHelper: ProjectHelper = new ProjectHelper();
    const testFailed = 'Test Feature with all results: step failed';
    const testPending = 'Test Feature with all results: Step skipped';

    beforeAll(async () => {
        await projectHelper.init({
            localManager: usersTestData.localManager
        });
        [issueApp, issueEnv] = await Promise.all([
            projectHelper.editorAPI.createIssue({
                title: 'Import Compare Results Pattern App Issue',
                resolution_id: resolutions.global.appIssue.id
            }),
            projectHelper.editorAPI.createIssue({
                title: 'Import Compare Results Pattern Env Issue',
                resolution_id: resolutions.global.environmentIssue.id
            })
        ]);
    });

    afterAll(async () => {
        return projectHelper.dispose();
    });

    describe(`Search Pattern:`, () => {
        beforeAll(async () => {
            await logIn.logInAs(localManager.user_name, localManager.password);
            await projectHelper.openProject();
            await projectList.menuBar.administration();
            await userAdministration.sidebar.projectSettings();
            await projectHelper.importer.executeCucumberImport('Regex', [importFiles.firstError], [`${builds.build_1}.json`]);
        });

        it('I can set Import Compare Results Pattern', async () => {
            await projectSettingsAdministration.selectProject(projectHelper.project.name);
            await projectSettingsAdministration.setImportCompareResultsPattern('\\[error\\]\\n(.*)\\n\\[error\\]');
            await projectSettingsAdministration.clickSave();
            return projectSettingsAdministration.notification.assertIsSuccess(`'${projectHelper.project.name}' project was updated!`);
        });

        it('Results can be inherithed from previous run using Regexp', async () => {
            await projectHelper.openProject();
            await projectView.menuBar.testRuns();
            await testRunList.openTestRun(builds.build_1);
            await testRunView.setIssue(`${issueApp.id} ${issueApp.title}`, testFailed);
            await testRunView.setIssue(`${issueEnv.id} ${issueEnv.title}`, testPending);
            await projectHelper.importer.executeCucumberImport('Regex', [importFiles.sameError], [`${builds.build_2}.json`]);
            await projectView.menuBar.testRuns();
            await testRunList.openTestRun(builds.build_2);
            expect(await testRunView.getResolution(testFailed))
                .toBe(resolutions.global.appIssue.name, 'Resolution was not autofilled!');
            expect(await testRunView.getIssue(testFailed))
                .toBe(`${issueApp.id} ${issueApp.title}`, 'Issue was not autofilled!');
            expect(await testRunView.getResolution(testPending))
                .toBe(resolutions.global.environmentIssue.name, 'Resolution was not autofilled!');
            expect(await testRunView.getIssue(testPending))
                .toBe(`${issueEnv.id} ${issueEnv.title}`, 'Issue was not autofilled!');
        });

        it('Results is not inherithed when Regex group is not equal', async () => {
            await projectHelper.importer.executeCucumberImport('Regex', [importFiles.differentError], [`${builds.build_3}.json`]);
            await projectView.menuBar.testRuns();
            await testRunList.openTestRun(builds.build_3);
            expect(await testRunView.getResolution(testFailed))
                .toBe('', 'Resolution was autofilled!');
            expect(await testRunView.getIssue(testFailed))
                .toBe('', 'Issue was autofilled!');
            expect(await testRunView.getResolution(testPending))
                .toBe(resolutions.global.environmentIssue.name, 'Resolution was not autofilled!');
            expect(await testRunView.getIssue(testPending))
                .toBe(`${issueEnv.id} ${issueEnv.title}`, 'Issue was not autofilled!');
        });
    });
});

