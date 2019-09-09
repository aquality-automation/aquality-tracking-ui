import * as path from 'path';
import * as fs from 'fs';
import { logger } from './log.util';
import { waiter } from './wait.util';

const dataFolderName = 'data';
const dataPath = `./e2e/${dataFolderName}`;
const downloadsFolderName = 'downloads';

class TestData {
    /**
     * @return {string} downlodas folder path starting from folder where test data is stored
     */
    getSimpleDownloadsFolderPath(): string {
        return `/${downloadsFolderName}`;
    }

    /**
     * Get full path for test data file
     * @param pathFromDataFolder path starting from folder where test data is stored e.g. import/cucumber.json
     * @return {string} full path
     */
    getFullPath(pathFromDataFolder: string): string {
        return path.join(__dirname, '..', dataFolderName, pathFromDataFolder);
    }

    /**
     * Read file and get it as a string
     * @param pathFromDataFolder path starting from folder where test data is stored e.g. import/cucumber.json
     * @return {Promise<string>} promise resolving into file data as string
     */
    readAsString(pathFromDataFolder: string): Promise<string> {
        return this.readAsStringFromRoot(`${dataPath}${pathFromDataFolder}`);
    }

    /**
     * Read file and get it as a string
     * @param pathFromDataFolder path starting from project root folder e.g. /e2e/data/import/cucumber.json
     * @return {Promise<string>} promise resolving into file data as string
     */
    readAsStringFromRoot(pathFromRoot: string): Promise<string> {
        return new Promise((resolve, reject) => {
            logger.info(`Reading file: ${pathFromRoot}`);
            fs.readFile(pathFromRoot, (err, data) => {
                if (err) {
                    reject(err.message);
                }
                resolve(data.toString());
            });
        });
    }

    /**
     * Remove downloads folder from data
     */
    cleanUpDownloadsData() {
        const downloadsPath = this.getFullPath(`/${downloadsFolderName}`);
        return new Promise((resolve) => {
            logger.info('Running Downloads Clean UP!');
            if (fs.existsSync(downloadsPath)) {
                fs.readdirSync(downloadsPath).forEach(function (file, index) {
                    const curPath = downloadsPath + '/' + file;
                    if (fs.lstatSync(curPath).isDirectory()) {
                        this.deleteFolderRecursive(curPath);
                    } else {
                        fs.unlinkSync(curPath);
                    }
                });
                resolve();
            }
        });
    }

    /**
     * Check if file exists
     * @param pathFromDataFolder path starting from folder where test data is stored e.g. import/cucumber.json
     * @param filter Extension name, e.g: '.html'
     * @return {Promise<boolean>} promise resolving into true is file exists
     */
    async waitUntilFileExists(pathFromDataFolder: string, filter: string): Promise<boolean> {
        return waiter.forTrue(() => {
            const files = this.findFilesInDir(pathFromDataFolder, filter);
            const count = files ? files.length : 0;
            logger.info(`Files in download folder: ${count}`);
            return count > 0;
        }, 10, 500);
    }

    /**
     * Find all files recursively in specific folder with specific extension, e.g:
     * findFilesInDir('./project/src', '.html') ==> ['./project/src/a.html','./project/src/build/index.html']
     * @param  {String} startPath    Path relative to this file or other file which requires this files
     * @param  {String} filter       Extension name, e.g: '.html'
     * @return {Array}               Result files with path string in an array
     */
    findFilesInDir = (pathFromDataFolder, filter: string): Array<string> => {
        const startPath = this.getFullPath(`${pathFromDataFolder}`);
        let results = [];

        if (!fs.existsSync(startPath)) {
            logger.error(`Directory does not exist: ${startPath}`);
            return;
        }

        const files = fs.readdirSync(startPath);
        for (let i = 0; i < files.length; i++) {
            const filename = path.join(startPath, files[i]);
            const stat = fs.lstatSync(filename);
            if (stat.isDirectory()) {
                results = results.concat(this.findFilesInDir(filename, filter));
            } else if (filename.indexOf(filter) >= 0) {
                logger.info(`Found File: ${filename}`);
                results.push(filename);
            }
        }
        return results;
    }
}

export const testData = new TestData();
