# 🛠️ 개발 환경 세팅 (SETUP)

> 다른 PC에서 시작할 때 따라하기

---

## 📋 시스템 요구사항

| 항목 | 버전 | 확인 명령 |
|---|---|---|
| Node.js | 20.x 이상 | `node --version` |
| Yarn (Berry/Corepack) | 4.x | `yarn --version` |
| iOS 개발 (선택) | macOS + Xcode 15+ | `xcodebuild -version` |
| Android 개발 (선택) | Android Studio + SDK 34+ | `adb --version` |
| Git | 2.30+ | `git --version` |

---

## 🚀 5분 빠른 시작

### 1단계: 저장소 클론

```bash
git clone https://github.com/sigco3111/dongne-today.git
cd dongne-today
```

### 2단계: Node 20+ 설치 (필요 시)

```bash
# macOS (Homebrew)
brew install node@20
echo 'export PATH="/opt/homebrew/opt/node@20/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc

# 또는 nvm 사용
nvm install 20
nvm use 20
```

확인:
```bash
node --version  # v20.x.x
```

### 3단계: Yarn 4 활성화

```bash
# Corepack 활성화 (Yarn 4 포함)
corepack enable

# 프로젝트에서 Yarn 4 고정 (package.json에 packageManager 필드 추가됨)
yarn --version  # 4.x.x
```

### 4단계: 의존성 설치

```bash
yarn install
```

> ✅ **2025-10부터 TDS 패키지는 public npm** — npm 토큰 불필요.
> 구버전 가이드의 `npmAuthToken` 설정은 outdated.
> 자세한 내용: <https://tossmini-docs.toss.im/tds-react-native/start/>

#### ⚠️ Yarn 4 + 상위 디렉토리에 package.json이 있는 경우

상위 디렉토리에 `package.json`이 있으면 Yarn 4가 workspace로 인식해서
`yarn install`이 실패할 수 있어요 (`nearest package directory doesn't seem
to be part of the project`). 두 가지 해결책:

**A. 상위 package.json에 workspaces 명시** (가장 흔한 케이스)
```json
// /path/to/parent/package.json
{
  "private": true,
  "workspaces": ["dongne-today"]
}
```

**B. 프로젝트 디렉토리를 격리된 위치로 이동**
(상위 디렉토리 package.json을 건드리고 싶지 않을 때)

**C. Yarn 4는 PnP 비호환 — RN은 node_modules 필요**

`.yarnrc.yml`에 다음 줄 추가:
```yaml
nodeLinker: node-modules
```

### 5단계: 개발 서버 실행

```bash
yarn dev
```

→ QR 코드 또는 URL 출력. 토스 샌드박스 앱으로 스캔.

---

## 📱 토스 샌드박스 앱 설치

### iOS
1. App Store에서 "토스 샌드박스" 검색
2. 설치 후 토스 계정으로 로그인 (개발자 계정)

### Android
1. Google Play에서 "토스 샌드박스" 검색
2. 설치 후 토스 계정으로 로그인

### 개발자 로그인
1. 샌드박스 앱 실행
2. 설정 → 개발자 모드 → 개발자 로그인
3. 토스 개발자 계정 (apps-in-toss.toss.im) 연동

---

## 🤖 AI 비브코딩 도구 (AX MCP)

### 설치

```bash
# Homebrew (macOS/Linux)
brew tap toss/tap
brew install ax

# 또는 npm
npm install -g @apps-in-toss/ax
```

### MCP 서버 시작

```bash
ax mcp start
```

### Cursor/Claude에 연결

**Cursor**: `.cursor/mcp.json` 파일에 추가:
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

**Claude Desktop**: `~/Library/Application Support/Claude/claude_desktop_config.json`:
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

### 활용

AI 어시스턴트(Claude, Cursor 등)에서 자연어로:
```
"토스 SDK로 위치 한 번 받는 코드 보여줘"
"fetchContacts 사용 예시"
"토스 share 링크 만들기"
```

