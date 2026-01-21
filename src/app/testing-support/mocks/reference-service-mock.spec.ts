import { Reference } from "src/app/shared/models/integrations/reference";
import { AqualityMock } from "./aquality-mock.spec";

export class ReferenceServiceMock extends AqualityMock {

    constructor() {
        super('ReferenceService', [get, create, deleteMethod, getRefSystemName]);
    }

    public get(refs: Reference[]): ReferenceServiceMock {
        super.configureObservable(get, refs);
        return this;
    }

    public create(ref: Reference): ReferenceServiceMock {
        super.configureObservable(create, ref);
        return this;
    }

    public getRefSystemName(systemName: string): ReferenceServiceMock {
        super.configure(getRefSystemName, systemName);
        return this;
    }

    public delete(): ReferenceServiceMock {
        super.configureObservable(deleteMethod, {});
        return this;
    }
}

const get: string = 'get';
const create: string = 'create';
const deleteMethod: string = 'delete';
const getRefSystemName: string = 'getRefSystemName';