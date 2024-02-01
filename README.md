# 📺 라잇

실시간 스트리밍 방송과 채팅을 제공하는 서비스 입니다.

## ✨ 배포 링크

-   [lait](https://la-it.online/) <!-- 배포 링크 추가 -->

## 👋 팀 소개 - 🧟‍♂️ 성균관 좀비들

<table>
  <tbody>
    <tr align="center">
      <td align="center"><img src="https://avatars.githubusercontent.com/u/134348257?v=4" width="100px;" alt=""/><br /></td>
      <td align="center"><img src="https://avatars.githubusercontent.com/u/77099657?v=4" width="100px;" alt=""/><br /></td>
      <td align="center"><img src="https://avatars.githubusercontent.com/u/130081021?v=4" width="100px;" alt=""/><br /></td>
      <td align="center"><img src="https://avatars.githubusercontent.com/u/108859974?v=4" width="100px;" alt=""/><br /></td>
    </tr>
    <tr align="center">
  </tr>
  <tr align="center">
  <td width="300"><a href="https://github.com/hyojinkim2028">팀장 : 김효진<br /></a></td>
  <td width="300"><a href="https://github.com/wolfram0407">부팀장 : 김도현</a></td>
  <td width="300"><a href="https://github.com/eunji624">팀원 : 유은지</a></td>
  <td width="300"><a href="https://github.com/choisooyoung-dev">팀원 : 최수영</a></td>
  </tr>
     <tr align="center" height="200">
    <td>
      CI / CD<br>
      서비스 배포 <br>
    </td>
    <td>
    사용자 인증 기능<br>
    카카오톡 소셜 로그인<br>
    에러 처리에 대한 로깅<br>
    <br>
    </td>
    <td>
      실시간 채팅 기능 구현<br>
      채팅 캐싱 처리<br>
    </td>
    <td>
      실시간 라이브 스트리밍<br>
    </td>
  </tr>
  </tbody>
</table>

## ✅ 주요 기능

실시간으로 유저들과 채팅으로 소통하면서 실시간 동영상을 감상하는 서비스

-   사용자들에게 실시간으로 동영상 콘텐츠를 제공하는 서비스로 게임 방송, 온라인 교육, 이벤트 중계, 생활 방송, 음악 방송 등 다양한 콘텐츠를 다루며, 실시간 채팅 기능으로 사용자들끼리 소통하며 콘텐츠에 대한 의견을 공유할 수 있도록 합니다.

1. **스트리머 및 시청자 인터페이스:**

    - 스트리머는 저희 스트리밍 소프트웨어나 플랫폼을 사용하여 자신의 콘텐츠를 실시간으로 전송합니다.
    - 시청자는 이를 간편하게 시청하고, 채팅에 참여할 수 있는 사용자 인터페이스를 이용합니다.

2. **다양한 콘텐츠:**

    - 게임 방송, 라이브 이벤트 중계, 온라인 강의, 라디오 방송, 일상 생활 방송 등 다양한 콘텐츠를 다룹니다.
    - 이는 사용자들에게 다양한 흥미로운 내용을 제공하고자 하는 목적에 따라 다양하게 구성됩니다.

3. **안정성 및 성능:**

    - 안정적인 서버 인프라와 여러 캐싱 전략을 사용하여 대규모의 사용자들에게 안정적이고 끊김 없는 실시간 스트리밍 서비스를 제공합니다.
    - 로드 밸런싱과 스케일링을 통해 부하를 효과적으로 관리합니다.

<br>
<br>

## 🎈 중간 MVP 까지의 서비스 아키텍처(수정중)

<img  src="https://file.notion.so/f/f/83c75a39-3aba-4ba4-a792-7aefe4b07895/d91c0de6-ff9d-4183-9ff5-cb4df126d488/Untitled.png?id=e30cf654-427e-4d95-a1c4-aed9581ff655&table=block&spaceId=83c75a39-3aba-4ba4-a792-7aefe4b07895&expirationTimestamp=1706911200000&signature=DkAn4igKYj70HJtHTqX4zxM_iy76m5ZwjA4LPl4xtLo&downloadName=Untitled.png">

<br>
<br>

## ⚙ 주요 기술 스택

<!-- 프로젝트에 사용된 기술 스택을 나열 -->

### ⚡ Front - end

<div dir="auto">
    <img src="https://img.shields.io/badge/EJS-B4CA65?style=for-the-badge&logo=EJS&logoColor=white">
    <img src="https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=CSS3&logoColor=white">
    <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=JavaScript&logoColor=white">
    <img src="https://img.shields.io/badge/Bootstrap-7952B3?style=for-the-badge&logo=Bootstrap&logoColor=white">
    <img src="https://img.shields.io/badge/Axios-5A29E4?style=for-the-badge&logo=Axios&logoColor=white">
</div>

### ⚡ Back - end

<div dir="auto">
    <img src="https://img.shields.io/badge/nestjs-E0234E?style=for-the-badge&logo=nestjs&logoColor=white">
    <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=Node.js&logoColor=white">
    <img src="https://img.shields.io/badge/socket.io-010101?style=for-the-badge&logo=socketdotio&logoColor=white">
    <img src="https://img.shields.io/badge/nginx-009639?style=for-the-badge&logo=nginx&logoColor=white">
    <img src="https://img.shields.io/badge/nginx_rtmp_module-009639?style=for-the-badge&logo=nginx&logoColor=white">
    <img src="https://img.shields.io/badge/hls protocol-010101?style=for-the-badge&logo=&logoColor=white">
    <img src="https://img.shields.io/badge/Typeorm-262627?style=for-the-badge&logo=typeorm&logoColor=white">
    <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=TypeScript&logoColor=white">
</div>

### ⚡ Database

<div dir="auto">
    <img src="https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=MySQL&logoColor=white">
    <img src="https://img.shields.io/badge/Amazon RDS-527FFF?style=for-the-badge&logo=Amazon RDS&logoColor=white">
    <img src="https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=Redis&logoColor=white">
    <img src="https://img.shields.io/badge/mongodb-47A248?style=for-the-badge&logo=mongodb&logoColor=white">
    <img src="https://img.shields.io/badge/amazons3-569A31?style=for-the-badge&logo=amazons3&logoColor=white">
</div>

### ⚡ DevOps

<div dir="auto">
    <img src="https://img.shields.io/badge/googlecloud-4285F4?style=for-the-badge&logo=googlecloud&logoColor=white">
    <img src="https://img.shields.io/badge/kubernetes-326CE5?style=for-the-badge&logo=kubernetes&logoColor=white">
    <img src="https://img.shields.io/badge/docker-2496ED?style=for-the-badge&logo=docker&logoColor=white">
    <img src="https://img.shields.io/badge/sentry-362D59?style=for-the-badge&logo=sentry&logoColor=white">
</div>

### ⚡ 협업툴

<div dir="auto">
    <img src="https://img.shields.io/badge/Git-F05032?style=for-the-badge&logo=Git&logoColor=white">
    <img src="https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=GitHub&logoColor=white">
    <img src="https://img.shields.io/badge/Slack-4A154B?style=for-the-badge&logo=Slack&logoColor=white">
    <img src="https://img.shields.io/badge/Notion-000000?style=for-the-badge&logo=Notion&logoColor=white">
</div>

<br>
<br>

## 🛢 ERD

<img src="https://file.notion.so/f/f/83c75a39-3aba-4ba4-a792-7aefe4b07895/e7a014d6-96fa-4c7a-879b-f97fd08152b7/Untitled.png?id=ef77d1a1-e03d-4913-af88-a07665e356e1&table=block&spaceId=83c75a39-3aba-4ba4-a792-7aefe4b07895&expirationTimestamp=1706911200000&signature=AkNQo6vpidNtysOPROq7EBrc78vpJj8_xtqVBE_EO-A&downloadName=Untitled.png">
