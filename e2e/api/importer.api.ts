import { logger } from '../utils/log.util';
import { Project } from '../../src/app/shared/models/project';
import { EditorAPI } from './editor.api';
import { TestRun } from '../../src/app/shared/models/testRun';
import { BaseAPI } from './base.api';

export class ImportParams {
    projectId?: number;
    format: ImportFormats;
    suite: string;
    addToLastTestRun: boolean;
    testNameKey?: string;
    buildName?: string;
}

export enum ImportFormats {
    cucumber = 'Cucumber',
    msTest = 'MSTest'
}

const CHECK_IMPORTED_DELAY = 2000;

export class Importer extends EditorAPI {

    public async executeImport(importParameters: ImportParams, files: string[], fileNames: string[]): Promise<TestRun[]> {
        importParameters.projectId = this.project.id;
        const buildNames = fileNames.map(fileName => fileName.split('.').slice(0, -1).join('.'));
        const result = await this.doImport(importParameters, files, fileNames);
        if (!result) {
            throw Error('Import Failed!');
        }

        return new Promise<TestRun[]>(async (resolve) => {
            let imported: TestRun[]  = await this.isAllBuildsAreImported(buildNames);
            if (imported.length > 0) {
                logger.info(`Import was finished Successfully`);
                resolve(imported);
            }

            setTimeout(async () => {
                imported = await this.isAllBuildsAreImported(buildNames);
                if (imported.length > 0) {
                    logger.info(`Import was finished Successfully`);
                    resolve(imported);
                }

                setTimeout(async () => {
                    imported = await this.isAllBuildsAreImported(buildNames);
                    logger.info(`Import was finished Successfully, but testrun was not created yet.`);
                    resolve(imported);
                }, CHECK_IMPORTED_DELAY);
            }, CHECK_IMPORTED_DELAY);
        });
    }

    public async executeCucumberImport(suiteName: string, files: object[], fileNames: string[]): Promise<TestRun[]> {
        const filesAsStringArray = files.map(file => JSON.stringify(file));
        return this.executeImport({
            projectId: this.project.id,
            suite: suiteName,
            format: ImportFormats.cucumber,
            addToLastTestRun: false
        }, filesAsStringArray, fileNames);
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
        const testRuns = await this.getTestRuns({ project_id: this.project.id });
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
            await this.sendPostFiles('/import', params, filesAsString, fileNames, this.token, this.project.id);
            return true;
        } catch (err) {
            logger.error(`Import was failed: ${err.message}`);
            return false;
        }
    }
}
