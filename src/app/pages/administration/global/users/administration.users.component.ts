import { Component, OnInit } from '@angular/core';
import { User } from '../../../../shared/models/user';
import { EmailSettings } from 'src/app/shared/models/app-settings';
import { TFColumn, TFColumnType, TFOrder } from 'src/app/elements/table-filter/tfColumn';
import { UserService } from 'src/app/services/user/user.services';
import { EmailSettingsService } from 'src/app/services/email-settings/email-settings.service';

@Component({
    templateUrl: './administration.users.component.html',
})
export class AdministrationUsersComponent implements OnInit {
    public hideModal = true;
    public removeModalTitle: string;
    public removeModalMessage: string;
    public userToRemove: User;
    private emailSettings: EmailSettings;
    public users: User[];
    public canCreate: boolean;
    public inProgress = false;
    public clickedUser: User;
    public tbCols: TFColumn[] = [
        {
            name: 'LDAP',
            property: 'ldap_user',
            sorting: true,
            type: TFColumnType.checkbox
        },
        {
            name: 'First Name',
            property: 'first_name',
            filter: true,
            sorting: true,
            type: TFColumnType.text,
            editable: true,
            notEditableByProperty: { property: 'ldap_user', value: true },
            creation: {
                required: true
            }
        },
        {
            name: 'Last Name',
            property: 'second_name',
            filter: true,
            sorting: true,
            type: TFColumnType.text,
            editable: true,
            notEditableByProperty: { property: 'ldap_user', value: true },
            creation: {
                required: true
            }
        },
        {
            name: 'Username',
            property: 'user_name',
            filter: true,
            sorting: true,
            type: TFColumnType.text,
            editable: true,
            pattern: '[first_name] [second_name]',
            notEditableByProperty: { property: 'ldap_user', value: true },
            creation: {
                required: true
            }
        },
        {
            name: 'Email',
            property: 'email',
            filter: true,
            sorting: true,
            type: TFColumnType.email,
            editable: true,
            notEditableByProperty: { property: 'ldap_user', value: true },
            creation: {
                required: true
            }
        },
        {
            name: 'Password', property: 'password', type: TFColumnType.password, listeners: ['click'],
            creation: {
                required: true
            }
        },
        {
            name: 'Unit Coordinator', property: 'unit_coordinator', sorting: true, type: TFColumnType.checkbox, editable: true,
            creation: {
                required: true
            }
        },
        {
            name: 'Admin', property: 'admin', sorting: true, type: TFColumnType.checkbox, editable: true,
            creation: {
                required: true
            }
        },
        {
            name: 'Coordinator', property: 'manager', sorting: true, type: TFColumnType.checkbox, editable: true,
            creation: {
                required: true
            }
        },
        {
            name: 'Auditor', property: 'auditor', sorting: true, type: TFColumnType.checkbox, editable: true,
            creation: {
                required: true
            }
        },
        {
            name: 'Audit Admin', property: 'audit_admin', sorting: true, type: TFColumnType.checkbox, editable: true,
            creation: {
                required: true
            }
        }
    ];
    public defSort = { property: 'first_name', order: TFOrder.asc };

    constructor(
        private userService: UserService,
        private emailSettingsService: EmailSettingsService
    ) { }

    async ngOnInit() {
        [this.users, this.emailSettings] = await Promise.all([
            this.userService.getUsers({}),
            this.emailSettingsService.getEmailSettings()
        ]);
    }

    handleAction($event: { action: string, entity: any }) {
        if ($event.action === 'create') {
            this.createUser($event.entity);
        } else if ($event.action === 'remove') {
            this.removeUser($event.entity);
        }
    }

    createEntityChange($event: { entity: User, property: string }) {
        const convertableFields = ['first_name', 'second_name'];
        if (this.emailSettings.default_email_pattern
            && $event.entity.first_name
            && $event.entity.second_name
            && convertableFields.includes($event.property)) {

            $event.entity.email = this.processPattern(
                this.emailSettings.default_email_pattern,
                $event.entity.first_name,
                $event.entity.second_name);

            $event.entity.user_name = $event.entity.email.split('@')[0];
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
        this.userService.createOrUpdateUser(userTemplate);
    }

    async createUser(user: User) {
        user.admin = +user.admin;
        user.manager = +user.manager;
        user.auditor = +user.auditor;
        user.audit_admin = +user.audit_admin;
        user.unit_coordinator = +user.unit_coordinator;
        user.account_manager = +user.account_manager;
        await this.userService.createOrUpdateUser(user);

        for (const prop of Object.keys(user)) {
            delete user[prop];
        }
        this.users = await this.userService.getUsers({});
        this.inProgress = false;
    }

    resetPassword() {
        if (this.clickedUser.ldap_user) {
            this.userService.handleWarning('Action Denied', 'You cannot edit LDAP users!');

        } else {
            this.clickedUser.password = '123456';
            this.userService.createOrUpdateUser(this.clickedUser);
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

    async execute($event: Promise<boolean>) {
        if (await $event) {
            this.userService.removeUser(this.userToRemove);
            this.users = await this.userService.getUsers({});
            this.inProgress = false;
            this.users = this.users.filter(x => x !== this.userToRemove);
        }
        this.hideModal = true;
    }

    wasClosed() {
        this.hideModal = true;
    }

    hideVal(entity: User, property: string) {
        if ((property === 'password') && entity.ldap_user) {
            return true;
        }
        return false;
    }

    private processPattern(pattern: string, first_name: string, last_name: string) {
        pattern = pattern.toLowerCase();
        const lowerFirst_name = first_name.toLowerCase();
        const lowerLast_name = last_name.toLowerCase();
        pattern = pattern.replace(/%ln%/, lowerLast_name[0]);
        pattern = pattern.replace(/%fn%/, lowerFirst_name[0]);
        pattern = pattern.replace(/%firstname%/, lowerFirst_name);
        pattern = pattern.replace(/%lastname%/, lowerLast_name);
        pattern = pattern.replace(/(%ln{)(\d+)(}%)/, (_match: string, ...groups: any[]) => lowerLast_name.slice(0, +groups[1]));
        pattern = pattern.replace(/(%fn{)(\d+)(}%)/, (_match: string, ...groups: any[]) => lowerFirst_name.slice(0, +groups[1]));
        return pattern;
    }
}
