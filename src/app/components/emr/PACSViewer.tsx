// PACS 뷰어 — 영상검사 (X-ray·CT·MRI·초음파·내시경) 결과 표시 모달.
// 내원이력의 영상검사 행 "결과보기" 클릭 시 오픈.
// 실제 PACS 연동은 추후 — 현재는 placeholder 이미지 + 환자/검사 정보 + 뷰어 컨트롤 stub.

import { useState } from "react";

// 모달리티 분류 — 방사선 영상 vs 장비 연동 이미지 (EKG·DEXA·PFT 등).
// imaging 모티프는 placeholderKind 로 분기됨. 방사선은 darkCanvas, 장비는 lightChart.
type Modality = {
  label: string;
  // dark: 방사선 (어두운 캔버스 + 흰 outline)
  // chart: 장비 연동 이미지 (밝은 배경 + 차트·trace)
  canvasTheme: "dark" | "chart";
  bgClass: string;
};

function getModalityIcon(testName: string): Modality {
  // ── 방사선 영상 (dark canvas) ──
  if (/X-?ray|흉부|복부\s*x/i.test(testName))
    return { label: "X-ray", canvasTheme: "dark", bgClass: "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700" };
  if (/CT/i.test(testName))
    return { label: "CT", canvasTheme: "dark", bgClass: "bg-gradient-to-br from-zinc-900 to-zinc-700" };
  if (/MRI/i.test(testName))
    return { label: "MRI", canvasTheme: "dark", bgClass: "bg-gradient-to-br from-neutral-900 to-neutral-700" };
  if (/초음파|sonography|US/i.test(testName))
    return { label: "US", canvasTheme: "dark", bgClass: "bg-gradient-to-br from-stone-900 to-stone-700" };
  if (/내시경|EGD|colonoscopy/i.test(testName))
    return { label: "Endoscopy", canvasTheme: "dark", bgClass: "bg-gradient-to-br from-gray-900 to-gray-700" };
  // ── 장비 연동 이미지 (light chart canvas) ──
  if (/EKG|ECG|심전도|Holter/i.test(testName))
    return { label: "EKG", canvasTheme: "chart", bgClass: "bg-[var(--bg-base)]" };
  if (/골밀도|DEXA/i.test(testName))
    return { label: "DEXA", canvasTheme: "chart", bgClass: "bg-[var(--bg-base)]" };
  if (/폐기능|PFT/i.test(testName))
    return { label: "PFT", canvasTheme: "chart", bgClass: "bg-[var(--bg-base)]" };
  if (/안저|fundus/i.test(testName))
    return { label: "Fundus", canvasTheme: "dark", bgClass: "bg-gradient-to-br from-orange-950 to-orange-900" };
  if (/청력|audiometry/i.test(testName))
    return { label: "Audio", canvasTheme: "chart", bgClass: "bg-[var(--bg-base)]" };
  return { label: "Image", canvasTheme: "dark", bgClass: "bg-gradient-to-br from-slate-900 to-slate-700" };
}

// ── 모달리티별 placeholder SVG ─────────────────────────────────────────────
// 방사선 영상은 dark canvas + 흰 outline, 장비 이미지는 light + 컬러 trace.

