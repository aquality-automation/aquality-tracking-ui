import { sendPostWithfiles } from '../utils/aqualityTrackingAPI.util';
import { logger } from '../utils/log.util';
import { Project } from '../../src/app/shared/models/project';

export class ImportParams {
    projectId: number;
    apiToken: string;
    format: ImportFormats;
    suite: string;
    addToLastTestRun: boolean;
    testNameKey?: string;
}

export enum ImportFormats {
    cucumber = 'Cucumber'
}

export class Importer {
    project: Project;
    token: string;

    constructor(project: Project, token: string) {
        this.project = project;
        this.token = token;
    }

    public async executeImport(importParameters: ImportParams, files: string[], fileNames: string[]) {
        const result = await this.doImport(importParameters, files, fileNames);
        if (!result) {
            throw Error('Import Failed!');
        }
        return result;
    }

    public async executeCucumberImport(suiteName: string, files: string[], fileNames: string[]) {
        return this.executeImport({
            projectId: this.project.id,
            suite: suiteName,
            apiToken: this.token,
            format: ImportFormats.cucumber,
            addToLastTestRun: false
        }, files, fileNames);
    }

    public generateBuilds (count: number): { names: any, filenames: string[] } {
        const names = {};
        const filenames: string[] = [];

        for (let i = 0; i < count; i++) {
            const name = `build_${i + 1}`;
            names[name] = name;
            filenames.push(`${name}.json`);
        }

        return { names, filenames };
    }

    private async doImport (params: ImportParams, filesAsString: string[], fileNames: string[]): Promise<boolean> {
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
    }
}
