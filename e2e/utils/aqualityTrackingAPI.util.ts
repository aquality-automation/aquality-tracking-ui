import superagent from 'superagent';
import { environment } from '../../src/environments/environment';
import { logger } from './log.util';

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

const sendDelete = async (endpoint: string, params: object, body: any, token: string, projectId: number) => {
    try {
        const resp = await superagent.delete(getFullURL(endpoint, params))
            .send(body)
            .set('Authorization', createAuthHeaderValue(token, projectId))
            .set('Accept', 'application/json');
        return resp.body;
    } catch (error) {
        throw new Error(`Was not able to delete ${endpoint}. \n ${error}`);
    }
};

const sendPostFiles = (endpoint: string, params: object, filesAsString: string[], filenames: string[],
    token: string, projectId: number) => {
    const req = superagent.post(getFullURL(endpoint, params));
    req.set('Authorization', createAuthHeaderValue(token, projectId));
    for (let i = 0; i < filesAsString.length; i++) {
        const file = filesAsString[i];
        const filename = filenames[i];
        req.attach('file', new Buffer(file), { filename });
    }

    return req;
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

export {
    sendPostWithfiles,
    sendPostFiles,
    sendPost,
    sendGet,
    doImport,
    sendDelete
};
