import { Injectable } from '@angular/core';
import { EGlobalPermissions, ELocalPermissions, PermissionsService } from '../../services/current-permissions.service';
import { Router, RouterStateSnapshot } from '@angular/router';

export class Permissions {
    global?: EGlobalPermissions[];
    local?: ELocalPermissions[];
}

@Injectable()
export class GuardService {
    constructor(
        private router: Router,
        private permissionsService: PermissionsService
    ) { }

    public async redirect(permissions: Permissions, commands: string[]) {
        if (await this.permissionsService
            .hasPermissions(permissions.global, permissions.local)) {
            return true;
        }
        this.router.navigate(commands);
        return false;
    }

    public async redirectProject(state: RouterStateSnapshot, permissions: Permissions, commands: string[]) {
        if (await this.permissionsService
            .hasProjectPermissions(+state.url.split('/')[2], permissions.global, permissions.local )) {
            return true;
        }
        this.router.navigate(commands);
        return false;
    }
}