function XRayPlaceholder({ color = "currentColor" }: { color?: string }) {
  return (
    <svg width="320" height="380" viewBox="0 0 320 380" fill="none">
      <ellipse cx="160" cy="200" rx="130" ry="170" stroke={color} strokeWidth="0.8" strokeDasharray="2 4"/>
      <line x1="160" y1="60" x2="160" y2="340" stroke={color} strokeWidth="2" opacity="0.8"/>
      {[80, 110, 140, 170, 200, 230, 260, 290, 320].map(y => (
        <ellipse key={y} cx="160" cy={y} rx="14" ry="6" stroke={color} strokeWidth="1.2" opacity="0.7"/>
      ))}
      <path d="M100 100 Q60 130 55 200 Q60 280 100 320 L155 320 L155 100 Z" stroke={color} strokeWidth="1.4" fill="none"/>
      <path d="M220 100 Q260 130 265 200 Q260 280 220 320 L165 320 L165 100 Z" stroke={color} strokeWidth="1.4" fill="none"/>
      {[130, 160, 190, 220, 250].map((y, i) => (
        <g key={y} opacity={0.5 - i * 0.05}>
          <path d={`M100 ${y} Q70 ${y + 10} 60 ${y + 15}`} stroke={color} strokeWidth="1.2" fill="none"/>
          <path d={`M220 ${y} Q250 ${y + 10} 260 ${y + 15}`} stroke={color} strokeWidth="1.2" fill="none"/>
        </g>
      ))}
      <path d="M140 200 Q120 220 130 250 Q140 280 175 285 Q180 240 175 220 Q170 205 140 200 Z"
        stroke={color} strokeWidth="1.4" fill={color} fillOpacity="0.08"/>
    </svg>
  );
}

// EKG 12-Lead 트레이스 — 12개 lead 의 1초간 파형.
// PQRST 모티프를 path 로 stylize. 실제 DICOM 은 DICOM Waveform IOD.
function EKGPlaceholder() {
  const LEADS = ["I", "II", "III", "aVR", "aVL", "aVF", "V1", "V2", "V3", "V4", "V5", "V6"];
  // 한 lead 당 PQRST 1 cycle SVG path (110px 폭, 40px 높이 기준)
  const trace = "M0 30 L8 30 L10 28 L12 32 L14 30 L18 30 L22 18 L24 5 L26 50 L28 25 L30 30 L34 30 L40 22 L48 32 L60 30 L110 30";
  return (
    <svg width="720" height="500" viewBox="0 0 720 500" fill="none">
      {/* 그리드 (mm graph paper 패턴) */}
      <defs>
        <pattern id="ekgGrid" width="10" height="10" patternUnits="userSpaceOnUse">
          <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#FDD3D3" strokeWidth="0.5"/>
        </pattern>
        <pattern id="ekgGridLarge" width="50" height="50" patternUnits="userSpaceOnUse">
          <path d="M 50 0 L 0 0 0 50" fill="none" stroke="#F8A8A8" strokeWidth="0.8"/>
        </pattern>
      </defs>
      <rect width="720" height="500" fill="url(#ekgGrid)" />
      <rect width="720" height="500" fill="url(#ekgGridLarge)" />
      {/* 4 row × 3 col grid 로 12 leads 배치 */}
      {LEADS.map((lead, i) => {
        const row = Math.floor(i / 3);
        const col = i % 3;
        const x = col * 240 + 10;
        const y = row * 110 + 30;
        return (
          <g key={lead} transform={`translate(${x},${y})`}>
            {/* lead 라벨 */}
            <text x={4} y={8} fontSize={11} fontWeight={700} fill="#222">{lead}</text>
            {/* 트레이스 — 2 cycles (calibration pulse 포함) */}
            <g stroke="#1a1a1a" strokeWidth={1.4} fill="none">
              {/* calibration pulse (10mm = 1mV) */}
              <path d="M0 30 L5 30 L5 5 L10 5 L10 30" />
              {/* PQRST × 2 cycles */}
              <g transform="translate(12, 0)"><path d={trace} /></g>
              <g transform="translate(122, 0)"><path d={trace} /></g>
            </g>
          </g>
        );
      })}
      {/* 하단 정보 */}
      <g transform="translate(10, 480)">
        <text fontSize={10} fontFamily="ui-monospace, monospace" fill="#444">
          Speed: 25 mm/s · Gain: 10 mm/mV · Filter: 0.5–40 Hz · HR 72 bpm · PR 152 ms · QRS 88 ms · QT/QTc 380/410 ms · Axis +52°
        </text>
      </g>
    </svg>
  );
}

