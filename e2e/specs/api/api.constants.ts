export enum ApiAssertMessages {
    errorNotRaised = 'Error was not raised!',
    errorIsWrong = 'Error message is wrong!',
    idMissed = 'id is missed!',
    nameWrong = 'name is wrong!',
    projecIdWrong = 'project_id is wrong!',
    suiteMissed = 'suite is missed!',
    idWrong = 'id is wrong!',
    startTimeMissed = 'start_time is missed!',
    startTimeWrong = 'start_time is wrong!',
    finishTimeWrong = 'finish_time is wrong!',
    startDateMissed = 'start_date is missed!',
    finalResultIdWrong = 'final_result_id is wrong!',
    testIdWrong = 'test_id is wrong!',
}

class ApiResponseErrors {
    public missedId = `You should specify 'id'!`;
    public missedIdOrName = `You should specify 'id' or/and 'name' suite parameters!`;
    public missedProjectId = `You should specify 'project_id'!`;
    public missedBuildName = `You should specify 'build_name'!`;
    public missedSuiteId = `You should specify 'test_suite_id'`;
    public missedTestId = `You should specify 'test_id'`;
    public missedTestRunId = `You should specify 'test_run_id'`;
    public missedFinalResultId = `You should specify 'final_result_id' - Failed: 1, Passed: 2, Not Executed: 3, Pending: 5.`;
    public entityWithIdDoesNotExist = `Entity with specified id does not exist!`;
    // tslint:disable-next-line: quotemark
    public missedSuites = "You should specify 'suites' array with single suite like `[{id: test_suite_id}]`";
    public anonymousNotAllowedToViewTestSuites = this.anonymousNotAllowedToView('Test Suites');
    public anonymousNotAllowedToViewTests = this.anonymousNotAllowedToView('Tests');
    public anonymousNotAllowedToViewTestResults = this.anonymousNotAllowedToView('Test Results');
    public anonymousNotAllowedToCreateTestRun = this.anonymousNotAllowedToCreate('Test Run');

    private anonymousNotAllowedToView(entity: string) {
        return `[Permissions anonymous]: Account is not allowed to view ${entity}`;
    }

    private anonymousNotAllowedToCreate(entity: string) {
        return `[Permissions anonymous]: Account is not allowed to create ${entity}`;
    }
}
export const apiResponseErrors = new ApiResponseErrors();
