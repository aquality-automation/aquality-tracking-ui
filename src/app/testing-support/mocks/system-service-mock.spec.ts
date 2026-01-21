import { System } from "src/app/shared/models/integrations/system";
import { AqualityMock } from "./aquality-mock.spec";

export class SystemServiceMock extends AqualityMock {

    constructor() {
        super('SystemService', [getAll]);
    }

    public getAll(systems: System[]) : SystemServiceMock {
        super.configureObservable(getAll, systems);
        return this;
    }
}

const getAll: string = 'getAll';