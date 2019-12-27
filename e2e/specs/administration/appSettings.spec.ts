import { LogIn } from '../../pages/login.po';

import users from '../../data/users.json';
import { User } from '../../../src/app/shared/models/user';
import { userAdministration } from '../../pages/administration/users.po';
import { ProjectList } from '../../pages/project/list.po';
import { appSettings } from '../../pages/administration/appSettings.po';
import { Constants } from '../../../src/app/pages/administration/global/app-settings/app-settings.constants';

describe('Full Admin Administartion User Flow', () => {

    const logInPage: LogIn = new LogIn();
    const projectList: ProjectList = new ProjectList();
    const userToCreate: User = users.patternTest;

    beforeAll(async () => {
        await logInPage.logInAs(users.admin.user_name, users.admin.password);
        return (await projectList.menuBar.user()).administration();
    });

    afterAll(async () => {
        if (await logInPage.menuBar.isLogged()) {
            return logInPage.menuBar.clickLogOut();
        }
    });


    describe('Audit Module', () => {
        it('I can disable Audit Module', async () => {
            await userAdministration.sidebar.appSettings();
            await appSettings.disableAuditModule();
            await appSettings.saveGeneralSettings();
            await appSettings.menuBar.clickLogo();
            return expect(projectList.menuBar.isAuditTabExists()).toBe(false, 'Audit Module is not disabled!');
        });

        it('I can enable Audit Module', async () => {
            await (await projectList.menuBar.user()).administration();
            await userAdministration.sidebar.appSettings();
            await appSettings.enableAuditModule();
            await appSettings.saveGeneralSettings();
            await appSettings.menuBar.clickLogo();
            return expect(projectList.menuBar.isAuditTabExists()).toBe(true, 'Audit Module is not enabled!');
        });
    });

    describe('Default Email Pattern', () => {
        it('I can see closed Email Pattern Hint', async () => {
            await (await projectList.menuBar.user()).administration();
            await userAdministration.sidebar.appSettings();
            return expect(appSettings.getHintText()).toEqual(Constants.emailHelpTextHint);
        });

        it('I can open Email Pattern Hint', async () => {
            await userAdministration.sidebar.appSettings();
            await appSettings.toggleHint();
            return expect(appSettings.getHintText()).toEqual(Constants.emailPatternHelpText);
        });

        it('I can see error message when Email Pattern is not correct', async () => {
            await userAdministration.sidebar.appSettings();
            await appSettings.setDefaultEmailPattern('@wrongPattern.test');
            await appSettings.saveEmailSettings();
            await expect(appSettings.notification.isError()).toEqual(true);
            await expect(appSettings.notification.getContent())
                .toEqual(Constants.emailPatternErrorMessage);
            await expect(appSettings.notification.getHeader())
                .toEqual(Constants.emailPatternErrorMessageHeader);
            return appSettings.notification.close();
        });

        it('I can see success message when Email Pattern is correct', async () => {
            await userAdministration.sidebar.appSettings();
            await appSettings.setDefaultEmailPattern('%LN%%LN{2}%.%FN%%FN{2}%.%LASTNAME%.%FIRSTNAME%@p.t');
            await appSettings.saveEmailSettings();
            await expect(appSettings.notification.isSuccess()).toEqual(true);
            return appSettings.notification.close();
        });

        it('When creating user pattern is applied', async () => {
            await userAdministration.sidebar.users();
            await userAdministration.openCreation();
            await Promise.all([
                userAdministration.fillFirstName(userToCreate.first_name),
                userAdministration.fillLastName(userToCreate.second_name)
            ]);
            await expect(userAdministration.getUserName()).toEqual('ddo.jjo.doe.john');
            return expect(userAdministration.getEmail()).toEqual('ddo.jjo.doe.john@p.t');
        });

        it('I can remove Email Pattern', async () => {
            await userAdministration.sidebar.appSettings();
            await appSettings.clearDefaultEmailPattern();
            await appSettings.saveEmailSettings();
            await expect(appSettings.notification.isSuccess()).toEqual(true);
            return appSettings.notification.close();
        });

        it('When creating user and pattern is blank email and user name are not changed', async () => {
            await userAdministration.sidebar.users();
            await userAdministration.openCreation();
            await Promise.all([
                userAdministration.fillEmail(userToCreate.email),
                userAdministration.fillUserName(userToCreate.user_name),
                userAdministration.fillFirstName(userToCreate.first_name),
                userAdministration.fillLastName(userToCreate.second_name)
            ]);
            await expect(userAdministration.getEmail()).toEqual(userToCreate.email);
            return expect(userAdministration.getUserName()).toEqual(userToCreate.user_name);
        });
    });
});

