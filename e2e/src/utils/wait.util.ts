import { logger } from './log.util';
import { promise } from 'protractor';

class Wait {
  public async forTrue(action: () => Promise<boolean> | promise.Promise<boolean>, maxCount: number, interval: number): Promise<boolean> {
    return this.retry(action, true, maxCount, interval);
  }

  public async forFalse(action: () => Promise<boolean> | promise.Promise<boolean>, maxCount: number, interval: number): Promise<boolean> {
    return this.retry(action, false, maxCount, interval);
  }

  private async doWait(
    action: () => Promise<boolean> | promise.Promise<boolean>,
    expectedValue: boolean,
    interval: number
  ): Promise<void> {
    const actionResult = await action();
    if (actionResult === expectedValue) {
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, interval));
    throw actionResult;
  }

  private async retry(
    action: () => Promise<boolean> | promise.Promise<boolean>,
    expectedValue: boolean,
    maxCount: number,
    interval: number,
    count: number = 0
  ): Promise<boolean> {
    count++;
    logger.info(`[${count}] Waiting for ${expectedValue}`);

    try {
      await this.doWait(action, expectedValue, interval);
      logger.info('Was able to reach expected condition!');
      return true;
    } catch (actionResult) {
      if (count >= maxCount) {
        logger.warn(`Was not able to reach expected condition! Last value is '${actionResult}'`);
        return false;
      } else {
        return this.retry(action, expectedValue, maxCount, interval, count);
      }
    }
  }
}

export const waiter = new Wait();
