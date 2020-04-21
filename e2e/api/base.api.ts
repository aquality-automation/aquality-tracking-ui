import { Project } from '../../src/app/shared/models/project';
import { ATError } from '../../src/app/shared/models/error';
import { ApiAssertMessages } from '../specs/api/api.constants';

export class BaseAPI {
    project: Project;
    token: string;

    constructor(project: Project, token: string) {
        this.project = project;
        this.token = token;
    }

    public async assertNegativeResponse(promise: Promise<object>, expectedError: string): Promise<void> {
        let atError: ATError;
        try {
            await promise;
        } catch (error) {
            atError = error;
        }

        expect(atError).toBeDefined(ApiAssertMessages.errorNotRaised);
        expect(atError).toBe(expectedError, ApiAssertMessages.errorIsWrong);
    }
}
