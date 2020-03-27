import { logIn } from '../../pages/login.po';
import { projectList } from '../../pages/project/list.po';
import { projectView } from '../../pages/project/view.po';
import { resolutionAdministration } from '../../pages/administration/resolutions.po';
import { testRunList } from '../../pages/testrun/list.po';
import { testRunView } from '../../pages/testrun/view.po';
import { colors } from '../../pages/administration/resolutions.po/constants';
import { ResultResolution } from '../../../src/app/shared/models/result_resolution';
import { browser } from 'protractor';
import { ProjectHelper } from '../../helpers/project.helper';
import users from '../../data/users.json';
import tests from '../../data/tests.json';
import testruns from '../../data/testRuns.json';
import resolutions from '../../data/resolutions.json';
import { Issue } from '../../../src/app/shared/models/issue';
import { issuesList } from '../../pages/issues/list.po';
import { issueCreateModal } from '../../pages/modals/issueCreate.po';
import { issueView } from '../../pages/issues/view.po';

fdescribe('Full Admin Administartion Resolution Flow', () => {
    const baseProjectHelper: ProjectHelper = new ProjectHelper('With custom Resolution');
    const extraProjectHelper: ProjectHelper = new ProjectHelper('Without custom Resolution');
    const resolution: ResultResolution = resolutions.flowTest;
    const globalResolutions: ResultResolution[] = Object.values(resolutions.global);
    let issue: Issue = { title: 'Custom Resolution Issue' };

    beforeAll(async () => {
        await baseProjectHelper.init();
        await extraProjectHelper.init();
        issue = await baseProjectHelper.editorAPI.createIssue(issue);

        await logIn.logInAs(users.admin.user_name, users.admin.password);
        await projectList.menuBar.administration();
        return resolutionAdministration.sidebar.resolutions();
    });

    afterAll(async () => {
        await baseProjectHelper.dispose();
        await extraProjectHelper.dispose();
    });

    describe('Create', () => {
        it('I can create Resolution', async () => {
            await resolutionAdministration.selectProject(baseProjectHelper.project.name);
            await resolutionAdministration.openCreation();
            await resolutionAdministration.fillName(resolution.name);
            await resolutionAdministration.selectColor(resolution.color as string);
            return resolutionAdministration.clickCreate();
        });
    });

    describe('Usage', () => {
        it('I can select created resolution on Issues List', async () => {
            await baseProjectHelper.openProject();
            await projectView.menuBar.issues();
            await issuesList.setResolution(resolution.name, issue.title);
            await issuesList.notification.assertIsSuccess();
            return expect(issuesList.getResolution(issue.title)).toBe(resolution.name, 'Resolution was not selected');
        });

        it('I can select created resolution on Issue Create', async () => {
            await issuesList.clickCreate();
            await issueCreateModal.waitForIsOpened();
            await issueCreateModal.setResolution(resolution.name);
            await issueCreateModal.setTitle('Custom Resolution Issue Creation');
            await issueCreateModal.save();
            return issuesList.notification.assertIsSuccess();
        });

        it('I can select created resolution on Issue View', async () => {
            await issuesList.openIssue(issue.title);
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

    describe('Update', () => {
        it('I can update created resolution', async () => {
            await baseProjectHelper.openProject();
            const newName = new Date().getTime().toString();
            await projectList.menuBar.administration();
            await resolutionAdministration.sidebar.resolutions();
            await resolutionAdministration.selectProject(baseProjectHelper.project.name);
            await resolutionAdministration.updateResolution(newName, resolutionAdministration.columns.name,
                resolution.name, resolutionAdministration.columns.name);
            resolution.name = newName;
            resolution.color = resolutionAdministration.colors.warning;
            await resolutionAdministration.updateResolution(resolution.color, resolutionAdministration.columns.color,
                resolution.name, resolutionAdministration.columns.name);
            await browser.refresh();
            await resolutionAdministration.sidebar.resolutions();
            await resolutionAdministration.selectProject(baseProjectHelper.project.name);
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
            await resolutionAdministration.clickRemoveResolution(resolution.name);
            await expect(resolutionAdministration.modal.isVisible()).toBe(true, 'Remove Resolution modal is not opened');

            await resolutionAdministration.modal.clickYes();
            await resolutionAdministration.notification.assertIsError('You are trying to remove entity that is used in other place!');
            await resolutionAdministration.sidebar.resolutions();
            await resolutionAdministration.selectProject(baseProjectHelper.project.name);
            await expect(await resolutionAdministration.isResolutionPresent(resolution.name))
                .toBe(true, 'Resolution was not removed');
        });

        it('Results with deleted resolutions become Not Assigned', async () => {
            const newName = new Date().getTime().toString();
            await resolutionAdministration.openCreation();
            await resolutionAdministration.fillName(newName);
            await resolutionAdministration.selectColor(resolution.color as string);
            await resolutionAdministration.clickCreate();

            await resolutionAdministration.clickRemoveResolution(newName);
            await expect(resolutionAdministration.modal.isVisible()).toBe(true, 'Remove Resolution modal is not opened');
            await resolutionAdministration.modal.clickYes();
            return resolutionAdministration.notification.assertIsSuccess(`Resolution '${newName}' was deleted.`);
        });
    });
});

