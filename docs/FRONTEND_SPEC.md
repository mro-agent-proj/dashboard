# AeroMCC 대시보드 화면 명세

## 범위

프런트는 Spring Backend의 `/api/v1`만 호출한다. DB, AI 서버, business-mcp, rag-mcp에는 직접 연결하지 않는다. 전달된 RAG 스키마는 화면 필드와 근거 표시 방식을 정하는 참고자료다.

## 신고자 대시보드

- 상단 지표: 전체 요청, 처리 중, 사람 검토, 접수 완료
- 요청 큐: 요청 ID, 기체번호, 모델, 증상, 상태, 담당 부서
- 요청 상세: 신고 원문, 현재 상태, 처리 시간
- 새 요청 Dialog: 기체번호, 기종, 항공사, 운항단계, 자연어 증상
- 연결 API: `POST /requests`, `GET /requests?mine=true`, `GET /requests/{id}`

## 정비팀 대시보드

- 부서별 배정 큐: `ASSIGNED` 요청만 표시
- 선택 요청 상세: 기체, 증상, ATA, 추천 부서, LLM 1/2/3 진행 상태
- 근거 카드: `Evidence.source`, `ref_id`, `excerpt`, `why`
- 정비팀 액션: 배정 수락, 사유를 포함한 거절
- 연결 API: `GET /assignments?status=PENDING`, `GET /requests/{id}/trace`, `POST /assignments/{id}/accept|reject`

## 어드민 대시보드

- 전체 요청 큐 및 `HUMAN_REVIEW` 강조
- 사람 검토 사유: `AGENT_NEEDS_HUMAN`, `RETRY_LIMIT`, `TEAM_REJECTED`, `VALIDATION_FAILED`, `SYSTEM_ERROR`
- 수동 부서 배정 또는 요청 종결
- 운영 지표: 상태별 건수, 자동 배정률, 평균 처리시간
- RAG 상태: `knowledge_releases.state`, `knowledge_indexes.state`를 Backend가 요약 제공할 경우 표시
- 연결 API: `GET /requests`, `GET /reviews`, `POST /reviews/{id}/resolve`, `GET /stats/summary`

## RAG 스키마와 UI 연결

| DB 자료 | 프런트 표시 |
|---|---|
| `evidence.source_type` | SDR / AMM 근거 유형 Tag |
| `evidence.source_id` | 근거 식별자 |
| `evidence.quote` | 원문 인용 블록 |
| `evidence.locator` | 출처 상세 링크 또는 위치 |
| `sdr_cases.reported_jasc` | JASC 코드 |
| `sdr_cases.model_key` | 적용 기종 |
| `amm_references.cited_amm_ref_normalized` | AMM 참조 번호 |
| `amm_references.applicability_status` | 적용성 미검증 경고 |
| `knowledge_releases.state` | RAG Release 상태 |
| `knowledge_indexes.state` | 검색 인덱스 준비 상태 |

원시 테이블은 프런트에 노출하지 않는다. Backend의 trace DTO가 위 내용을 필요한 범위로 변환한다.
