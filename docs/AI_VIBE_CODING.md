# 🤖 AI 비브코딩 워크플로 (AI_VIBE_CODING)

> 토스 앱인토스 챌린지에서 **AX MCP** + **Claude/Cursor**로 효율적으로 개발하기

---

## 🎯 왜 AX MCP인가?

토스 앱인토스 챌린지의 핵심 취지는 **"AI로 미니앱 만들기"**. 토스 측도 이걸 의식해서 **공식 MCP 서버 (AX)** 를 제공해요.

| 일반 코딩 | AI 비브코딩 (AX MCP 활용) |
|---|---|
| 토스 문서 검색 → 페이지 열기 → 코드 확인 | AI 어시스턴트가 문서·예제 검색해서 즉시 답변 |
| React Native 코드 직접 작성 | 자연어로 "날씨 카드 만들어줘" → 코드 생성 |
| SDK 버전별 변경사항 추적 | AI가 자동으로 최신 버전 반영 |

---

## 🛠️ AX MCP 설치

```bash
# Homebrew
brew tap toss/tap
brew install ax

# 또는 npm
npm install -g @apps-in-toss/ax

# 버전 확인
ax --version
```

### Cursor/Claude에 연결

`.cursor/mcp.json` 또는 `claude_desktop_config.json`:
```json
{
  "mcpServers": {
    "apps-in-toss": {
      "command": "ax",
      "args": ["mcp", "start"]
    }
  }
}
```

---

## 🧰 AX가 제공하는 도구

| 도구 | 설명 | 활용 시점 |
|---|---|---|
| `search_docs` | AppsInToss 문서 검색 | SDK 사용법 모를 때 |
| `get_doc` | 검색된 문서 전체 내용 | 코드 예시 받을 때 |
| `search_tds_rn_docs` | TDS React Native 검색 | UI 컴포넌트 만들 때 |
| `get_tds_rn_doc` | TDS RN 문서 전체 | 색상/타이포 확인 |
| `search_tds_web_docs` | TDS Web 검색 | (WebView 미니앱용) |
| `get_tds_web_doc` | TDS Web 문서 전체 | (WebView 미니앱용) |
| `list_examples` | 코드 예제 목록 | 패턴 참고할 때 |
| `get_example` | 특정 예제 코드 | 실제 구현 확인할 때 |

---

## 💬 효과적인 프롬프트 패턴

### 패턴 1: "코드 보여줘"

```
토스 SDK로 위치 1회만 받는 코드 보여줘
```

→ `search_docs` + `get_doc` 자동 호출 → 코드 예시 응답.

### 패턴 2: "최신 정보로"

```
native-modules 2.9.1에서 사용 가능한 SDK 목록 보여줘
```

→ 버전 명시하면 AX가 그 버전 정보 조회.

### 패턴 3: "예제 코드 기반으로"

```
react-native-gifted-charts로 도넛 차트 그리는 코드
apps-in-toss-examples에 관련 예시 있으면 참고해서
```

→ `list_examples` + `get_example` 자동 활용.

### 패턴 4: "검수 안전하게"

```
콘솔 검수 통과하려면 이 코드 어떻게 수정해야 해?
TDS 가이드라인 기준으로
```

→ `search_tds_rn_docs` 자동 활용.

---

## 🎨 비브코딩 워크플로 (4단계)

### 1️⃣ 브레인스토밍 (사용자와 AI)

사용자가 아이디어 단계에서 **옵션 + 추천** 받기:
```
A. 옵션 1 — 단축 설명
B. 옵션 2 — 단축 설명
C. 옵션 3 — 단축 설명

추천: B. 이유...
→ "그대로 진행해" 받으면 2단계로
```

**이 단계가 중요**. AX 도움 안 받음. 사용자의 미니앱 컨셉 정의.

### 2️⃣ Granite 프로젝트 부트스트랩

```bash
# AI 어시스턴트에게
"토스 앱인토스 미니앱 프로젝트를 처음부터 만들어줘.
React Native + Granite 사용.
granite.config.ts에 다음 권한 등록: LOCATION, NOTIFICATION.
다음 services 등록: storage, appLogin, share, getCurrentLocation.
tsx 컴포넌트 구조로 HomeScreen.tsx 만들어줘."
```

→ AI가 `npx create-apps-in-toss` 명령어 안내 + 초기 파일 생성.

### 3️⃣ 기능 구현 (하나씩)

```
"services/api/weather.ts 만들어줘.
Open-Meteo API 호출해서 24시간 기온 데이터 fetch.
TypeScript 타입 정의 포함.
에러 핸들링 포함."
```

→ AI가 `fetch` + 타입 + try-catch 코드 생성. 바로 테스트.