// DEXA — T-score / Z-score 막대 차트.
function DEXAPlaceholder() {
  const sites = [
    { name: "L1-L4 Spine", t: -1.4, z: -0.8 },
    { name: "Femur Neck",  t: -2.1, z: -1.2 },
    { name: "Total Hip",   t: -1.8, z: -1.0 },
    { name: "Forearm",     t: -0.9, z: -0.3 },
  ];
  const xFor = (t: number) => 200 + t * 50;  // -2.5 → 75, 0 → 200, +1 → 250
  return (
    <svg width="520" height="320" viewBox="0 0 520 320" fill="none">
      {/* 배경 grid */}
      <rect width="520" height="320" fill="#FAFAFA" />
      {/* T-score 축 (-4 ~ +2) */}
      {[-4, -3, -2, -1, 0, 1, 2].map(t => (
        <g key={t}>
          <line x1={xFor(t)} y1={30} x2={xFor(t)} y2={290} stroke="#E0E0E0" strokeWidth={0.6}/>
          <text x={xFor(t)} y={304} fontSize={9} fill="#666" textAnchor="middle" fontFamily="ui-monospace, monospace">{t}</text>
        </g>
      ))}
      {/* WHO 분류 구역 (osteopenia/osteoporosis) */}
      <rect x={xFor(-2.5)} y={30} width={xFor(-1) - xFor(-2.5)} height={250} fill="#FFE9C7" opacity={0.6}/>
      <rect x={20} y={30} width={xFor(-2.5) - 20} height={250} fill="#FECDCA" opacity={0.6}/>
      <text x={xFor(-1.75)} y={48} fontSize={9} fill="#B45309" textAnchor="middle" fontWeight={700}>Osteopenia</text>
      <text x={(20 + xFor(-2.5)) / 2} y={48} fontSize={9} fill="#B42318" textAnchor="middle" fontWeight={700}>Osteoporosis</text>
      {/* 검사 부위별 T-score bar */}
      {sites.map((s, i) => {
        const y = 90 + i * 50;
        const color = s.t <= -2.5 ? "#B42318" : s.t <= -1 ? "#D97706" : "#16A34A";
        return (
          <g key={s.name}>
            <text x={140} y={y + 4} fontSize={11} fill="#222" textAnchor="end" fontWeight={600}>{s.name}</text>
            <line x1={150} y1={y} x2={xFor(s.t)} y2={y} stroke={color} strokeWidth={6} strokeLinecap="round"/>
            <circle cx={xFor(s.t)} cy={y} r={5} fill={color}/>
            <text x={xFor(s.t) + 12} y={y + 4} fontSize={10} fontWeight={700} fill={color} fontFamily="ui-monospace, monospace">
              T {s.t.toFixed(1)}
            </text>
          </g>
        );
      })}
      {/* Title */}
      <text x={20} y={20} fontSize={11} fontWeight={700} fill="#222">BMD T-score (DEXA)</text>
    </svg>
  );
}

