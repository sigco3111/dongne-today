# ✅ 출품 체크리스트 (CHECKLIST)

> 6월 30일 23:59 (한국 시간) 마감까지 12일 (2026-06-18 기준)

---

## ⏰ 타임라인

| 날짜 | 마일스톤 | 상태 |
|---|---|---|
| 6/8 (월) | 챌린지 시작 | ✅ |
| **6/18 (수)** | **현재 — 문서 작성 완료** | ✅ |
| 6/19-20 (목-금) | 프로젝트 부트스트랩 + 1차 기능 구현 | ⬜ |
| 6/21-22 (토-일) | 6종 데이터 fetch + 차트 구현 | ⬜ |
| 6/23-24 (월-화) | MBTI 캐릭터 엔진 + 공유 기능 | ⬜ |
| 6/25-26 (수-목) | UI 폴리싱 + TDS 디자인 적용 | ⬜ |
| 6/27-28 (금-토) | 통합 테스트 + 버그 수정 | ⬜ |
| 6/29 (일) | 토스 콘솔 검수 제출 + 첫 빌드 등록 | ⬜ |
| **6/30 (월)** | **🎯 출품 마감 23:59** | ⬜ |
| 7/1 (화) | 테마 지면 노출 시작 | ⬜ |
| 7/1-26 | 1차 심사 (AU 측정) | ⬜ |
| 7월 마지막 주 | 최종 심사 + 결과 발표 | ⬜ |

---

## 📦 Phase 1: 부트스트랩 (6/19-20)

### 환경 세팅
- [ ] Node 20+ 설치
- [ ] Yarn 4 활성화 (corepack)
- [ ] 토스 샌드박스 앱 설치
- [ ] 토스 개발자 계정 로그인
- [ ] AX MCP 설치 및 Cursor/Claude 연결
- [ ] `.yarnrc.yml`에 npmAuthToken 입력

### 프로젝트 초기화
- [ ] `npx create-apps-in-toss@latest dongne-today` 또는 기존 저장소 사용
- [ ] `granite.config.ts` 작성 (권한, services 등록)
- [ ] `yarn install` 성공 확인
- [ ] `yarn dev` → 샌드박스에서 빈 화면 확인

### 기초 화면
- [ ] `OnboardingScreen` — 위치 권한 요청 + 동네 자동 인식
- [ ] `HomeScreen` — 2x3 카드 그리드 (스텁)
- [ ] `SettingsScreen` — 친구 동네 추가/수정

---

## 📡 Phase 2: 데이터 fetch (6/21-22)

### API 서비스 함수
- [ ] `services/api/weather.ts` — Open-Meteo Forecast
- [ ] `services/api/airQuality.ts` — Open-Meteo Air Quality
- [ ] `services/api/bikeShare.ts` — 서울 따릉이 (sample 키)
- [ ] `services/api/holidays.ts` — Nager Date
- [ ] `services/api/geocoding.ts` — Nominatim + Open-Meteo

### 통합
- [ ] `services/api/index.ts` — 6종 병렬 fetch (Promise.all)
- [ ] 30분 캐시 (`storage` 활용)
- [ ] 에러 핸들링 (네트워크 끊김 시 캐시 fallback)

### 위치/저장
- [ ] `services/location.ts` — `getCurrentLocation` 래퍼
- [ ] `services/storage.ts` — 토스 storage 키 헬퍼
- [ ] 온보딩에서 위치 1회 → 자동 인식 → 수동 보정 UX

---

## 🎨 Phase 3: 차트 + 캐릭터 (6/23-24)

### MBTI 캐릭터 엔진
- [ ] `utils/characterEngine.ts` — 6종 캐릭터 결정 룰
- [ ] 캐릭터별 한 줄 리포트 메시지 작성
- [ ] 캐릭터 비주얼 (이모지 + 색상)

### 차트 컴포넌트
- [ ] 차트 라이브러리 결정 (`react-native-gifted-charts` 추천)
- [ ] `WeatherCard` — 라인 차트 (24시간 기온)
- [ ] `AirQualityCard` — 게이지 + 캐릭터 표정
- [ ] `BikeShareCard` — 도넛 (가용률)
- [ ] `HolidayCard` — 배지
- [ ] `CompareCard` — 가로 막대 비교

### 공유
- [ ] `react-native-view-shot` 또는 토스 native 캡처
- [ ] 캐릭터 + 대시보드 PNG 스냅샷
- [ ] `share` SDK로 토스 친구에게 전달

---

## 🎯 Phase 4: 디자인 폴리싱 (6/25-26)

