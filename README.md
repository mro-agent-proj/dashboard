# 항공기 정비요청 Agent Dashboard

항공 정비 요청을 접수하고, AI가 추천한 담당 정비팀이 배정을 확인하고, 관리자가 사람 검토 건을 처리하는 웹 화면입니다.
Vue 3 · TypeScript · PrimeVue 4로 만들었고, 데이터는 모두 Spring 백엔드 API에서 받습니다(목업 데이터 없음).

## 전체 구성에서의 위치

```
[dashboard] ──HTTP /api──▶ [backend: Spring] ──RabbitMQ──▶ [ai: LLM1·2·3] ──MCP──▶ [agent: business-mcp · rag-mcp]
   이 레포                    인증·요청·배정·DB            분류·조사·검토              업무·근거 조회 (읽기 전용)
```

| 레포 | 역할 |
| --- | --- |
| [dashboard](https://github.com/mro-agent-proj/dashboard) | 이 레포. 신고자·정비팀·관리자 화면 |
| [backend](https://github.com/mro-agent-proj/backend) | 인증, 요청 상태, 배정, DB·데이터, AI 실행 요청 |
| [LLM](https://github.com/mro-agent-proj/LLM) | AI 서버. LLM1 분류 → LLM2 조사 → LLM3 검토 |
| [agent](https://github.com/mro-agent-proj/agent) | MCP 서버. 수리이력·부서·SDR·AMM 근거 조회 |

## 빠르게 실행하기

백엔드가 먼저 떠 있어야 합니다.

```bash
# 1. 백엔드 (다른 터미널, backend 레포)
docker compose up -d --build

# 2. 대시보드
pnpm install
cp .env.example .env
pnpm dev            # http://localhost:5173
```

Vite 개발 서버가 `/api`, `/actuator` 요청을 `http://localhost:8080`(백엔드)으로 넘깁니다. 브라우저 입장에서는 같은 주소라 CORS 설정이 필요 없습니다.

백엔드만 띄우면 앱 안의 가짜 AI(mock)가 요청을 처리합니다. 실제 AI로 보려면 backend의 `AI_MODE=rabbit`과 agent·LLM 레포 서버가 필요합니다(각 레포 README 참고).

## 테스트 계정

비밀번호는 모두 `test1234`입니다. 신고자는 회원가입 화면에서 직접 만들 수도 있습니다.

| 역할 | 계정 | 화면 |
| --- | --- | --- |
| 관리자 | `admin@mro.test` | 운영 콘솔 |
| 정비팀 | `avi@` `cab@` `ele@` `eng@` `fcs@` `hyd@` `str@` `sys@mro.test` | 배정 큐 (부서별) |
| 신고자 | `reporter1@kal.test` `reporter1@aar.test` `reporter1@jna.test` (각 `reporter2`도 있음) | 정비 요청 |

시연용 증상은 backend 레포 `data/eval/scenario/scenarios.md`(S01~S23)에 있습니다. 예: `reporter1@kal.test`로 기체 `HL7713` / 기종 `A321-211`, 증상 "접근 중 플랩을 CONF 1로 내리자 ECAM F/CTL FLAP SYS 1 FAULT가 또 뜸" → 비행 조종팀(FCS) 배정.

## 화면

| 경로 | 대상 | 내용 |
| --- | --- | --- |
| `/login` | 모두 | 로그인. 역할에 맞는 화면으로 이동 |
| `/signup` | 신고자 | 이름·이메일·소속 항공사·비밀번호로 가입하면 바로 로그인 |
| `/reporter` | 신고자 | 기체번호·기종·증상 접수, 내 요청 목록과 처리 단계. 입력이 등록 정보와 다르면 백엔드가 알려주는 값을 한 번에 적용 |
| `/maintenance` | 정비팀 | 우리 부서 배정 대기 목록, AI 판단 요약·근거·처리 이력, 배정 수락·거절 |
| `/admin` | 관리자 | 전체 요청, 사람 검토 필터, 수동 배정·종결, 통계(자동 배정률 등), RAG 데이터 상태 |
| `/admin/staffing` | 관리자 | 인원 현황(참고용). 운영 콘솔의 "인원 현황" 버튼으로 이동. 전체·부서별 출근 인원을 작업가능·작업불가 도넛으로 보여주고, 미출근은 숫자로 따로 표시. 배정에는 쓰이지 않음 |

처리 중인 요청은 3초, 목록은 15초마다 자동으로 갱신합니다.

## 코드 구조

```
src/
├── views/        LoginView, SignupView, ReporterDashboard, MaintenanceDashboard, AdminDashboard, StaffingBoard
├── layouts/      AppShell(상단 바), AuthLayout(로그인·가입)
├── components/   RequestComposer, RequestTable, RequestDetail, RequestHistoryPanel, EvidencePanel, StatusTag, StaffDonut
├── services/
│   ├── api.ts      백엔드 API 호출과 공통 에러 형식({ error: { code, message, details } }) 처리
│   ├── auth.ts     로그인·가입·세션(sessionStorage)
│   ├── labels.ts   상태·검토 사유 한글 라벨, 항공사·부서 이름, 시간 표시(KST)
│   └── trace.ts    AI 단계별 판단 기록(/requests/{id}/trace)을 상세 화면용으로 요약
├── types/        백엔드 응답 DTO와 1:1로 맞춘 타입
└── styles/       app.css(디자인 토큰·레이아웃), theme.ts(PrimeVue 테마)
public/           팀 로고, 파비콘
docs/FRONTEND_SPEC.md   화면 명세
```

**규칙**: API 계약이 다르면 백엔드가 기준입니다. 프론트 타입과 화면을 백엔드 응답에 맞춥니다.

## 디자인

흰 바탕, 얇은 테두리, 파란색 포인트 하나, Pretendard 글꼴, 상단 내비게이션입니다. 색과 간격은 `src/styles/app.css`의 CSS 변수로 관리합니다. 장식용 아이콘은 쓰지 않습니다.

## 명령어

```bash
pnpm dev        # 개발 서버 (5173)
pnpm build      # 타입 검사(vue-tsc) + 빌드
pnpm preview    # 빌드 결과 미리보기
```

`tsconfig.app.json`은 `noEmit`이라 타입 검사가 `src`에 `.js` 파일을 만들지 않습니다(만들어지면 Vite가 그 파일을 import해 화면이 깨집니다).

## 알려진 한계

- 목록은 한 번에 최대 20~100건만 가져오고 페이지 넘김이 없습니다.
- 실시간 알림이 아니라 주기적 조회(폴링)로 갱신합니다.
