import { Project } from '../../../src/app/shared/models/project';
import { ATError } from '../../../src/app/shared/models/error';
import { ApiAssertMessages } from '../specs/api/api.constants';
import superagent, { SuperAgentRequest } from 'superagent';
import { environment } from '../../../src/environments/environment';
import { logger } from '../utils/log.util';

enum RequestType {
    post = 'post',
    get = 'get',
    delete = 'delete'
}

export class BaseAPI {
    project: Project;
    token: string;
    protected cookie: string;

    constructor(project: Project, token: string, cookie?: string) {
        this.project = project;
        this.token = token;
        this.cookie = cookie;
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

    protected sendGet = async (endpoint: string, params: object = undefined) => {
        try {
            const resp = await this.send(this.getFullURL(endpoint, params), RequestType.get);
            return resp.body;
        } catch (error) {
            logger.error(`Was not able to get ${this.getFullURL(endpoint, params)}:\n${error.response.body.message}`);
            throw error.response.body.message;
        }
    }

    protected sendPost = async (endpoint: string, params: object, body: any) => {
        try {
            const resp = await this.send(this.getFullURL(endpoint, params), RequestType.post, body);
            return resp.body;
        } catch (error) {
            logger.error(`Was not able to post ${this.getFullURL(endpoint, params)}`);
            throw error.response.body.message;
        }
    }

    protected sendDelete = async (endpoint: string, params: object, body: any = undefined) => {
        try {
            const resp = await this.send(this.getFullURL(endpoint, params), RequestType.delete, body);
            return resp.body;
        } catch (error) {
            logger.error(`Was not able to delete ${this.getFullURL(endpoint, params)}`);
            throw error.response.body.message;
        }
    }

    protected sendPostFiles = (endpoint: string, params: object, filesAsString: string[], filenames: string[],
        token: string, projectId: number) => {
        const req = this.send(this.getFullURL(endpoint, params), RequestType.post);
        for (let i = 0; i < filesAsString.length; i++) {
            const file = filesAsString[i];
            const filename = filenames[i];
            req.attach('file', new Buffer(file), { filename });
        }

        return req;
    }

    private createAuthHeaderValue = () => {
        if (this.cookie) {
            return `Basic ${this.cookie}`;
        }

        if (this.project && this.token) {
            return `Basic ${Buffer.from(`project:${this.project.id}:${this.token}`).toString('base64')}`;
        }

        throw new Error(('You are trying to make wrong authorization: you should specify project and token, or cookie!'));
    }

    private send = (fullUrl: string, type: RequestType, body?: object): SuperAgentRequest => {
        const request = superagent[type](fullUrl)
            .set('Authorization', this.createAuthHeaderValue())
            .set('Accept', 'application/json');

        if (body) {
            request.send(body);
        }

        return request;
    }

    private serializeToQueryString = (object: object) => {
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
    }

    private getFullURL = (endpoint: string, params: object) => {
        return `${environment.host}${endpoint}${this.serializeToQueryString(params)}`;
    }
}
