import { logIn } from '../pages/login.po';
import * as users from '../data/users.json';

describe('Log in', () => {

  beforeEach(() => {
    logIn.navigateTo();
  });

  afterEach(async () => {
    if (await logIn.menuBar.isLogged()) {
      return logIn.menuBar.clickLogOut();
    }
  });

  it('should be able to login as admin', async () => {
    await logIn.setUserName(users.admin.user_name);
    await logIn.setPassword(users.admin.password);
    await logIn.clickLogIn();
    return expect(logIn.menuBar.isLogged()).toBe(true);
  });

  it('should not be able to login with wrong username', async () => {
    await logIn.setUserName('admin1');
    await logIn.setPassword(users.admin.password);
    await logIn.clickLogIn();
    await expect(logIn.menuBar.isLogged()).toBe(false);
    return logIn.notification.assertIsError();
  });

  it('should not be able to login with wrong password', async () => {
    await logIn.setUserName(users.admin.user_name);
    await logIn.setPassword('1234567');
    await logIn.clickLogIn();
    await expect(logIn.menuBar.isLogged()).toBe(false);
    return logIn.notification.assertIsError();
  });

  it('Log in button should be disabled if username is blank', async () => {
    await logIn.setPassword('1234567');
    return expect(!logIn.isLogInEnabled()).toBe(false);
  });

  it('Log in button should be disabled if password is blank', async () => {
    await logIn.setUserName('admin');
    return expect(!logIn.isLogInEnabled()).toBe(false);
  });
});
