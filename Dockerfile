FROM node:10-buster

WORKDIR /app

COPY . /app

RUN apt-get update && apt-get install -y \
    wget \
    unzip \
    && wget -q -O google-chrome.deb https://mirror.cs.uchicago.edu/google-chrome/pool/main/g/google-chrome-stable/google-chrome-stable_114.0.5735.90-1_amd64.deb \
    && dpkg -i google-chrome.deb || apt-get install -y --no-install-recommends -f \
    && rm google-chrome.deb

RUN npm install

CMD ["npm", "run", "e2e:headless"]