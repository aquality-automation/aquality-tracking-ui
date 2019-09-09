import * as path from 'path';
import * as fs from 'fs';

class TestData {
    getFullPath(pathFromDataFolder: string) {
        return path.join(__dirname, '..', 'data', pathFromDataFolder);
    }

    readAsString(pathFromDataFolder: string): Promise<string> {
        return new Promise((resolve, reject) => {
            fs.readFile(`./e2e/data${pathFromDataFolder}`, (err, data) => {
                if (err) {
                    reject(err.message);
                }
                resolve(data.toString());
            });
        });
    }
}

export const testData = new TestData();