// PFT — FVC / FEV1 spirometry flow-volume curve.
function PFTPlaceholder() {
  return (
    <svg width="520" height="320" viewBox="0 0 520 320" fill="none">
      <rect width="520" height="320" fill="#FAFAFA" />
      {/* axes */}
      <line x1={50} y1={280} x2={490} y2={280} stroke="#222" strokeWidth={1.2}/>
      <line x1={50} y1={280} x2={50} y2={30} stroke="#222" strokeWidth={1.2}/>
      <text x={490} y={300} fontSize={9} fill="#666" textAnchor="end" fontFamily="ui-monospace, monospace">Volume (L)</text>
      <text x={50} y={22} fontSize={9} fill="#666" fontFamily="ui-monospace, monospace">Flow (L/s)</text>
      {/* 정상 예측치 (점선) */}
      <path d="M50 280 Q90 60 160 90 Q260 180 400 270 L490 280" stroke="#94A3B8" strokeWidth={1.5} fill="none" strokeDasharray="4 4"/>
      {/* 측정치 (실선) */}
      <path d="M50 280 Q100 90 170 120 Q270 200 400 275 L460 280" stroke="#0066E3" strokeWidth={2.2} fill="none"/>
      {/* legend */}
      <g transform="translate(330, 50)">
        <line x1={0} y1={5} x2={20} y2={5} stroke="#0066E3" strokeWidth={2.2}/>
        <text x={26} y={9} fontSize={10} fill="#222">Measured</text>
        <line x1={0} y1={22} x2={20} y2={22} stroke="#94A3B8" strokeWidth={1.5} strokeDasharray="4 4"/>
        <text x={26} y={26} fontSize={10} fill="#222">Predicted</text>
      </g>
      {/* parameters */}
      <g transform="translate(60, 50)" fontFamily="ui-monospace, monospace">
        <text fontSize={10} fontWeight={700} fill="#222">FVC: 3.42 L (88% pred)</text>
        <text y={16} fontSize={10} fontWeight={700} fill="#222">FEV1: 2.65 L (82% pred)</text>
        <text y={32} fontSize={10} fontWeight={700} fill="#0066E3">FEV1/FVC: 77% (Normal)</text>
      </g>
    </svg>
  );
}

