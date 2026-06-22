# src/ 디렉토리 (구현 시작 시 채울 것)

다른 PC에서 작업 시 이 구조로 구현 시작:

```
src/
├── App.tsx                          # 루트
├── screens/
│   ├── OnboardingScreen.tsx
│   ├── HomeScreen.tsx
│   └── SettingsScreen.tsx
├── components/
│   ├── cards/
│   │   ├── WeatherCard.tsx
│   │   ├── AirQualityCard.tsx
│   │   ├── PrecipitationCard.tsx
│   │   ├── HolidayCard.tsx
│   │   └── CompareCard.tsx
│   ├── common/
│   │   ├── Dashboard.tsx
│   │   └── CharacterReport.tsx
│   └── modals/
│       └── NeighborhoodPicker.tsx
├── services/
│   ├── api/
│   │   ├── weather.ts
│   │   ├── airQuality.ts
│   │   ├── precipitation.ts
│   │   ├── holidays.ts
│   │   ├── geocoding.ts
│   │   └── index.ts
│   ├── location.ts
│   └── storage.ts
├── utils/
│   ├── characterEngine.ts
│   ├── shareLink.ts
│   └── format.ts
└── types/
    └── index.ts
```

자세한 내용은 `../docs/ARCHITECTURE.md` 참고.
