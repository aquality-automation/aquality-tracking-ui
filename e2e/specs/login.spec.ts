import { LogIn } from '../pages/login.po';
import * as users from '../data/users.json';

describe('Log in', () => {
  let logInPage: LogIn;

  beforeEach(() => {
    logInPage = new LogIn();
    logInPage.navigateTo();
  });

  afterEach(async () => {
    if (await logInPage.menuBar.isLogged()) {
      return logInPage.menuBar.clickLogOut();
    }
  });

  it('should be able to login as admin', async () => {
    await logInPage.setUserName(users.admin.user_name);
    await logInPage.setPassword(users.admin.password);
    await logInPage.clickLogIn();
    expect(logInPage.menuBar.isLogged()).toBe(true);
  });

  it('should not be able to login with wrong username', async () => {
    await logInPage.setUserName('admin1');
    await logInPage.setPassword(users.admin.password);
    await logInPage.clickLogIn();
    expect(logInPage.menuBar.isLogged()).toBe(false);
    expect(logInPage.notification.isError()).toBe(true);
  });

  it('should not be able to login with wrong password', async () => {
    await logInPage.setUserName(users.admin.user_name);
    await logInPage.setPassword('1234567');
    await logInPage.clickLogIn();
    expect(logInPage.menuBar.isLogged()).toBe(false);
    expect(logInPage.notification.isError()).toBe(true);
  });

  it('Log in button should be disabled if username is blank', async () => {
    await logInPage.setPassword('1234567');
    expect(!logInPage.isLogInEnabled()).toBe(false);
  });

  it('Log in button should be disabled if password is blank', async () => {
    await logInPage.setUserName('admin');
    expect(!logInPage.isLogInEnabled()).toBe(false);
  });
});
