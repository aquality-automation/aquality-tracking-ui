import superagent from 'superagent';
import { environment } from '../../src/environments/environment';

export class ImportParams {
    projectId: number;
    importToken: string;
    format: string;
    suite: string;
}

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

const sendGet = async (endpoint: string, params: object) => {
    return superagent.get(getFullURL(endpoint, params));
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
        await sendPostWithfiles('/import', params, filesAsString, fileNames);
        return true;
    } catch (err) {
        return false;
    }
};

export { doImport };
