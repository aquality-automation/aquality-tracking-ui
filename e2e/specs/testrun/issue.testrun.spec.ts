import { logIn } from '../../pages/login.po';
import { projectView } from '../../pages/project/view.po';
import { testRunView } from '../../pages/testrun/view.po';
import { testRunList } from '../../pages/testrun/list.po';
import { suiteView } from '../../pages/suite/view.po';
import { ProjectHelper } from '../../helpers/project.helper';
import usersTestData from '../../data/users.json';
import using from 'jasmine-data-provider';
import cucumberImport from '../../data/import/cucumber.json';

const editorExamples = {
    localAdmin: usersTestData.localAdmin,
    localManager: usersTestData.localManager,
    manager: usersTestData.manager,
    localEngineer: usersTestData.localEngineer
};

const notEditorExamples = {
    viewer: usersTestData.viewer,
};

describe('Test Run: Issue:', () => {

    using(editorExamples, (user, description) => {
        describe(`${description} role:`, () => {
            const projectHelper: ProjectHelper = new ProjectHelper();

            beforeAll(async () => {
                const users = {
                    localEngineer: usersTestData.localEngineer,
                };
                users[description] = user;
                await projectHelper.init(users);
                await projectHelper.importer.executeCucumberImport('All', [cucumberImport], [`build_1.json`]);
                await logIn.logInAs(user.user_name, user.password);
                return projectHelper.openProject();
            });

            afterAll(async () => {
                return projectHelper.dispose();
            });

            it('Open Create Issue modal from issue lookup', async () => {
            });

            it('', async () => {
            });

            it('', async () => {
            });

            it('', async () => {
            });

            it('', async () => {
            });

            it('', async () => {
            });

            it('', async () => {
            });

            it('', async () => {
            });

            it('', async () => {
            });

            it('', async () => {
            });
        });
    });

    using(notEditorExamples, (user, description) => {
        describe(`${description} role:`, () => {

        });
    });
});
