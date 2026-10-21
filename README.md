# AeroMCC Dashboard

Vue 3 + TypeScript + PrimeVue 4 기반 MRO 운영 대시보드입니다.

## 실행

```bash
npm install
cp .env.example .env
npm run dev
```

기본은 목업 화면입니다. Spring Backend 연동 시 `.env`에서 다음과 같이 설정합니다.

```env
VITE_API_BASE_URL=/api/v1
VITE_USE_MOCK_API=false
```

Vite 개발 서버는 `/api` 요청을 `http://localhost:8080`으로 프록시합니다.

## 화면

- `/reporter`: 신고자 요청 등록·상태 조회
- `/maintenance`: 정비팀 배정 큐·근거 조회·수락/거절
- `/admin`: 전체 요청·사람 검토·수동 배정/종결

API 모듈은 `src/services/api.ts`, 목업 데이터는 `src/services/mock.ts`, 화면 명세는 `docs/FRONTEND_SPEC.md`에 있습니다.
