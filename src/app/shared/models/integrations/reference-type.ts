export class ReferenceType {
    id: number;
    path: string;
    name: string;

    constructor(id: number, path: string) {
        this.id = id;
        this.path = path;
        this.name = path;
    }
}

export const referenceTypes = {
    Test: new ReferenceType(1, "test"),
    Issue: new ReferenceType(2, "issue"),
    TestRun: new ReferenceType(3, "testrun")
}
