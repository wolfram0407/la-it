FROM node:18

# USER root

COPY ./package.json /finalProject/
COPY ./package-lock.json /finalProject/

WORKDIR /finalProject/
RUN npm install

# RUN npm install -g @nestjs/cli 

# 현재 경로에 존재하는 경로의 모든 파일 및 폴더 도커컴퓨터 안으로 복사(finalProject 폴더는 복사 시 자동 생성)
COPY . /finalProject/

WORKDIR /finalProject/src

CMD npm run start:dev