→ AX MCP가 자동으로 공식 문서/예제 검색해서 응답.

---

## 🏗️ 프로젝트 부트스트랩 (처음부터 시작 시)

기존 저장소 없이 처음부터 시작하려면:

```bash
# 1. 토스 공식 템플릿 사용
npx create-apps-in-toss@latest dongne-today

# 2. 또는 apps-in-toss-examples 포크
git clone https://github.com/toss/apps-in-toss-examples.git
cd apps-in-toss-examples
```

### 생성되는 구조
```
dongne-today/
├── granite.config.ts      # Granite 설정
├── app.json               # 앱 메타데이터
├── package.json
├── tsconfig.json
├── .yarnrc.yml           # npmAuthToken 필요
└── src/
    ├── App.tsx
    └── ...
```

### granite.config.ts 예시
```typescript
import { defineConfig } from '@granite-js/react-native';

export default defineConfig({
  appName: 'dongne-today',
  permissions: [
    'LOCATION',        // 위치 (1회)
    'NOTIFICATION',    // 알림 (선택)
  ],
  services: [
    'storage',
    'appLogin',
    'share',
    'getCurrentLocation',
  ],
  build: {
    output: 'dist',
  },
});
```

---

## 🔨 빌드 & 배포

### 로컬 빌드

```bash
yarn granite build
# → dist/ 폴더에 번들 생성
```

### 토스 콘솔 업로드

1. <https://apps-in-toss.toss.im/> 로그인
2. 내 앱 → 새 버전 만들기
3. `dist/` 폴더 ZIP 업로드
4. 검수 제출

### 개발 중 실시간 미리보기

```bash
yarn dev
# QR 코드 → 샌드박스 앱으로 스캔
# 코드 수정 시 자동 hot-reload
```

---

## 🐛 자주 겪는 문제

### Q: `yarn install` 시 "Couldn't find package" 에러
**A**: `npmAuthToken` 확인. 토큰 만료 가능성 → 재발급.

### Q: `yarn dev` 시 "Metro bundler failed to start"
**A**: 
```bash
yarn cache clean
rm -rf node_modules .yarn/cache
yarn install
```

### Q: 토스 샌드박스 앱에서 QR 안 보임
**A**: 개발 서버가 8081 포트에서 동작. 방화벽 확인.

### Q: 위치 권한 거부됨
**A**: 
- granite.config.ts에 `LOCATION` 권한 추가했는지 확인
- 샌드박스 앱 설정 → 권한에서 위치 허용

### Q: CORS 에러 (Open-Meteo 등 외부 API)
**A**: 우리 검증 결과 모든 API CORS OK. 만약 에러 시:
```bash
# API 직접 호출 테스트
curl "https://api.open-meteo.com/v1/forecast?latitude=37.5&longitude=127&current=temperature_2m"
```
응답 정상이면 코드 문제. fetch에 CORS 옵션 명시 확인.

---

## 📚 추가 리소스

| 리소스 | URL |
|---|---|
| 토스 개발자 센터 | <https://developers-apps-in-toss.toss.im/> |
| Granite 문서 | <https://granite.run/> |
| TDS React Native | <https://tossmini-docs.toss.im/tds-react-native> |
| AppsInToss 예제 | <https://github.com/toss/apps-in-toss-examples> |
| AX MCP GitHub | <https://github.com/toss/apps-in-toss-ax> |
| 챌린지 안내 | <https://toss.im/apps-in-toss/blog/2606_vibecoding_challenge> |

---

## 🆘 도움 요청

- **토스 공식 문의**: <https://apps-in-toss.channel.io/workflows/787658> (평일 10:00-17:00)
- **GitHub Issues**: <https://github.com/sigco3111/dongne-today/issues>

---

**다음 문서**: [`CHECKLIST.md`](./CHECKLIST.md) — 챌린지 출품 체크리스트
