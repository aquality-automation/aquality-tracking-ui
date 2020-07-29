FROM node:10.15.3 as runTests
WORKDIR /app
COPY . /app
ARG TOKEN
ENV AT_TOKEN=$TOKEN
ARG CIRCLE_BUILD_NUM
ENV AT_CIRCLE_BUILD_NUM=$CIRCLE_BUILD_NUM
ARG CIRCLE_BUILD_URL
ENV AT_CIRCLE_BUILD_URL=$CIRCLE_BUILD_URL
ARG CIRCLE_BRANCH
ENV AT_CIRCLE_BRANCH=$CIRCLE_BRANCH
RUN wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add -
RUN echo 'deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main' | tee /etc/apt/sources.list.d/google-chrome.list
RUN apt-get update 
RUN apt-get -y install google-chrome-stable
CMD npm run e2e:headless