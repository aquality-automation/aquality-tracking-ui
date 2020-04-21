import superagent, { SuperAgentRequest } from 'superagent';
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

enum RequestType {
    post = 'post',
    get = 'get',
    delete = 'delete'
}

const createAuthHeaderValue = (token: string, projectId: number) => {
    return `Basic ${Buffer.from(`project:${projectId}:${token}`).toString('base64')}`;
};

const send = (fullUrl: string, type: RequestType, token: string, projectId: number, body?: object): SuperAgentRequest => {
    const request = superagent[type](fullUrl)
        .set('Authorization', createAuthHeaderValue(token, projectId))
        .set('Accept', 'application/json');

    if (body) {
        request.send(body);
    }

    return request;
};

const serializeToQueryString = (object: object) => {
    if (!object) {
        return '';
    }
    const str = [];
    for (const property in object) {
        if (object.hasOwnProperty(property) && object[property] !== undefined) {
            str.push(`${encodeURIComponent(property)}=${encodeURIComponent(object[property])}`);
        }
    }
    return `?${str.join('&')}`;
};

const getFullURL = (endpoint: string, params: object) => {
    return `${environment.host}${endpoint}${serializeToQueryString(params)}`;
};

const sendGet = async (endpoint: string, params: object, token: string, projectId: number) => {
    try {
        const resp = await send(getFullURL(endpoint, params), RequestType.get, token, projectId);
        return resp.body;
    } catch (error) {
        logger.error(`Was not able to get ${getFullURL(endpoint, params)}`);
        throw error.response.body.message;
    }
};

const sendPost = async (endpoint: string, params: object, body: any, token: string, projectId: number) => {
    try {
        const resp = await send(getFullURL(endpoint, params), RequestType.post, token, projectId, body);
        return resp.body;
    } catch (error) {
        logger.error(`Was not able to post ${getFullURL(endpoint, params)}`);
        throw error.response.body.message;
    }
};

const sendDelete = async (endpoint: string, params: object, body: any, token: string, projectId: number) => {
    try {
        const resp = await send(getFullURL(endpoint, params), RequestType.delete, token, projectId, body);
        return resp.body;
    } catch (error) {
        logger.error(`Was not able to delete ${getFullURL(endpoint, params)}`);
        throw error.response.body.message;
    }
};

const sendPostFiles = (endpoint: string, params: object, filesAsString: string[], filenames: string[],
    token: string, projectId: number) => {
    const req = send(getFullURL(endpoint, params), RequestType.post, token, projectId);
    for (let i = 0; i < filesAsString.length; i++) {
        const file = filesAsString[i];
        const filename = filenames[i];
        req.attach('file', new Buffer(file), { filename });
    }

    return req;
};

export {
    sendPostFiles,
    sendPost,
    sendGet,
    sendDelete
};
