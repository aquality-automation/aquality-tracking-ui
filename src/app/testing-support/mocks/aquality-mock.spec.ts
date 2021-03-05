import { of } from "rxjs";

export class AqualityMock {
    private mockObject: any;

    constructor(className: string, methods: string[]){
        this.mockObject = jasmine.createSpyObj(className, methods);
    }

    public mock(): any {
        return this.mockObject;
    }

    protected configureObservable(method: string, value: any) {
        this.mockObject[method].and.returnValue(of(value));
    }

    protected configure(method: string, value: any) {
        this.mockObject[method].and.returnValue(value);
    }
}