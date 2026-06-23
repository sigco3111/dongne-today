# Assets (앱 아이콘, 스플래시 이미지)

다른 PC에서 작업 시 다음 파일들을 추가해야 합니다:

- `icon.png` — 512x512 PNG, 앱 아이콘
- `splash.png` — 1242x2436 PNG, 스플래시 이미지 (토스 블루 배경)
- `adaptive-icon.png` — 1024x1024 (Android)

토스 콘솔에서 임시 이미지로 등록 가능. 디자인 가이드는 `docs/DESIGN_SYSTEM.md` 참고.

## 캐릭터 일러스트 (선택)

MBTI 캐릭터별 일러스트가 있으면 좋지만, v0.1.0은 이모지로 대체 가능.

## 임시 생성 방법

```bash
# ImageMagick으로 placeholder 생성 (선택)
convert -size 512x512 xc:'#3182F6' -fill white -gravity center \
  -pointsize 200 -annotate 0 '🏘️' icon.png

convert -size 1242x2436 xc:'#3182F6' -fill white -gravity center \
  -pointsize 400 -annotate 0 '우리 동네 오늘' splash.png
```
