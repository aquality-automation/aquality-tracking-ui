import { Injectable } from '@angular/core';
import { UserService } from './user.services';
import { LocalPermissions } from '../shared/models/LocalPermissions';

export enum ELocalPermissions {
    admin = 'admin',
    manager = 'manager',
    engineer = 'engineer',
    viewer = 'viewer',
}

export enum EGlobalPermissions {
    admin = 'admin',
    manager = 'manager',
    audit_admin = 'audit_admin',
    auditor = 'auditor',
    unit_coordinator = 'unit_coordinator',
    account_manager = 'account_manager',
    head = 'head'
}

enum LocalStorageKeys {
    permissions_update = 'permissions-update',
    permissions = 'permissions'
}

@Injectable()
export class PermissionsService extends UserService {

    public async hasPermissions(anyOfGlobal?: EGlobalPermissions[], anyOfLocal?: ELocalPermissions[]) {
        if (await this.handleIsLogged()) {
            const local = await this.hasLocalPermissions(anyOfLocal);
            return local || this.hasGlobalPermissions(anyOfGlobal);
        }

        throw new Error(`You are not logged in!`);
    }

    public async hasProjectPermissions(projectId: number, anyOfGlobal: EGlobalPermissions[], anyOfLocal: ELocalPermissions[]) {
        if (await this.handleIsLogged()) {
            const local = await this.hasProjectLocalPermissions(projectId, anyOfLocal);
            return local || this.hasGlobalPermissions(anyOfGlobal);
        }

        throw new Error(`You are not logged in!`);
    }

    private hasGlobalPermissions(anyOf: EGlobalPermissions[]) {
        if (!anyOf) {
            return false;
        }
        return anyOf.find(x => !!this.currentUser()[x] === true) !== undefined;
    }

    private async hasProjectLocalPermissions(projectId: number, anyOf: ELocalPermissions[]): Promise<boolean> {
        let permissions: LocalPermissions[] = await this.getLocalPermissions();
        permissions = permissions.filter(permission => permission.project_id === Number.parseInt(`${projectId}`));
        return this.searchForLocalPermissions(anyOf, permissions);
    }

    private async hasLocalPermissions(anyOf: ELocalPermissions[]): Promise<boolean> {
        const permissions: LocalPermissions[] = await this.getLocalPermissions();
        return this.searchForLocalPermissions(anyOf, permissions);
    }

    private searchForLocalPermissions(anyOf: ELocalPermissions[], permissions: LocalPermissions[]): boolean {
        if (!anyOf) {
            return false;
        }
        return permissions.find(permission => {
            let result = false;
            anyOf.forEach(name => {
                if (permission[name] === 1) {
                    result = true;
                    return;
                }
            });
            return result;
        }) !== undefined;
    }

    private async getLocalPermissions(): Promise<LocalPermissions[]> {
        if (localStorage.getItem(LocalStorageKeys.permissions_update) !== null) {
            const update: Date = new Date(localStorage.getItem(LocalStorageKeys.permissions_update));
            const expiration: Date = new Date();
            expiration.setMinutes(expiration.getMinutes() - 5);

            if (update > expiration) {
                return JSON.parse(localStorage.getItem(LocalStorageKeys.permissions));
            }
        }

        const newPermissions: LocalPermissions[] = await this.getUserProjects(this.currentUser().id);
        localStorage.setItem(LocalStorageKeys.permissions, JSON.stringify(newPermissions));
        localStorage.setItem(LocalStorageKeys.permissions_update, new Date().toString());
        return JSON.parse(localStorage.getItem(LocalStorageKeys.permissions));
    }
}
