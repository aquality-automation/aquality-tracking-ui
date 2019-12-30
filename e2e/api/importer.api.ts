import { sendPostFiles } from '../utils/aqualityTrackingAPI.util';
import { logger } from '../utils/log.util';
import { Project } from '../../src/app/shared/models/project';
import { EditorAPI } from './editor.api';
import { TestRun } from '../../src/app/shared/models/testRun';

export class ImportParams {
    projectId: number;
    format: ImportFormats;
    suite: string;
    addToLastTestRun: boolean;
    testNameKey?: string;
    buildName?: string;
}

export enum ImportFormats {
    cucumber = 'Cucumber'
}

const CHECK_IMPORTED_DELAY = 5000;

export class Importer {
    project: Project;
    token: string;
    editorAPI: EditorAPI;

    constructor(project: Project, token: string) {
        this.project = project;
        this.token = token;
        this.editorAPI = new EditorAPI(this.project, this.token);
    }

    public async executeImport(importParameters: ImportParams, files: string[], fileNames: string[]) {
        const result = await this.doImport(importParameters, files, fileNames);
        if (!result) {
            throw Error('Import Failed!');
        }
        return result;
    }

    public async executeCucumberImport(suiteName: string, files: object[], fileNames: string[]): Promise<any> {
        const filesAsStringArray = files.map(file => JSON.stringify(file));
        const buildNames = fileNames.map(fileName => fileName.split('.').slice(0, -1).join('.'));
        await this.executeImport({
            projectId: this.project.id,
            suite: suiteName,
            format: ImportFormats.cucumber,
            addToLastTestRun: false
        }, filesAsStringArray, fileNames);

        return new Promise(async (resolve) => {
            let imported = await this.isAllBuildsAreImported(buildNames);
            if (imported.length > 0) {
                resolve(imported);
            }

            setTimeout(async () => {
                imported = await this.isAllBuildsAreImported(buildNames);
                resolve(imported);
            }, CHECK_IMPORTED_DELAY);
        });
    }

    public generateBuilds(count: number): { names: any, filenames: string[] } {
        const names = {};
        const filenames: string[] = [];

        for (let i = 0; i < count; i++) {
            const name = `build_${i + 1}`;
            names[name] = name;
            filenames.push(`${name}.json`);
        }

        return { names, filenames };
    }

    private async isAllBuildsAreImported(buildNames: string[]): Promise<TestRun[]> {
        const testRuns = await this.editorAPI.getTestRuns({ project_id: this.project.id });
        let imported = true;
        const importedTestRuns: TestRun[] = [];
        buildNames.forEach(buildName => {
            const importedTestRun = testRuns.find(testRun => testRun.build_name === buildName);
            if (!importedTestRun) {
                imported = false;
            }
            importedTestRuns.push(importedTestRun);
        });
        return imported ? importedTestRuns : [];
    }

    private async doImport(params: ImportParams, filesAsString: string[], fileNames: string[]): Promise<boolean> {
        try {
            logger.info(`Start API import with params: ${JSON.stringify(params)}`);
            logger.info(`Files count: ${filesAsString.length}`);
            logger.info(`File Names count: ${filesAsString.length}`);
            await sendPostFiles('/import', params, filesAsString, fileNames, this.token, this.project.id);
            logger.info(`Import was finished Successfully`);
            return true;
        } catch (err) {
            logger.error(`Import was failed: ${err.message}`);
            return false;
        }
    }
}
