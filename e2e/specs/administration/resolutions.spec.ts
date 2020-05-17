import { browser } from 'protractor';
import { ProjectHelper } from '../../helpers/project.helper';
import { Issue } from '../../../src/app/shared/models/issue';
import { ResultResolution } from '../../../src/app/shared/models/result_resolution';
import { logIn } from '../../pages/login.po';
import { projectList } from '../../pages/project/list.po';
import { projectView } from '../../pages/project/view.po';
import { resolutionAdministration } from '../../pages/administration/resolutions.po';
import { issuesList } from '../../pages/issues/list.po';
import { issueCreateModal } from '../../pages/modals/issueCreate.po';
import { issueView } from '../../pages/issues/view.po';
import { notFound } from '../../pages/notFound.po';
import using from 'jasmine-data-provider';
import usersTestData from '../../data/users.json';
import resolutions from '../../data/resolutions.json';


const editorExamples = {
    autoAdmin: usersTestData.autoAdmin,
    localAdmin: usersTestData.localAdmin,
    localManager: usersTestData.localManager,
    manager: usersTestData.manager
};

const notEditorExamples = {
    localEngineer: usersTestData.localEngineer,
};

describe('Administartion: Custom Resolution:', () => {
    const baseProjectHelper: ProjectHelper = new ProjectHelper('With custom Resolution');
    const extraProjectHelper: ProjectHelper = new ProjectHelper('Without custom Resolution');
    const resolution = resolutions.flowTest;
    const globalResolutions: ResultResolution[] = Object.values(resolutions.global);
    const issueCreation: Issue = { title: 'Creation of Issue with Custom Resolution' };
    let issueExisting: Issue = { title: 'Existing Issue with Custom Resolution' };

    beforeAll(async () => {
        await baseProjectHelper.init({
            autoAdmin: usersTestData.autoAdmin,
            localAdmin: usersTestData.localAdmin,
            localManager: usersTestData.localManager,
            localEngineer: usersTestData.localEngineer,
            manager: usersTestData.manager
        });
        await extraProjectHelper.init({
            autoAdmin: usersTestData.autoAdmin,
            localAdmin: usersTestData.localAdmin,
            localManager: usersTestData.localManager,
            localEngineer: usersTestData.localEngineer,
            manager: usersTestData.manager
        });
        issueExisting = await baseProjectHelper.editorAPI.createIssue(issueExisting);
    });

    afterAll(async () => {
        await extraProjectHelper.dispose();
        await baseProjectHelper.dispose();
    });

    using(editorExamples, (user, description) => {
        beforeAll(async () => {
            await logIn.logInAs(user.user_name, user.password);
            await projectList.menuBar.administration();
            return resolutionAdministration.sidebar.resolutions();
        });

        describe(`${description} role: Create`, () => {
            it('I can create Resolution', async () => {
                await resolutionAdministration.selectProject(baseProjectHelper.project.name);
                await resolutionAdministration.openCreation();
                await resolutionAdministration.fillName(resolution.name);
                await resolutionAdministration.selectColor(resolution.color_name as string);
                return resolutionAdministration.clickCreate();
            });
        });

        describe(`${description}: Usage`, () => {
            it('I can select created resolution on Issues List', async () => {
                await baseProjectHelper.openProject();
                await projectView.menuBar.issues();
                await issuesList.setResolution(resolution.name, issueExisting.title);
                await issuesList.notification.assertIsSuccess();
                return expect(issuesList.getResolution(issueExisting.title)).toBe(resolution.name, 'Resolution was not selected');
            });

            it('I can select created resolution on Issue Create', async () => {
                issueCreation.title = `${issueCreation.title} +1`;
                await issuesList.clickCreate();
                await issueCreateModal.waitForIsOpened();
                await issueCreateModal.setResolution(resolution.name);
                await issueCreateModal.setTitle(issueCreation.title);
                await issueCreateModal.save();
                return issuesList.notification.assertIsSuccess();
            });

            it('I can select created resolution on Issue View', async () => {
                await issuesList.openIssue(issueExisting.title);
                await issueView.waitForIsOpened();
                await issueView.setResolution(resolution.name);
                await issueView.save();
                return issueView.notification.assertIsSuccess();
            });

            it('I can not select created resolution on test run view Resolution for other projects', async () => {
                await extraProjectHelper.openProject();
                await projectView.menuBar.issues();
                await issuesList.clickCreate();
                await issueCreateModal.waitForIsOpened();
                await expect(issueCreateModal.isResolutionPresent(resolution.name))
                    .toBe(false, 'Resolution should not present');
                return issueCreateModal.cancel();
            });
        });

        describe(`${description} role: Update`, () => {
            it('I can update created resolution', async () => {
                await baseProjectHelper.openProject();
                const newName = new Date().getTime().toString();
                await projectList.menuBar.administration();
                await resolutionAdministration.sidebar.resolutions();
                await resolutionAdministration.selectProject(baseProjectHelper.project.name);
                await resolutionAdministration.updateResolution(newName, resolutionAdministration.columns.name,
                    resolution.name, resolutionAdministration.columns.name);
                resolution.name = newName;
                resolution.color_name = resolutionAdministration.colors.warning;
                await resolutionAdministration.updateResolution(resolution.color_name, resolutionAdministration.columns.color,
                    resolution.name, resolutionAdministration.columns.name);
                await browser.refresh();
                await resolutionAdministration.sidebar.resolutions();
                await resolutionAdministration.selectProject(baseProjectHelper.project.name);
                await expect(await resolutionAdministration
                    .isResolutionPresent(resolution.name)).toBe(true, 'Resolution Name is not Updated');
                await expect(await resolutionAdministration.getResolutionColor(resolution.name))
                    .toBe(resolution.color_name, 'Resolution Color is not Updated');
            });

            it('I can not update global resolutions', async () => {
                for (let i = 0; i < globalResolutions.length; i++) {
                    await expect(await resolutionAdministration.isResolutionEditable(globalResolutions[i].name))
                        .toBe(false, `Resulution '${globalResolutions[i].name}' is editable!`);
                }
            });
        });

        describe(`${description} role: Remove`, () => {
            it('I can not delete used resolution', async () => {
                await resolutionAdministration.clickRemoveResolution(resolution.name);
                await expect(resolutionAdministration.modal.isVisible()).toBe(true, 'Remove Resolution modal is not opened');

                await resolutionAdministration.modal.clickYes();
                await resolutionAdministration.notification.assertIsError('You are trying to remove entity that is used in other place!');
                await resolutionAdministration.sidebar.resolutions();
                await resolutionAdministration.selectProject(baseProjectHelper.project.name);
                await expect(await resolutionAdministration.isResolutionPresent(resolution.name))
                    .toBe(true, 'Resolution was not removed');
            });

            it('I can delete unused resolution', async () => {
                await baseProjectHelper.openProject();
                await projectView.menuBar.issues();
                await issuesList.setResolution(globalResolutions[0].name, issueExisting.title);
                await issuesList.notification.close();
                await issuesList.setResolution(globalResolutions[1].name, issueCreation.title);
                await issuesList.notification.close();
                await projectList.menuBar.administration();
                await resolutionAdministration.sidebar.resolutions();
                await resolutionAdministration.selectProject(baseProjectHelper.project.name);

                await resolutionAdministration.clickRemoveResolution(resolution.name);
                await expect(resolutionAdministration.modal.isVisible()).toBe(true, 'Remove Resolution modal is not opened');

                await resolutionAdministration.modal.clickYes();
                await resolutionAdministration.notification.assertIsSuccess(`Resolution '${resolution.name}' was deleted.`);
                await resolutionAdministration.sidebar.resolutions();
                await resolutionAdministration.selectProject(baseProjectHelper.project.name);
                await expect(await resolutionAdministration.isResolutionPresent(resolution.name))
                    .toBe(false, 'Resolution was removed');
            });
        });
    });

    using(notEditorExamples, (user, description) => {
        describe(`Open: ${description} role:`, () => {
            beforeAll(async () => {
                await logIn.logInAs(user.user_name, user.password);
                return baseProjectHelper.openProject();
            });

            it('I can not Open Resolutions page using Menu Bar', async () => {
                return expect(projectList.menuBar.isAdministrationExists())
                    .toBe(false, `Administration should not be visible for ${description}`);
            });

            it('I can not Open Resolutions page using url', async () => {
                await resolutionAdministration.navigateTo();
                await expect(resolutionAdministration.isOpened()).toBe(false, `Resolutions page is opened for ${description}`);
                return expect(notFound.isOpened()).toBe(true, `Not Found page is not opened for ${description}`);
            });
        });
    });
});