export function PACSViewer({
  date,
  testName,
  onClose,
}: {
  date: string;       // "YYYY.MM.DD"
  testName: string;
  onClose: () => void;
}) {
  const modalityInfo = getModalityIcon(testName);
  const { label: modality, canvasTheme, bgClass } = modalityInfo;

  // 뷰어 도구 stub state — 실제 동작 없음 (UI placeholder).
  const [zoom, setZoom] = useState(100);
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  // 같은 검사의 다중 시리즈 placeholder.
  //   X-ray: PA + Lateral (2)
  //   Holter: 24시간 분할 (3)
  //   그 외: 1
  const seriesCount = /X-?ray/i.test(testName) ? 2 : /Holter/i.test(testName) ? 3 : 1;

  return (
    <div className="flex flex-col h-full bg-[var(--bg-base)] overflow-hidden rounded-xl">
      {/* 헤더 — LabViewer 와 동일한 light 패턴 */}
      <div className="flex items-center justify-between px-4 h-11 border-b border-[var(--line-default)] flex-shrink-0 bg-white">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className="text-md font-bold text-[var(--text-main)] flex-shrink-0">PACS 뷰어</span>
          <span className="w-px h-3.5 bg-[var(--line-default)] flex-shrink-0" />
          {/* 환자정보 — LabViewer 와 동일 순서 (차트번호 → 이름 → 성별/나이 → 생년월일) */}
          <span className="text-sm font-medium rounded-[3px] border border-[var(--line-default)] text-[var(--text-sub)] tabular-nums px-1.5 py-0 leading-snug flex-shrink-0">
            100236
          </span>
          <span className="text-sm font-bold text-[var(--text-main)] flex-shrink-0">김지영</span>
          <span className="text-xs text-[var(--text-sub)] tabular-nums flex-shrink-0">여/52</span>
          <span className="text-xs text-[var(--text-tertiary)] flex-shrink-0">·</span>
          <span className="text-xs text-[var(--text-sub)] tabular-nums flex-shrink-0">1974.03.12</span>
          <span className="w-px h-3 bg-[var(--line-subtle)] flex-shrink-0 ml-1" />
          {/* 검사 + 일자 */}
          <span className="text-xs text-[var(--text-tertiary)] whitespace-nowrap flex-shrink-0 ml-0.5">
            검사 <span className="text-[var(--text-main)] font-medium">{testName}</span>
          </span>
          <span className="text-xs text-[var(--text-tertiary)] flex-shrink-0">·</span>
          <span className="text-xs text-[var(--text-tertiary)] whitespace-nowrap flex-shrink-0">
            검사일 <span className="text-[var(--text-main)] tabular-nums font-medium">{date}</span>
          </span>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {["저장", "인쇄", "DICOM 다운로드"].map(lbl => (
            <button key={lbl} className="h-7 px-2.5 rounded text-xs text-[var(--text-sub)] border border-[var(--line-default)] bg-white hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)] transition-colors whitespace-nowrap">
              {lbl}
            </button>
          ))}
          <button onClick={onClose}
            className="w-6 h-6 ml-1 flex items-center justify-center text-[var(--text-tertiary)] hover:text-[var(--text-main)] hover:bg-[var(--bg-subtle)] rounded transition-colors"
            aria-label="닫기">
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
              <path d="M3 3L13 13M13 3L3 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
      </div>

      {/* 툴바 — 줌·회전·측정 stub */}
      <div className="flex items-center gap-1 px-3 h-8 border-b border-[var(--line-default)] flex-shrink-0 bg-[var(--bg-subtle)]">
        {/* 줌 */}
        <button
          onClick={() => setZoom(z => Math.max(25, z - 10))}
          title="축소"
          className="h-6 w-6 inline-flex items-center justify-center rounded border border-[var(--line-default)] bg-white text-[var(--text-sub)] hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)]">
          <svg width="11" height="11" viewBox="0 0 16 16" fill="none">
            <path d="M3 8h10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
          </svg>
        </button>
        <span className="text-xs text-[var(--text-sub)] tabular-nums px-1 min-w-[40px] text-center">{zoom}%</span>
        <button
          onClick={() => setZoom(z => Math.min(400, z + 10))}
          title="확대"
          className="h-6 w-6 inline-flex items-center justify-center rounded border border-[var(--line-default)] bg-white text-[var(--text-sub)] hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)]">
          <svg width="11" height="11" viewBox="0 0 16 16" fill="none">
            <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
          </svg>
        </button>
        <div className="w-px h-4 bg-[var(--line-default)] mx-1" />
        {/* 회전 */}
        {["좌회전", "우회전", "반전", "측정", "주석"].map(lbl => (
          <button
            key={lbl}
            title={lbl}
            className="h-6 px-2 text-xs rounded border border-[var(--line-default)] bg-white text-[var(--text-sub)] hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)] whitespace-nowrap">
            {lbl}
          </button>
        ))}
        <div className="flex-1" />
        <span className="text-xs text-[var(--text-tertiary)]">Modality: <span className="font-bold text-[var(--text-sub)]">{modality}</span></span>
      </div>

      {/* 메인 영역 — 좌측 시리즈 사이드바 + 우측 이미지 뷰어 */}
      <div className="flex flex-1 overflow-hidden">
        {/* 시리즈 사이드바 */}
        <div className="w-32 border-r border-[var(--line-default)] bg-[var(--bg-subtle)] overflow-y-auto flex-shrink-0">
          <div className="px-2 py-1.5 text-micro font-medium text-[var(--text-tertiary)] border-b border-[var(--line-subtle)]">
            시리즈 ({seriesCount})
          </div>
          {Array.from({ length: seriesCount }).map((_, i) => {
            const isActive = activeImageIdx === i;
            // 시리즈 라벨 — modality 별 명명 규칙
            const seriesLabel = /X-?ray/i.test(testName)
              ? (i === 0 ? "PA" : "Lateral")
              : /Holter/i.test(testName)
              ? `${i * 8}–${(i + 1) * 8}h`
              : modality === "EKG"
              ? "12-Lead"
              : `Series ${i + 1}`;
            return (
              <button
                key={i}
                onClick={() => setActiveImageIdx(i)}
                className={`w-full p-1.5 flex flex-col items-center gap-1 border-b border-[var(--line-subtle)] transition-colors ${
                  isActive ? "bg-white" : "hover:bg-white/60"
                }`}>
                {/* 썸네일 — canvasTheme 별로 dark frame 또는 light chart 미니어처 */}
                <div className={`w-full aspect-square rounded ${bgClass} flex items-center justify-center relative overflow-hidden border ${
                  isActive ? "ring-2 ring-[var(--brand-primary)] border-transparent" : "border-[var(--line-subtle)]"
                }`}>
                  {canvasTheme === "dark" ? (
                    <svg width="32" height="32" viewBox="0 0 16 16" fill="none" className="text-white/30">
                      <rect x="2" y="2" width="12" height="12" rx="1.5" stroke="currentColor" strokeWidth="0.8"/>
                      <circle cx="8" cy="8" r="2.5" stroke="currentColor" strokeWidth="0.8"/>
                    </svg>
                  ) : modality === "EKG" ? (
                    <svg width="38" height="22" viewBox="0 0 38 22" fill="none">
                      <path d="M1 11 L8 11 L10 9 L12 13 L14 4 L16 18 L18 11 L26 11 L28 7 L30 14 L32 11 L37 11"
                        stroke="#0066E3" strokeWidth="1.3" fill="none" strokeLinejoin="round"/>
                    </svg>
                  ) : modality === "DEXA" ? (
                    <svg width="38" height="22" viewBox="0 0 38 22" fill="none">
                      <line x1="19" y1="4" x2="19" y2="20" stroke="#E0E0E0" strokeWidth="0.6"/>
                      <line x1="6" y1="6" x2="14" y2="6" stroke="#16A34A" strokeWidth="2.5" strokeLinecap="round"/>
                      <line x1="6" y1="11" x2="11" y2="11" stroke="#D97706" strokeWidth="2.5" strokeLinecap="round"/>
                      <line x1="6" y1="16" x2="9" y2="16" stroke="#B42318" strokeWidth="2.5" strokeLinecap="round"/>
                    </svg>
                  ) : modality === "PFT" ? (
                    <svg width="38" height="22" viewBox="0 0 38 22" fill="none">
                      <path d="M2 20 Q8 4 14 7 Q22 15 32 19 L36 20" stroke="#0066E3" strokeWidth="1.5" fill="none"/>
                    </svg>
                  ) : (
                    <svg width="32" height="32" viewBox="0 0 16 16" fill="none" className="text-[var(--text-tertiary)]">
                      <rect x="2" y="2" width="12" height="12" rx="1.5" stroke="currentColor" strokeWidth="0.8"/>
                    </svg>
                  )}
                </div>
                <span className={`text-micro tabular-nums ${isActive ? "font-bold text-[var(--text-main)]" : "text-[var(--text-sub)]"}`}>
                  {seriesLabel}
                </span>
              </button>
            );
          })}
        </div>

        {/* 이미지 뷰어 영역 — modality 에 따라 dark canvas (방사선) 또는 chart canvas (장비). */}
        <div className={`flex-1 flex items-center justify-center relative overflow-hidden ${bgClass}`}>
          {/* 환자정보 오버레이 (좌상단) — 실제 DICOM 의 burned-in info 영역 모방. chart 모드는 어두운 텍스트. */}
          <div className={`absolute top-3 left-3 text-micro tabular-nums leading-tight pointer-events-none select-none ${
            canvasTheme === "dark" ? "text-white/70" : "text-[var(--text-sub)]"
          }`}>
            <div>김지영 · 100236</div>
            <div>F · 52</div>
            <div>{date}</div>
            <div className="mt-1">{testName}</div>
            <div>{modality} · Series {activeImageIdx + 1}</div>
          </div>
          {/* 뷰어 메타 오버레이 (우상단) — modality 별 다른 메타 */}
          <div className={`absolute top-3 right-3 text-micro tabular-nums leading-tight pointer-events-none select-none text-right ${
            canvasTheme === "dark" ? "text-white/70" : "text-[var(--text-sub)]"
          }`}>
            <div>Zoom: {zoom}%</div>
            {modality === "X-ray" || modality === "CT" || modality === "MRI" ? (
              <>
                <div>WW/WL: 350/40</div>
                <div>kVp: 120</div>
              </>
            ) : modality === "EKG" ? (
              <>
                <div>25 mm/s · 10 mm/mV</div>
                <div>HR 72 bpm</div>
              </>
            ) : modality === "DEXA" ? (
              <div>WHO classification</div>
            ) : modality === "PFT" ? (
              <div>Flow-Volume</div>
            ) : null}
          </div>
          {/* placeholder — modality 별 분기 */}
          <div style={{ transform: `scale(${zoom / 100})`, transition: "transform 0.15s" }}
            className={canvasTheme === "dark" ? "text-white/40" : ""}>
            {modality === "EKG" ? <EKGPlaceholder /> :
             modality === "DEXA" ? <DEXAPlaceholder /> :
             modality === "PFT" ? <PFTPlaceholder /> :
             <XRayPlaceholder />}
          </div>
        </div>

        {/* 우측 패널 — 판독 소견 (modality 별로 다른 mock 텍스트) */}
        <div className="w-64 border-l border-[var(--line-default)] bg-white overflow-y-auto flex-shrink-0">
          <div className="px-3 py-2 border-b border-[var(--line-default)] bg-[var(--bg-subtle)]">
            <span className="text-sm font-bold text-[var(--text-main)]">판독 소견</span>
            <div className="text-micro text-[var(--text-tertiary)] mt-0.5">판독의: 박영상 · 판독일 {date}</div>
          </div>
          <div className="px-3 py-2.5 text-xs text-[var(--text-main)] leading-relaxed">
            {modality === "EKG" ? (
              <>
                <p className="font-bold text-[var(--text-main)] mb-1">소견 (Findings)</p>
                <p className="text-[var(--text-sub)] mb-2.5">
                  Normal sinus rhythm. HR 72 bpm. PR interval 152 ms, QRS 88 ms, QT/QTc 380/410 ms. Axis +52°. P·QRS·T 모양 정상. ST 분절·T파 이상 소견 없음.
                </p>
                <p className="font-bold text-[var(--text-main)] mb-1">결론 (Impression)</p>
                <p className="text-[var(--text-sub)]">Normal ECG. 이상 소견 없음.</p>
              </>
            ) : modality === "DEXA" ? (
              <>
                <p className="font-bold text-[var(--text-main)] mb-1">소견 (Findings)</p>
                <p className="text-[var(--text-sub)] mb-2.5">
                  L1-L4 T-score -1.4 (osteopenia 범위). Femur neck T-score -2.1 (osteopenia). Total Hip T-score -1.8. WHO 기준 osteopenia 에 해당.
                </p>
                <p className="font-bold text-[var(--text-main)] mb-1">결론 (Impression)</p>
                <p className="text-[var(--text-sub)]">Osteopenia (femur neck 가장 낮음). 추적 권장.</p>
              </>
            ) : modality === "PFT" ? (
              <>
                <p className="font-bold text-[var(--text-main)] mb-1">소견 (Findings)</p>
                <p className="text-[var(--text-sub)] mb-2.5">
                  FVC 3.42 L (88% predicted). FEV1 2.65 L (82% predicted). FEV1/FVC 77% (정상 ≥ 70%). 폐쇄성·제한성 패턴 없음.
                </p>
                <p className="font-bold text-[var(--text-main)] mb-1">결론 (Impression)</p>
                <p className="text-[var(--text-sub)]">정상 폐기능 소견. 추적 검사 필요 없음.</p>
              </>
            ) : (
              <>
                <p className="font-bold text-[var(--text-main)] mb-1">소견 (Findings)</p>
                <p className="text-[var(--text-sub)] mb-2.5">
                  양쪽 폐야는 깨끗하며 활동성 침윤은 보이지 않음. 심비대 소견 없음. 종격동 음영 정상 범위. 양측 횡격막 윤곽 명확하며 늑골횡격막각 sharp.
                </p>
                <p className="font-bold text-[var(--text-main)] mb-1">결론 (Impression)</p>
                <p className="text-[var(--text-sub)]">No active lung lesion. Normal cardiac silhouette.</p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
