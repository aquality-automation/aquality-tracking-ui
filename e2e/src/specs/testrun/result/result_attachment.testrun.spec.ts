import { logIn } from '../../../pages/login.po';
import { projectView } from '../../../pages/project/view.po';
import { testrunView } from '../../../pages/testrun/view.po';
import { testResultAttachmentModal } from '../../../pages/modals/testResultAttachment.po';
import { ProjectHelper } from '../../../helpers/project.helper';
import cucumberImport from '../../../data/import/cucumber.json';
import users from '../../../data/users.json';
import { testrunList } from '../../../pages/testrun/list.po';
import { testData } from '../../../utils/testData.util';
import { TestResult } from '../../../../../src/app/shared/models/test-result';
import { browser } from 'protractor';

fdescribe('Check Test Run result attachment', () => {
    const projectHelper: ProjectHelper = new ProjectHelper();
    const builds = { build_1: 'Build_1' };
    const imageAttachName = 'image.jpg';
    const txtAttachName = 'attach.txt';
    let result: TestResult;
    let resultSecond: TestResult;

    beforeAll(async () => {
        await testData.cleanUpDownloadsData();
        await projectHelper.init({
            admin: users.admin
        });
        await logIn.logInAs(users.admin.user_name, users.admin.password);
        const testRuns = await projectHelper.importer.executeCucumberImport('Test Suite', [cucumberImport], [`${builds.build_1}.json`]);
        const results = await projectHelper.editorAPI.getResults({ test_run_id: testRuns[0].id, project_id: projectHelper.project.id });
        result = results[0];
        resultSecond = results[1];
        await projectHelper.editorAPI.addTestResultAttachment(
            {
                test_result_id: result.id, project_id: projectHelper.project.id
            },
            [await testData.readAsString(`/attachments/${imageAttachName}`), await testData.readAsString(`/attachments/${txtAttachName}`)],
            [imageAttachName, txtAttachName]);
        await projectHelper.openProject();
        await projectView.menuBar.testruns();
        return testrunList.openTestRun(builds.build_1);
    });

    afterAll(async () => {
        await projectHelper.dispose();
        return testData.cleanUpDownloadsData();
    });

    it('There is attachment icon', async () => {
        expect(testrunView.isOpened()).toBe(true, 'Test Run View page has not opened');
        expect(testrunView.isAttachmentExist(result.test.name)).toBe(true, `Attachment for test ${result.test.name} should exist`);
        return expect(testrunView.isAttachmentExist(resultSecond.test.name)).toBe(false, `Attachment for test ${resultSecond.test.name} should NOT exist`);
    });

    it('Open attachment', async () => {
        await testrunView.openAttachment(result.test.name);
        expect(testResultAttachmentModal.isOpened()).toBe(true, 'Test Result Attachment Modal should be opened');
        expect(testResultAttachmentModal.getTitle()).toBe(result.test.name, 'Test Result Attachment Modal Name should be equal test name');
        expect(testResultAttachmentModal.isFileAttached(imageAttachName)).toBe(true, 'Image should be attached');
        return expect(testResultAttachmentModal.isFileAttached(txtAttachName)).toBe(true, 'File should be attached');
    });

    it('Choose txt file', async () => {
        await testResultAttachmentModal.selectFile(txtAttachName);
        expect(testResultAttachmentModal.isFileSelected(txtAttachName)).toBe(true, 'File should be selected');
        expect(testResultAttachmentModal.getSubTitle()).toBe(txtAttachName, 'Sub title should equal file name');
        return expect(testResultAttachmentModal.isFrameDisplayed()).toBe(true, 'Content of file is displayed');
    });

    it('Choose image', async () => {
        await testResultAttachmentModal.selectFile(imageAttachName);
        expect(testResultAttachmentModal.isFileSelected(imageAttachName)).toBe(true, 'Image should be selected');
        expect(testResultAttachmentModal.getSubTitle()).toBe(imageAttachName, 'Sub title should equal image name');
        return expect(testResultAttachmentModal.isImageDisplayed()).toBe(true, 'Image should be displayed');
    });

    it('Open image in new tab', async () => {
        const windowsCount = (await browser.getAllWindowHandles()).length;
        await testResultAttachmentModal.selectFile(imageAttachName);
        await testResultAttachmentModal.clickImage();
        const windowsCountNew = (await browser.getAllWindowHandles()).length;
        expect(windowsCountNew).toBe(windowsCount + 1, 'New window should be opened');
    });

    it('Download files', async () => {
        await browser.switchTo().window((await browser.getAllWindowHandles())[0]);
        await testResultAttachmentModal.selectFile(imageAttachName);
        await testResultAttachmentModal.downloadFile();
        await testResultAttachmentModal.selectFile(txtAttachName);
        await testResultAttachmentModal.downloadFile();
        await testResultAttachmentModal.close();
        expect(
            await testData.waitUntilFileExists(testData.getSimpleDownloadsFolderPath(), imageAttachName))
            .toBe(true, `Image should be downloaded`);
        return expect(
            await testData.waitUntilFileExists(testData.getSimpleDownloadsFolderPath(), txtAttachName))
            .toBe(true, `File should be downloaded`);
    });
});
