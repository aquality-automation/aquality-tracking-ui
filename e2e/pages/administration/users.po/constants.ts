import { by, element } from 'protractor';
import { SmartTable } from '../../elements/smartTable.element';

export const baseUrl = '/administration/global/users';

export const elements = {
    uniqueElement: element(by.css('#users-administration.active')),
    usersTable: new SmartTable(by.id('users-table'))
};

export const names = {
    pageName: 'Users Page'
};

export const columns = {
    firstName: 'First Name',
    lastName: 'Last Name',
    userName: 'Username',
    email: 'Email',
    password: 'Password',
    auditAdmin: 'Audit Admin',
    auditor: 'Auditor',
    coordinator: 'Coordinator',
    admin: 'Admin',
    accountManager: 'Account Manager',
    unitCoordinator: 'Unit Coordinator'
};


