import { LogIn } from '../../pages/login.po';

import users from '../../data/users.json';
import { User } from '../../../src/app/shared/models/user';
import { UserAdministration } from '../../pages/administration/users.po';
import { ProjectList } from '../../pages/project/list.po';
import { browser } from 'protractor';

describe('Full Admin Administartion User Flow', () => {

    const logInPage: LogIn = new LogIn();
    const userAdministration: UserAdministration = new UserAdministration();
    const projectList: ProjectList = new ProjectList();
    const userToCreate: User = users.creationTest;

    const validateUser = async () => {
        const data = await userAdministration.getUserData(userToCreate);
                expect(data[userAdministration.columns.firstName]).toBe(userToCreate.first_name,
                    `${userAdministration.columns.firstName} is not correct`);
                expect(data[userAdministration.columns.lastName]).toBe(userToCreate.second_name,
                    `${userAdministration.columns.lastName} is not correct`);
                expect(data[userAdministration.columns.userName]).toBe(userToCreate.user_name,
                    `${userAdministration.columns.userName} is not correct`);
                expect(data[userAdministration.columns.email]).toBe(userToCreate.email,
                    `${userAdministration.columns.email} is not correct`);
                expect(data[userAdministration.columns.auditAdmin]).toBe(!!userToCreate.audit_admin,
                    `${userAdministration.columns.auditAdmin} is not correct`);
                expect(data[userAdministration.columns.auditor]).toBe(!!userToCreate.auditor,
                    `${userAdministration.columns.auditor} is not correct`);
                expect(data[userAdministration.columns.coordinator]).toBe(!!userToCreate.manager,
                    `${userAdministration.columns.coordinator} is not correct`);
                expect(data[userAdministration.columns.admin]).toBe(!!userToCreate.admin,
                    `${userAdministration.columns.admin} is not correct`);
                expect(data[userAdministration.columns.accountManager]).toBe(!!userToCreate.account_manager,
                    `${userAdministration.columns.accountManager} is not correct`);
                expect(data[userAdministration.columns.unitCoordinator]).toBe(!!userToCreate.unit_coordinator,
                    `${userAdministration.columns.unitCoordinator} is not correct`);
    };

    beforeAll(async () => {
        await logInPage.logIn(users.admin.user_name, users.admin.password);
        return (await projectList.menuBar.user()).administration();
    });

    afterAll(async () => {
        if (await logInPage.menuBar.isLogged()) {
            return logInPage.menuBar.clickLogOut();
        }
    });

    describe('Create', () => {
        it('I can see error message when no filled fields', async () => {
            await userAdministration.openCreation();
            return expect(userAdministration.getCreationError()).toEqual('Fill all required fields');
        });

        it('User name is automatically filled after fill in first and last name', async () => {
            await Promise.all([
                userAdministration.fillFirstName(userToCreate.first_name),
                userAdministration.fillLastName(userToCreate.second_name)
            ]);
            return expect(userAdministration.getUserName()).toEqual(userToCreate.user_name);
        });

        it('Email is automatically filled after fill in first and last name', () => {
            return expect(userAdministration.getEmail()).toEqual(userToCreate.email);
        });

        it('I can see error message when passwords are not match', async () => {
            await userAdministration.fillPassword(userToCreate.password);
            await expect(userAdministration.getCreationError()).toEqual('Password does not match the Confirm Password.');
            return userAdministration.fillConfirmPassword(userToCreate.password);
        });

        it('I can see error message when email is not correct', async () => {
            await userAdministration.fillEmail('incorretEmail');
            await expect(userAdministration.getCreationError()).toEqual('Email should be equal to this pattern: example@domain.com');
        });

        it('I can see all errors when passwords are not match, email is not correct and not all required fields filled', async () => {
            await Promise.all([
                userAdministration.fillPassword('1'),
                userAdministration.fillFirstName('')
            ]);
            await expect(userAdministration.getCreationError())
                // tslint:disable-next-line: max-line-length
                .toEqual(`Fill all required fields, Email should be equal to this pattern: example@domain.com, Password does not match the Confirm Password.`);
        });

        it('No errors when everything filled fine', async () => {
            await Promise.all([
                userAdministration.fillPassword(userToCreate.password),
                userAdministration.fillFirstName(userToCreate.first_name),
                userAdministration.fillEmail(userToCreate.email)
            ]);
            await expect(userAdministration.getCreationError()).toEqual('');
        });

        it('I can create user with all permissions', async () => {
            await Promise.all([
                userAdministration.setUnitCoordinator(userToCreate.unit_coordinator),
                userAdministration.setAccountManager(userToCreate.account_manager),
                userAdministration.setAdmin(userToCreate.admin),
                userAdministration.setCoordinator(userToCreate.manager),
                userAdministration.setAuditor(userToCreate.auditor),
                userAdministration.setAuditAdmin(userToCreate.audit_admin),
            ]);
            await userAdministration.clickCreate();
            return validateUser();
        });

        it('I can login as new user', async () => {
            await userAdministration.menuBar.clickLogOut();
            await logInPage.logIn(userToCreate.user_name, userToCreate.password);
            await expect(projectList.isOpened()).toBe(true, 'New user is not able to log in');
            await projectList.menuBar.clickLogOut();
            await logInPage.logIn(users.admin.user_name, users.admin.password);
            return (await projectList.menuBar.user()).administration();
        });
    });

    describe('Update', () => {
        it('I can update user First Name', () => {
            userToCreate.first_name = new Date().getTime().toString();
            return userAdministration.updateUser(userToCreate.first_name, userAdministration.columns.firstName,
                userToCreate.user_name, userAdministration.columns.userName);
        });

        it('I can update user Last Name', () => {
            userToCreate.second_name = new Date().getTime().toString();
            return userAdministration.updateUser(userToCreate.second_name, userAdministration.columns.lastName,
                userToCreate.user_name, userAdministration.columns.userName);
        });

        it('I can update user UserName', async () => {
            const newUserName = new Date().getTime().toString();
            await userAdministration.updateUser(newUserName, userAdministration.columns.userName,
                userToCreate.user_name, userAdministration.columns.userName);
            userToCreate.user_name = newUserName;
        });

        it('I can update user Email', () => {
            userToCreate.email = `${new Date().getTime()}@whatever.com`;
            return userAdministration.updateUser(userToCreate.email, userAdministration.columns.email,
                userToCreate.user_name, userAdministration.columns.userName);
        });

        it('I can remove all user permissions', () => {
            userToCreate.unit_coordinator = 0;
            userToCreate.account_manager = 0;
            userToCreate.admin = 0;
            userToCreate.manager = 0;
            userToCreate.auditor = 0;
            userToCreate.audit_admin = 0;

            return Promise.all([
                userAdministration.updateUser(!!userToCreate.unit_coordinator, userAdministration.columns.unitCoordinator,
                    userToCreate.user_name, userAdministration.columns.userName),
                userAdministration.updateUser(!!userToCreate.account_manager, userAdministration.columns.accountManager,
                    userToCreate.user_name, userAdministration.columns.userName),
                userAdministration.updateUser(!!userToCreate.admin, userAdministration.columns.admin,
                    userToCreate.user_name, userAdministration.columns.userName),
                userAdministration.updateUser(!!userToCreate.manager, userAdministration.columns.coordinator,
                    userToCreate.user_name, userAdministration.columns.userName),
                userAdministration.updateUser(!!userToCreate.auditor, userAdministration.columns.auditor,
                    userToCreate.user_name, userAdministration.columns.userName),
                userAdministration.updateUser(!!userToCreate.audit_admin, userAdministration.columns.auditAdmin,
                    userToCreate.user_name, userAdministration.columns.userName),
            ]);
        });

        it('I can see all filleds updated', () => {
            return validateUser();
        });

        it('I can see all filleds updated after refresh', async () => {
            await browser.refresh();
            return validateUser();
        });

        it('I can reset user Password', async () => {
            await userAdministration.clickResetPassword(userToCreate.user_name);
            userToCreate.password = '123456';
            await userAdministration.menuBar.clickLogOut();
            await logInPage.logIn(userToCreate.user_name, userToCreate.password);
            await expect(projectList.isOpened()).toBe(true, 'New user is not able to log in');
            await projectList.menuBar.clickLogOut();
            await logInPage.logIn(users.admin.user_name, users.admin.password);
            return (await projectList.menuBar.user()).administration();
        });
    });

    describe('Delete', () => {
        it('I can remove user', async () => {
            await userAdministration.clickRemoveUserButton(userToCreate.user_name);
            await expect(userAdministration.modal.isVisible()).toBe(true, 'Remove User modal is not opened');

            await userAdministration.modal.clickActionBtn('yes');
            await userAdministration.refresh();
            await expect(userAdministration.isUserDisplayed(userToCreate.user_name)).toBe(false,
                `User ${userToCreate.user_name} is still displayed`);
        });
    });
});

