# Prototypes

프로토타입 모음. 각 프로토타입은 최상위 폴더 하나에 자체 완결적으로 들어 있고,
루트의 랜딩 페이지(`index.html`)에서 링크로 연결된다.
`main` 브랜치에 푸시하면 GitHub Pages로 자동 배포된다.

- 랜딩: `https://jungmin-lee-m.github.io/prototypes/`
- EMR 진료실 화면: `https://jungmin-lee-m.github.io/prototypes/emr/`
  (원본 Figma: https://www.figma.com/design/VkTRL7lj9ojXdLH2eFpmoU/EMR-%EC%A7%84%EB%A3%8C%EC%8B%A4-%ED%99%94%EB%A9%B4-%EB%A0%88%EC%9D%B4%EC%95%84%EC%9B%83)

## 실행

```
npm i        # 의존성 설치
npm run dev  # 개발 서버 (랜딩: /, EMR: /emr/)
npm run build
```

## 새 프로토타입 추가하기

1. 최상위에 폴더를 만든다 (예: `labs/`).
2. 그 안에 진입점을 둔다:
   - `labs/index.html` — `<script type="module" src="./main.tsx">` 를 가리키게 한다.
   - `labs/main.tsx` — 앱을 마운트한다.
   - 소스/스타일/에셋도 같은 폴더 안에 둔다.
3. `vite.config.ts` 의 `prototypes` 맵에 한 줄 추가한다:
   ```ts
   const prototypes = {
     emr: 'emr/index.html',
     labs: 'labs/index.html',
   }
   ```
4. 루트 `index.html` 랜딩에 카드(`<a class="card" href="./labs/">…</a>`)를 추가한다.
5. react-router 등 서브경로 기반 라우팅을 쓴다면 basename 을 `import.meta.env.BASE_URL + '<폴더명>'` 으로 설정한다 (EMR 의 `emr/app/routes.tsx` 참고).
