import { logger } from './log.util';
import { promise } from 'protractor';


const doWait = (action: () => Promise<boolean> | promise.Promise<boolean>, expectedValue: boolean, interval: number) => {
  return new Promise(async (resolve, reject) => {
    const actionResult = await action();
    if (actionResult === expectedValue) {
      setTimeout(() => resolve(), 0);
    }
    setTimeout(() => reject(actionResult), interval);
  });
};

const retrier = (action: () => Promise<boolean> | promise.Promise<boolean>,
  expectedValue: boolean, maxCount: number, interval: number, count: number) => {
  count++;
  logger.info(`[${count}] Wait for ${expectedValue}`);
  return doWait(action, expectedValue, interval).then(() => {
    logger.info('Was able to reach expected condition!');
    return true;
  }, (actionResult) => {
    if (maxCount <= count) {
      logger.warn(`Was not able to reach expected condition! Last value is '${actionResult}'`);
      return false;
    } else {
      return retrier(action, expectedValue, maxCount, interval, count);
    }
  });
};

const retrierAwait = async (action: () => Promise<boolean> | promise.Promise<boolean>, expectedValue: boolean,
  maxCount: number, interval: number, count: number): Promise<boolean> => {
  count++;
  logger.info(`[${count}] Wait for ${expectedValue}`);
  try {
    await doWait(action, expectedValue, interval);
    logger.info('Was able to reach expected condition!');
    return true;
  } catch (actionResult) {
    if (maxCount <= count) {
      logger.warn(`Was not able to reach expected condition! Last value is '${actionResult}'`);
      return false;
    } else {
      return retrier(action, expectedValue, maxCount, interval, count);
    }
  }
};

class Wait {
  forTrue(action: () => Promise<boolean> | promise.Promise<boolean>, maxCount: number, interval: number) {
    return retrierAwait(action, true, maxCount, interval, 0);
  }

  forFalse(action: () => Promise<boolean> | promise.Promise<boolean>, maxCount: number, interval: number) {
    return retrierAwait(action, false, maxCount, interval, 0);
  }
}

export const waiter = new Wait();