```
"weather.ts 사용해서 WeatherCard 컴포넌트 만들어줘.
react-native-gifted-charts의 LineChart 사용.
24시간 기온 라인 차트 + 현재 기온 큰 글씨 표시.
TDS 색상 사용해서 카드 디자인."
```

→ 차트 + TDS 카드 컴포넌트 한 번에.

### 4️⃣ 통합 + 디버깅

```
"HomeScreen에서 6개 카드 한 번에 로드하는 Promise.all 코드 보여줘.
캐시는 storage에 30분 단위로 저장."
```

→ AI가 데이터 통합 + 캐시 로직 작성.

```
"샌드박스에서 테스트하니까 'TypeError: undefined is not a function' 에러 남.
코드 보고 원인 찾아줘."
```

→ 에러 로그 붙여넣으면 AI가 분석.

---

## 🚨 비브코딩 주의사항

### 1. **"버전 정확히" 명시**
```
❌ "토스 SDK 호출 코드"
✅ "@apps-in-toss/native-modules 2.9.1의 getCurrentLocation 사용"
```

### 2. **"검수 가이드" 동시 요청**
```
"TDS 사용해서 검수 통과 확실하게"
"외부 라이브러리 안 쓰는 순수 토스 패키지만"
```

### 3. **"파일 단위로" 요청**
한 번에 "전체 앱 만들어줘" ❌
"weather.ts만" / "WeatherCard만" ✅ → 검토 가능

### 4. **"코드 + 테스트 같이"**
```
"weather.ts 만들고 fetch 테스트 코드도 같이 줘.
샌드박스에서 어떻게 검증하는지도 알려줘."
```

### 5. **"문서 갱신" 잊지 마**
새 데이터 소스 추가 시 `docs/DATA_SOURCES.md` 업데이트 요청.

---

## 🎯 자주 쓰는 프롬프트 모음

### 프로젝트 시작
```
토스 앱인토스 Granite + React Native 미니앱 프로젝트 시작.
최소 골격 만들어줘 (App.tsx + 빈 HomeScreen).
```

### SDK 사용
```
@apps-in-toss/native-modules 2.9.1에서 getCurrentLocation 한 번 호출하는 코드.
TypeScript 타입 포함.
권한 체크 + 에러 핸들링 포함.
```

### 차트
```
react-native-gifted-charts로 24시간 기온 라인 차트.
TDS 색상 사용 (#3182F6 라인, #E5E8EB 그리드).
```

### TDS 컴포넌트
```
TDS로 "우리 동네는 E형 활동가" 카드 만들어줘.
큰 제목 (typography=t2) + 부제목 (typography=st2).
오른쪽에 ☀️ 이모지.
```

### 캐시
```
storage SDK로 30분 캐시 로직 구현.
캐시 키 'cachedReport', 만료 시 refetch.
```

### 공유
```
현재 화면을 PNG로 캡처해서 토스 share 링크로 공유하는 코드.
react-native-view-shot + @apps-in-toss/framework의 share.
```

### 디버깅
```
"yarn dev" 실행하니 "Unable to resolve module" 에러.
@apps-in-toss/framework이 안 잡힘.
```

---

## 🔄 AI 어시스턴트별 팁

### Cursor (가장 추천)
- MCP 자동 인식
- 코드 컨텍스트 자동 포함
- `@docs/` 로 문서 참조 가능

### Claude Desktop
- MCP 설정 필요
- 컨텍스트 자동 관리
- 긴 작업에 강함

### Codex CLI
- 터미널에서 직접
- 자동 검증에 강함
- 단, MCP 설정 다름

---

## ✅ 비브코딩 세션 체크리스트

매 세션 시작:
- [ ] 이 저장소 위치인지 확인 (AGENTS.md 읽기)
- [ ] `docs/` 4종 빠르게 훑기
- [ ] `docs/CHECKLIST.md`에서 현재 단계 확인
- [ ] `git pull` (다른 PC 작업 후 동기화)

매 세션 종료:
- [ ] 변경 파일 git commit + push
- [ ] `docs/CHECKLIST.md` 진행 상황 업데이트
- [ ] 다음 세션에 할 일 메모

---

## 📞 막혔을 때

1. **AX MCP 도구 먼저** — `search_docs`로 토스 공식 문서 조회
2. **apps-in-toss-examples GitHub repo** — `https://github.com/toss/apps-in-toss-examples` 예제 코드
3. **Granite 문서** — `https://granite.run/`
4. **여전히 막힘 → 사용자에게 질문** (서브에이전트는 ask 불가)

---

**이 문서가 끝났습니다. 이제 다른 PC에서 이 저장소만 clone하면 모든 컨텍스트가 복원됩니다. 화이팅! 🚀**
