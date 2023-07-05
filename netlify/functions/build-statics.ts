import { Handler } from 'aws-lambda';
import { buildCache } from 'bin/build-cache';
import { writeComponentsJson } from 'bin/components.json.js';
import { writePipelinesJson } from 'bin/pipelines.json.js';
import { exec } from 'child_process';
import path from 'path';

export const handler: Handler = async () => {
    try {
        console.log('Building cache...');
        // await runCommand('node ../../bin/pipelines.json.js');
        // await runCommand('node ../../bin/components.json.js');
        console.log(process.env);
        console.log(__dirname);
        console.log('cwd', process.cwd());
        console.log(path.resolve(__dirname, '../../../bin/pipelines.json.js'));
        writePipelinesJson();
        // writeComponentsJson();
        // buildCache();
        // await runCommand('tar -cJf --no-xattrs -f .cache.tar.xz .cache');

        return {
            statusCode: 200,
            body: 'Commands executed successfully.',
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: error.message,
        };
    }
};

function runCommand(command: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        exec(command, (error, stdout, stderr) => {
            if (error) {
                reject(new Error(`Command "${command}" failed: ${error.message}`));
            } else {
                resolve();
            }
        });
    });
}
