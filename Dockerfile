FROM node:10-buster

WORKDIR /app

COPY . /app

# Используем архивные репозитории Debian Buster, чтобы apt-get update работал
RUN sed -i '/deb.debian.org/s/^/#/' /etc/apt/sources.list \
 && sed -i '/security.debian.org/s/^/#/' /etc/apt/sources.list \
 && echo "deb http://archive.debian.org/debian buster main contrib non-free" > /etc/apt/sources.list \
 && echo "deb http://archive.debian.org/debian buster-updates main contrib non-free" >> /etc/apt/sources.list \
 && apt-get -o Acquire::Check-Valid-Until=false update \
 && apt-get install -y wget unzip \
 \
 # Скачиваем Chrome с твоего зеркала и устанавливаем через dpkg
 && wget -q -O google-chrome.deb https://mirror.cs.uchicago.edu/google-chrome/pool/main/g/google-chrome-stable/google-chrome-stable_114.0.5735.90-1_amd64.deb \
 && dpkg -i google-chrome.deb || apt-get install -y --no-install-recommends -f \
 && rm google-chrome.deb

# Устанавливаем npm зависимости
RUN npm install

CMD ["npm", "run", "e2e:headless"]
