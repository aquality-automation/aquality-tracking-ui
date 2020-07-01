import { ActivatedRoute } from '@angular/router';

class RouteUtils {
    getProjectId(route: ActivatedRoute) {
        const value = this.getParam(route, 'projectId');
        return value ? parseInt(value, 10) : undefined;
    }

    getParam(route: ActivatedRoute, paramName: string): string {
        let currentRoute = route;
        do {
            if (currentRoute.snapshot.params[paramName]) {
                return currentRoute.snapshot.params[paramName];
            }
            currentRoute = currentRoute.firstChild;
        } while (currentRoute);
    }
}

export default new RouteUtils();
