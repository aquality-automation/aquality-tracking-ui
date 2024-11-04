import * as path from 'path';
import * as fs from 'fs';
import { logger } from './log.util';
import { waiter } from './wait.util';
import { promisify } from 'util';

const dataFolderName = 'data';
const dataPath = `./e2e/src/${dataFolderName}`;
const downloadsFolderName = 'downloads';
const readdir = promisify(fs.readdir);
const lstat = promisify(fs.lstat);
const unlink = promisify(fs.unlink);
const rmdir = promisify(fs.rmdir);
const access = promisify(fs.access);

class TestData {
    /**
     * @return {string} downloads folder path starting from folder where test data is stored
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
        const fullPath = path.join(__dirname, '..', dataFolderName, pathFromDataFolder);
        logger.info(`Full path from data folder: ${fullPath}`);
        return fullPath;
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
                logger.info(`\n${data.toString()}\n`);
                resolve(data.toString());
            });
        });
    }

    /**
    * Asynchronously removes downloads folder and its contents.
    */
    async cleanUpDownloadsData(): Promise<void> {
        const downloadsPath = this.getFullPath(`/${downloadsFolderName}`);
        logger.info('Running Downloads Clean UP!');

        try {
            try {
                await access(downloadsPath);
                logger.info('Downloads folder exists');
            } catch {
                logger.info('Downloads folder does not exist, no cleanup necessary');
                return;
            }

            await this.deleteDirectoryRecursively(downloadsPath);
            logger.info('Downloads folder cleaned up successfully.');
        } catch (error) {
            logger.error(`Was not able to clean up the downloads folder: ${error.message}`);
        }
    }

    /**
     * Recursively deletes a directory and all its contents asynchronously.
     *
     * @param directoryPath - The path of the directory to delete.
     * Deletes all files and subdirectories within the specified directory,
     * then removes the directory itself.
     */
    async deleteDirectoryRecursively(directoryPath: string): Promise<void> {
        const files = await readdir(directoryPath);
        for (const file of files) {
            const filePath = path.join(directoryPath, file);
            const fileStat = await lstat(filePath);

            if (fileStat.isDirectory()) {
                await this.deleteDirectoryRecursively(filePath);
            } else {
                await unlink(filePath);
            }
        }

        await rmdir(directoryPath);
    }
    
    /**
     * Check if file was uploaded and clenup downloads
     * @param extension Extension name, e.g: '.html'
     * @return {Promise<boolean>} promise resolving into true is file exists
     */
    async isFileDownloadedAndRemove(extension?: string, startsWith?: string): Promise<boolean> {
        const result = await this.waitUntilFileExists(downloadsFolderName, extension, startsWith);
        await this.cleanUpDownloadsData();
        return result;
    }

    /**
     * Wait for file exists
     * @param pathFromDataFolder path starting from folder where test data is stored e.g. import/cucumber.json
     * @param extension Extension name, e.g: '.html'
     * @return {Promise<boolean>} promise resolving into true is file exists
     */
    async waitUntilFileExists(pathFromDataFolder: string, extension?: string, startsWith?: string): Promise<boolean> {
        const isFileExist = async () => {
            const files = this.findFilesInDir(pathFromDataFolder, extension, startsWith);
            const count = files ? files.length : 0;
            logger.info(`Files in download folder: ${count}`);
            return count > 0;
        };
        return await waiter.forTrue(isFileExist, 10, 500);
    }

    /**
     * Find all files recursively in specific folder with specific extension, e.g:
     * findFilesInDir('./project/src', '.html') ==> ['./project/src/a.html','./project/src/build/index.html']
     * @param  {String} pathFromDataFolder    Path relative to this file or other file which requires this files
     * @param  {String} extension   Extension name, e.g: '.html'
     * @param  {String} startsWith  Filename that start with the value will be looked for
     * @return {Array}              Result files with path string in an array
     */
    findFilesInDir = (pathFromDataFolder: string, extension?: string, startsWith?: string): Array<string> => {
        const startPath = this.getFullPath(`${pathFromDataFolder}`);
        let results = [];

        if (!fs.existsSync(startPath)) {
            logger.warn(`Directory does not exist: ${startPath}`);
            return;
        }

        const files = fs.readdirSync(startPath);
        for (let i = 0; i < files.length; i++) {
            const filename = path.join(startPath, files[i]);
            const stat = fs.lstatSync(filename);
            if (stat.isDirectory()) {
                results = results.concat(this.findFilesInDir(filename, extension));
            } else if (extension && filename.endsWith(extension)) {
                logger.info(`Found File: ${filename}`);
                results.push(filename);
            } else if (startsWith && filename.startsWith(path.join(startPath, startsWith))) {
                logger.info(`Found File: ${filename}`);
                results.push(filename);
            }
        }
        return results;
    }
}

export const testData = new TestData();