### TDS 적용
- [ ] 모든 컴포넌트 TDS 패키지로 변경 (외부 라이브러리 제거)
- [ ] 색상 `adaptive*` 사용 (다크모드 호환)
- [ ] 타이포그래피 `st1` `t1` 등 TDS 표준
- [ ] 버튼/배지/카드 TDS 컴포넌트 활용

### UX 점검
- [ ] 첫 진입 시 로딩 인디케이터 (300ms 이내)
- [ ] 권한 거부 시 fallback (수동 동네 입력)
- [ ] 데이터 fetch 실패 시 캐시 fallback
- [ ] 친구 동네 비교 추가/삭제 UX

### 접근성
- [ ] 모든 인터랙티브 요소 터치 영역 44pt 이상
- [ ] 색상 대비 WCAG AA 이상
- [ ] 스크린 리더 라벨 (TDS 기본 활용)

---

## 🧪 Phase 5: 통합 테스트 (6/27-28)

### 기능 테스트
- [ ] 위치 권한 수락 → 자동 인식
- [ ] 위치 권한 거부 → 수동 입력 fallback
- [ ] 모든 6종 데이터 정상 표시
- [ ] MBTI 캐릭터 6종 모두 한 번씩 등장 확인 (각 시나리오)
- [ ] 친구 동네 추가/수정/삭제
- [ ] 공유 PNG 정상 생성

### 디바이스 테스트
- [ ] iOS 샌드박스 앱
- [ ] Android 샌드박스 앱
- [ ] 네트워크 끊김 시뮬레이션
- [ ] 위치 변경 시뮬레이션

### 성능
- [ ] 첫 paint < 1.5초
- [ ] API 응답 평균 < 500ms (캐시 포함)
- [ ] 번들 크기 < 500KB

---

## 📝 Phase 6: 출품 준비 (6/29)

### 콘솔 설정
- [ ] <https://apps-in-toss.toss.im/> 로그인
- [ ] 새 앱 등록
- [ ] 한국어 앱 이름: "우리 동네 오늘"
- [ ] appName: `dongne-today`
- [ ] 앱 설명 (한글 + 영문)
- [ ] 앱 아이콘 (512x512 PNG)
- [ ] 스크린샷 3~5장 (가로/세로)
- [ ] 카테고리: "라이프스타일" 또는 "도구"

### 신청폼 작성
- [ ] 신청폼 URL: <https://toss.im/_m/JTkiSRsh>
- [ ] 한국어 앱 이름: **정확히 일치**
- [ ] appName: **정확히 일치**
- [ ] 한줄 소개: 명확하고 호기심 자극
- [ ] 챌린지 주제 연관성: **철저히 작성** (심사 기준)

### 빌드 제출
- [ ] `yarn granite build`
- [ ] `dist/` 폴더 ZIP 압축
- [ ] 앱인토스 콘솔에 첫 빌드 등록
- [ ] 검수 제출

---

## 🚨 출품 직전 (6/30)

### 최종 점검
- [ ] 모든 기능 동작 확인
- [ ] 콘솔 검수 통과 (또는 순차 대기 OK)
- [ ] 신청폼 제출 완료
- [ ] 챌린지 주제 연관성 다시 읽어보기

### 백업
- [ ] GitHub 저장소 final commit + push
- [ ] 빌드 산출물 사본 보관
- [ ] 신청폼 스크린샷

---

## 🏆 수상 후 액션

### 상금 수령 준비
- [ ] 개인/법인 정보 확인
- [ ] 세무 처리 방법 확인 (300만원은 종합소득세)
- [ ] 토스 측 입금 계좌 확인

### 앱인토스 런칭
- [ ] 7월 첫째 주 ~ 7월 26일 테마 지면 노출
- [ ] 사용자 피드백 수집
- [ ] v0.2 업데이트 계획

---

## ⚠️ 위험 요소 (Watch List)

| 위험 | 대응 |
|---|---|
| 따릉이 sample 키 quota 소진 | 정식 키 발급 (토스 콘솔 가이드) |
| API 변경/다운 | Open-Meteo는 안정적이나 fallback 룰 준비 |
| 출품 직전 큰 버그 발견 | Phase 4-5에서 충분한 버퍼 |
| 심사 반려 (콘솔 검수) | TDS 사용 + 콘솔 가이드 엄격 준수 |
| 1차 심사 AU 부족 | 공유 UX 강화 + 푸시 알림 (선택적) |

---

## 📞 긴급 연락처

| 상황 | 채널 |
|---|---|
| 토스 SDK 오류 | <https://apps-in-toss.channel.io/workflows/787658> |
| 챌린지 규칙 문의 | 토스 챌린지 채팅 |
| API 데이터 오류 | 해당 API 공식 문서 |

---

**다음 문서**: [`AI_VIBE_CODING.md`](./AI_VIBE_CODING.md) — AI 비브코딩 워크플로
