# 📄 개발 인계 가이드 (HANDOVER_GUIDE.md)

집이나 다른 개발 환경에서 이어 작업하실 때 참고하실 수 있도록 핵심 주의사항과 시작 절차를 정리한 인계 문서입니다.

---

## 1. 깃허브 브랜치 정보

* **작업 브랜치**: `feature/japanese-ui`
* **깃허브 저장소**: `https://github.com/ldavit125-spec/itakura.git`

---

## 2. 집에서 시작할 때 명령어 (개발 환경 세팅)

```bash
git fetch origin
git checkout feature/japanese-ui
git pull origin feature/japanese-ui
npm install
npm run dev
```

---

## 3. 핵심 주의사항

* **이임원 이름 유지**: 일본어 모드 전환 시에도 이임원 관리자 이름은 일본어로 번역하지 않고 **한국어 원본 그대로 `이임원`**으로 유지해야 함.
* **날짜 입력 필드 (DateInput)**:
  * `YYYY-MM-DD` 키보드 직접 입력 지원
  * invalid 날짜 입력 시 빨간 테두리 시각적 검증 처리
  * `Enter` 키 입력 또는 Focus `Blur` 시 값 확정(commit)
  * 📅 달력 팝업 선택 연동 규칙 엄수 및 유지
* **출하 KPI 반응형 레이아웃**:
  * 대시보드의 '출하 완료율' 카드는 삭제되었으며, '오늘 출하건수', '오늘 출하수량' 2개로 `sm:grid-cols-2` 반응형 균등 정렬 유지
* **다국어 (i18n)**:
  * 한국어 명칭의 부자연스러운 음역 가타카나 억지 변환 금지
  * `localizedName({ locale, ko, ja })` 헬퍼 함수 및 정규 다국어 리소스 활용
* **작업 완료 후 필수 절차**:
  * 작업 완료 후 `npm run build`로 빌드 및 타입 검사 성공 확인 필수
  * 빌드 성공 확인 후 커밋/푸시 진행
