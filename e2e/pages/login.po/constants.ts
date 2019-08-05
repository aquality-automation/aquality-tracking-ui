import { by, element } from 'protractor';

export const baseUrl = '/';

export const elements = {
    uniqueElement: element(by.id('login')),
    loginField: element(by.id('login')),
    passwordField: element(by.id('password')),
    logInButton: element(by.css('.btn-primary'))
};

export const names = {
    pageName: 'Login Page'
};


