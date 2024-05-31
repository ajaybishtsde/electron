import * as fs from 'fs-plus';

export const ensureDirExists = (dirPath: string) => {
    if (!fs.existsSync(dirPath)) {
        fs.makeTreeSync(dirPath);
    }
}
