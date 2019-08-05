import { Component } from '@angular/core';
import { SimpleRequester } from '../../../services/simple-requester';
import { UserService } from '../../../services/user.services';
import { User } from '../../../shared/models/user';
import { Md5 } from 'ts-md5/dist/md5';

@Component({
    templateUrl: './administration.users.component.html',
    providers: [
        UserService,
        SimpleRequester
    ]
})
export class AdministrationUsersComponent {
    hideModal = true;
    removeModalTitle: string;
    removeModalMessage: string;
    userToRemove: User;
    public users: User[];
    public canCreate: boolean;
    private md5 = new Md5();
    public inProgress = false;
    public clickedUser: User;
    public tbCols: any[] = [
        { name: 'LDAP', property: 'ldap_user', filter: false, sorting: true, type: 'checkbox', editable: false, excludeCreation: true },
        {
            name: 'First Name',
            property: 'first_name',
            filter: true,
            sorting: true,
            type: 'text',
            editable: true,
            notEditableByProperty: 'ldap_user'
        },
        {
            name: 'Last Name',
            property: 'second_name',
            filter: true,
            sorting: true,
            type: 'text',
            editable: true,
            notEditableByProperty: 'ldap_user'
        },
        {
            name: 'Username',
            property: 'user_name',
            filter: true,
            sorting: true,
            type: 'text',
            editable: true,
            pattern: '[first_name] [second_name]',
            notEditableByProperty: 'ldap_user'
        },
        {
            name: 'Email',
            property: 'email',
            filter: true,
            sorting: true,
            type: 'email',
            editable: true,
            notEditableByProperty: 'ldap_user'
        },
        { name: 'Password', property: 'password', filter: false, type: 'password', listeners: ['click'], editable: false },
        { name: 'Unit Coordinator', property: 'unit_coordinator', filter: false, sorting: true, type: 'checkbox', editable: true },
        { name: 'Account Manager', property: 'account_manager', filter: false, sorting: true, type: 'checkbox', editable: true },
        { name: 'Admin', property: 'admin', filter: false, sorting: true, type: 'checkbox', editable: true },
        { name: 'Coordinator', property: 'manager', filter: false, sorting: true, type: 'checkbox', editable: true },
        { name: 'Auditor', property: 'auditor', filter: false, sorting: true, type: 'checkbox', editable: true },
        { name: 'Audit Admin', property: 'audit_admin', filter: false, sorting: true, type: 'checkbox', editable: true }
    ];
    public defSort = { property: 'first_name', order: 'asc' };

    constructor(
        private userService: UserService
    ) {
        this.userService.getUsers().subscribe(res => {
            this.users = res;
        });
    }

    handleAction($event: {action: string, entity: any}) {
        if ($event.action === 'create') {
            this.createUser($event.entity);
        } else if ($event.action === 'remove') {
            this.removeUser($event.entity);
        }
    }

    createEntityChange($event) {
        if ($event.entity.first_name
            && $event.entity.second_name
            && ($event.property === 'first_name'
                || $event.property === 'second_name')) {
            $event.entity.user_name = `${$event.entity.first_name.substr(0, 1)}.${$event.entity.second_name}`.toLowerCase();
            $event.entity.email = `${$event.entity.first_name.substr(0, 1)}.${$event.entity.second_name}@a1qa.com`.toLowerCase();
        }
    }

    updateUser(user: User) {
        const userTemplate: User = {
            user_name: user.user_name,
            id: user.id,
            email: user.email,
            first_name: user.first_name,
            second_name: user.second_name,
            manager: +user.manager,
            admin: +user.admin,
            auditor: +user.auditor,
            audit_admin: +user.audit_admin,
            account_manager: +user.account_manager,
            unit_coordinator: +user.unit_coordinator
        };
        this.userService.createOrUpdateUser(userTemplate).subscribe();
    }

    createUser(user: User) {
        user.admin = +user.admin;
        user.manager = +user.manager;
        user.auditor = +user.auditor;
        user.audit_admin = +user.audit_admin;
        user.unit_coordinator = +user.unit_coordinator;
        user.account_manager = +user.account_manager;
        this.userService.createOrUpdateUser(user).subscribe(() => {
            for (const prop of Object.keys(user)) {
                delete user[prop];
            }
            this.userService.getUsers().subscribe(users => {
                this.users = users;
                this.inProgress = false;
            });
        });
    }

    resetPassword() {
        if (this.clickedUser.ldap_user) {
            this.userService.handleWarning('Action Denied', 'You cannot edit LDAP users!');

        } else {
            this.clickedUser.password = '123456';
            this.userService.createOrUpdateUser(this.clickedUser).subscribe();
        }
    }

    rowClicked($event: User) {
        this.clickedUser = $event;
    }

    removeUser(user: User) {
        this.userToRemove = user;
        this.removeModalTitle = `Remove User: ${user.user_name}`;
        this.removeModalMessage = `Are you sure that you want to delete the '${user.user_name}' user? This action cannot be undone.`;
        this.hideModal = false;
    }

    async execute($event) {
        if (await $event) {
            this.userService.removeUser(this.userToRemove).subscribe(() => {
                this.userService.getUsers().subscribe(users => {
                    this.users = users;
                    this.inProgress = false;
                });
            });
            this.users = this.users.filter(x => x !== this.userToRemove);
        }
        this.hideModal = true;
    }

    wasClosed($event: boolean) {
        this.hideModal = $event;
    }

    hideVal(entity: User, property: string) {
        if ((property === 'password') && entity.ldap_user) {
            return true;
        }
        return false;
    }
}
