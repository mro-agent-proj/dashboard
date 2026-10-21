# MRO Agent Dashboard

Vue 3 + TypeScript + PrimeVue 4 기반 MRO 운영 대시보드입니다.

## 실행

```bash
pnpm install
cp .env.example .env
pnpm dev
```

목업 데이터 없이 Spring Backend(`../backend`) API를 그대로 사용합니다. 먼저 백엔드를 띄우세요 (`cd ../backend && docker compose up -d`).

Vite 개발 서버는 `/api`, `/actuator` 요청을 `http://localhost:8080`으로 프록시합니다. 테스트 계정은 `backend/seed/users.csv`를 참고하세요 (비밀번호 공통 `test1234`).

## 화면

- `/reporter`: 신고자 요청 등록·상태 조회
- `/maintenance`: 정비팀 배정 큐·근거 조회·수락/거절
- `/admin`: 전체 요청·사람 검토·수동 배정/종결

API 모듈은 `src/services/api.ts`, 타입은 백엔드 DTO와 맞춘 `src/types/index.ts`, 화면 명세는 `docs/FRONTEND_SPEC.md`에 있습니다.
