const logWithTag = (tag, text) => {
    /* eslint-disable no-console */
    console.log(`[${tag}] ${new Date()} ${text} [${tag}]`);
    /* eslint-enable no-console */
};

class Logger {
    info(text) {
        logWithTag('INFO', text);
    }

    warn(text) {
        logWithTag(`WARN`, text);
    }

    error(text) {
        logWithTag(`ERROR`, text);
    }
}

export const logger = new Logger();
