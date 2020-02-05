import { logIn } from '../../pages/login.po';
import { projectList } from '../../pages/project/list.po';
import { suiteView } from '../../pages/suite/view.po';
import { Test } from '../../../src/app/shared/models/test';
import usersTestData from '../../data/users.json';
import using from 'jasmine-data-provider';
import { ProjectHelper } from '../../helpers/project.helper';

let test: Test = { name: 'Project can be opened from Projects list' };
let suite1: Test = { name: 'First Suite' };
let suite2: Test = { name: 'Second Suite' };

const editorExamples = {
    localManager: usersTestData.localManager,
    manager: usersTestData.manager,
    localEngineer: usersTestData.localEngineer
};

const notEditorExamples = {
    localAdmin: usersTestData.localAdmin,
    viewer: usersTestData.viewer
};

describe('Tests List:', () => {
    const projectHelper: ProjectHelper = new ProjectHelper();

    beforeAll(async () => {
        await projectHelper.init({
            localAdmin: usersTestData.localAdmin,
            localManager: usersTestData.localManager,
            localEngineer: usersTestData.localEngineer,
            viewer: usersTestData.viewer
        });

        test = await projectHelper.editorAPI.createTest(test);
        suite1 = await projectHelper.editorAPI.createSuite(suite1);
        suite2 = await projectHelper.editorAPI.createSuite(suite2);
    });

    afterAll(async () => {
        await projectHelper.dispose();
    });

    using(editorExamples, (user, description) => {
        describe(`Permissions: ${description} role:`, () => {
            beforeAll(async () => {
                await logIn.logInAs(user.user_name, user.password);
                await projectHelper.openProject();
                return (await projectList.menuBar.tests()).all();
            });

            it('I can add suite to test', async () => {
                await suiteView.addSuite(suite1.name, test.name);
                return expect(suiteView.getTestSuites(test.name)).toEqual([suite1.name], 'First Suite was not added');
            });

            it('I can add another suite to test', async () => {
                await suiteView.addSuite(suite2.name, test.name);
                return expect(suiteView.getTestSuites(test.name)).toEqual([suite1.name, suite2.name], 'Second Suite was not added');
            });

            it('I can remove suite from test', async () => {
                await suiteView.removeSuite(suite2.name, test.name);
                return expect(suiteView.getTestSuites(test.name)).toEqual([suite1.name], 'Second Suite was not removed');
            });

            it('I can set suites empty for test', async () => {
                await suiteView.removeSuite(suite1.name, test.name);
                return expect(suiteView.getTestSuites(test.name)).toEqual([], 'First Suite was not removed');
            });
        });
    });

    using(notEditorExamples, (user, description) => {
        describe(`Permissions: ${description} role:`, () => {
            beforeAll(async () => {
                await logIn.logInAs(user.user_name, user.password);
                await projectHelper.openProject();
                return (await projectList.menuBar.tests()).all();
            });

            it('I can see tests', async () => {
                return expect(suiteView.isTestPresent(test.name)).toBe(true, 'Cannot see test!');
            });

            it('I cannot change tests', async () => {
                return expect(suiteView.isTableEditable()).toBe(false, 'Table is editable!');
            });
        });
    });
});
