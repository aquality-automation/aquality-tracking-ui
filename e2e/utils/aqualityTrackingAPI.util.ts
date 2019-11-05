import superagent from 'superagent';
import { environment } from '../../src/environments/environment';
import { TestRun } from '../../src/app/shared/models/testRun';
import { TestSuite } from '../../src/app/shared/models/testSuite';
import { Test } from '../../src/app/shared/models/test';
import { TestResult } from '../../src/app/shared/models/test-result';
import { logger } from './log.util';
import { Step, StepToTest } from '../../src/app/shared/models/steps';

export class ImportParams {
    projectId: number;
    importToken: string;
    format: string;
    suite: string;
    addToLastTestRun: boolean;
    testNameKey?: string;
}

const createAuthHeaderValue = (token: string, projectId: number) => {
    return `Basic ${Buffer.from(`project:${projectId}:${token}`).toString('base64')}`;
};

const serializeToQueryString = (object: object) => {
    if (!object) {
        return '';
    }
    const str = [];
    for (const proprty in object) {
        if (object.hasOwnProperty(proprty)) {
            str.push(encodeURIComponent(proprty) + '=' + encodeURIComponent(object[proprty]));
        }
    }
    return `?${str.join('&')}`;
};

const getFullURL = (endpoint: string, params: object) => {
    return environment.host + endpoint + serializeToQueryString(params);
};

const sendGet = async (endpoint: string, params: object, token: string, projectId: number) => {
    try {
        const resp = await superagent.get(getFullURL(endpoint, params))
            .set('Authorization', createAuthHeaderValue(token, projectId))
            .set('Accept', 'application/json');
        return resp.body;
    } catch (error) {
        throw new Error(`Was not able to get ${endpoint}`);
    }
};

const sendPost = async (endpoint: string, params: object, body: any, token: string, projectId: number) => {
    try {
        const resp = await superagent.post(getFullURL(endpoint, params))
            .send(body)
            .set('Authorization', createAuthHeaderValue(token, projectId))
            .set('Accept', 'application/json');
        return resp.body;
    } catch (error) {
        throw new Error(`Was not able to create ${endpoint}. \n ${error}`);
    }
};

const sendPostWithfiles = (endpoint: string, params: object, filesAsString: string[], filenames: string[]) => {
    const req = superagent.post(getFullURL(endpoint, params));
    for (let i = 0; i < filesAsString.length; i++) {
        const file = filesAsString[i];
        const filename = filenames[i];
        req.attach('file', new Buffer(file), { filename });
    }

    return req;
};

const doImport = async (params: ImportParams, filesAsString: string[], fileNames: string[]): Promise<boolean> => {
    try {
        logger.info(`Start API import with params: ${JSON.stringify(params)}`);
        logger.info(`Files count: ${filesAsString.length}`);
        logger.info(`File Names count: ${filesAsString.length}`);
        await sendPostWithfiles('/import', params, filesAsString, fileNames);
        logger.info(`Import was finished Successfully`);
        return true;
    } catch (err) {
        logger.error(`Import was failed: ${err.message}`);
        return false;
    }
};

const createTestRun = async (testRun: TestRun, token: string, projectId: number) => {
    return sendPost('/testrun', undefined, testRun, token, projectId);
};

const getSuites = async (testSuite: TestSuite, token: string, projectId: number): Promise<TestSuite[]> => {
    return sendGet('/suite', testSuite, token, projectId);
};

const getTests = (test: Test, token: string, projectId: number): Promise<Test[]> => {
    return sendGet('/test', test, token, projectId);
};

const getResults = (testResult: TestResult, token: string, projectId: number): Promise<TestResult[]> => {
    return sendGet('/testresult', testResult, token, projectId);
};

const postResult = (testResult: TestResult, token: string, projectId: number): Promise<TestResult> => {
    return sendPost('/testresult', undefined, testResult, token, projectId);
};

const postTest = (test: Test, token: string, projectId: number): Promise<Test> => {
    return sendPost('/test', undefined, test, token, projectId);
};

const postSuite = (suite: TestSuite, token: string, projectId: number): Promise<Test> => {
    return sendPost('/suite', undefined, suite, token, projectId);
};

const postStep = (step: Step, token: string, projectId: number): Promise<Test> => {
    return sendPost('/steps', undefined, step, token, projectId);
};

const postStepToTest = (stepToTest: StepToTest, token: string, projectId: number): Promise<Test> => {
    return sendPost('/test/steps', undefined, stepToTest, token, projectId);
};


export {
    doImport,
    createTestRun,
    getSuites,
    getTests,
    getResults,
    postResult,
    postTest,
    postSuite,
    postStep,
    postStepToTest
};
