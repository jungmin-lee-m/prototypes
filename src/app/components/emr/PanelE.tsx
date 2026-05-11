// Panel E: 묶음처방 + 공유메모

import { useState } from "react";
import { createPortal } from "react-dom";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { SharedMemoCard } from "./PanelB";

// ── 대분류 + 중분류 (2-depth taxonomy) ────────────────────────────
type MainCategory = { label: string; count: number; subs: { label: string; count: number }[] };

const MAIN_CATEGORIES: MainCategory[] = [
  { label: "★ 즐겨찾기", count: 3, subs: [{ label: "전체", count: 3 }] },
  { label: "약품",       count: 24, subs: [
    { label: "전체", count: 24 }, { label: "호흡기", count: 6 }, { label: "소화기", count: 5 },
    { label: "항생제", count: 4 }, { label: "진통제", count: 5 }, { label: "만성질환", count: 4 },
  ]},
  { label: "주사",       count: 12, subs: [
    { label: "전체", count: 12 }, { label: "영양", count: 4 }, { label: "면역", count: 3 },
    { label: "진통", count: 3 }, { label: "항생제", count: 2 },
  ]},
  { label: "검사",       count: 18, subs: [
    { label: "전체", count: 18 }, { label: "혈액", count: 7 }, { label: "영상", count: 4 },
    { label: "심전도", count: 3 }, { label: "초음파", count: 4 },
  ]},
  { label: "시술",       count: 9, subs: [
    { label: "전체", count: 9 }, { label: "물리치료", count: 3 }, { label: "침구", count: 2 },
    { label: "부항", count: 2 }, { label: "도수치료", count: 2 },
  ]},
  { label: "기능의학",   count: 12, subs: [
    { label: "전체", count: 12 }, { label: "영양수액", count: 5 }, { label: "디톡스", count: 3 },
    { label: "면역", count: 2 }, { label: "호르몬", count: 2 },
  ]},
  { label: "처방세트",   count: 8, subs: [
    { label: "전체", count: 8 }, { label: "감기", count: 3 }, { label: "만성질환", count: 3 }, { label: "알러지", count: 2 },
  ]},
];

type SetItem = {
  id: number;
  name: string;
  count: number;
  price: number;
  starred: boolean;
  items?: { name: string; price: number }[];
};

const setItems: SetItem[] = [
  {
    id: 1,
    name: "기능의학 기본세트 1",
    count: 5,
    price: 35000,
    starred: true,
    items: [
      { name: "푸르설타민주(마늘주사)", price: 15000 },
      { name: "비타민C 주사", price: 12000 },
      { name: "물리치료", price: 3600 },
      { name: "침", price: 2000 },
      { name: "부항", price: 2400 },
    ],
  },
  { id: 2, name: "기능의학 면역세트",       count: 4, price: 48000, starred: false },
  { id: 3, name: "뇌기능 검사 1세트",       count: 3, price: 31000, starred: true  },
  { id: 4, name: "급성 기타감기 1세트",     count: 4, price: 12500, starred: false },
  { id: 5, name: "완성활골 원A",            count: 2, price: 18000, starred: false },
  { id: 6, name: "IV FORM3-1 영양수사",     count: 3, price: 35000, starred: true  },
  { id: 7, name: "트릭기 감기 1세트",       count: 5, price: 22000, starred: false },
  { id: 8, name: "급성 기타감기 1세트 B",   count: 3, price: 15000, starred: false },
  { id: 9, name: "한성활혈 원B",            count: 2, price: 9500,  starred: false },
];

// ── 신규 묶음 등록 모달용 mock 데이터 ────────────────────────────────
// 실제 시스템에서는 현재 차트의 진단·처방을 그대로 가져와 prefill
type ModalDx = { code: string; name: string; dept: string; active?: boolean };
type ModalRx = {
  userCode: string; name: string;
  dose: string; per: string; days: string; usage: string;
  spec: string; claim: "청" | "비"; payment: string;
  sample: string; price: string; unit: string;
  billCode: string; exception: boolean; inHouse: boolean; powder: boolean;
};

const SAMPLE_DX: ModalDx[] = [
  { code: "L708", name: "기타 여드름",      dept: "피부과", active: true },
  { code: "L709", name: "상세불명의 여드름", dept: "피부과" },
];

const SAMPLE_RX: ModalRx[] = [
  { userCode: "doxy",    name: "영풍독시사이클린정100mg",   dose: "1", per: "1", days: "1", usage: "#1", spec: "", claim: "청", payment: "보험가", sample: "", price: "0원", unit: "", billCode: "661901…", exception: false, inHouse: false, powder: false },
  { userCode: "mino",    name: "미노씬캡슐50mg",           dose: "2", per: "2", days: "1", usage: "#2", spec: "", claim: "청", payment: "보험가", sample: "", price: "0원", unit: "", billCode: "644700…", exception: false, inHouse: false, powder: false },
  { userCode: "itt",     name: "이소티논연질캡슐10mg",      dose: "1", per: "1", days: "1", usage: "#1", spec: "", claim: "청", payment: "보험가", sample: "", price: "0원", unit: "", billCode: "643502…", exception: false, inHouse: false, powder: false },
  { userCode: "cleocin", name: "크레오신티외용액1%(외용)",  dose: "1", per: "1", days: "1", usage: "",   spec: "", claim: "비", payment: "일반가", sample: "", price: "0원", unit: "", billCode: "652103…", exception: false, inHouse: false, powder: false },
  { userCode: "stieva1", name: "스티바에이크림0.01%(외용)", dose: "1", per: "1", days: "1", usage: "",   spec: "", claim: "비", payment: "일반가", sample: "", price: "0원", unit: "", billCode: "650002…", exception: false, inHouse: false, powder: false },
  { userCode: "stieva2", name: "스티바에이크림0.025%(외용)",dose: "1", per: "1", days: "1", usage: "",   spec: "", claim: "비", payment: "일반가", sample: "", price: "0원", unit: "", billCode: "650002…", exception: false, inHouse: false, powder: false },
];

// 토글 스위치 — 즐겨찾기 / 사용여부에 사용
function ToggleSwitch({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`relative w-9 h-5 rounded-full transition-colors flex-shrink-0 ${
        checked ? "bg-[var(--brand-primary)]" : "bg-[var(--text-disabled)]"
      }`}
    >
      <span
        className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
          checked ? "translate-x-[18px]" : "translate-x-0.5"
        }`}
      />
    </button>
  );
}

// 표 헤더 셀 — 컴팩트하게 11px 굵은 글씨
function ThCell({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <th className={`text-[11px] font-bold text-[var(--text-sub)] text-left px-1.5 py-1.5 whitespace-nowrap ${className}`}>
      {children}
    </th>
  );
}

function NewSetModal({ onClose, onSave }: { onClose: () => void; onSave: () => void }) {
  // 기본 정보
  const [mainCat, setMainCat] = useState("선택안함");
  const [subCat, setSubCat] = useState("선택안함");
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [priceMode, setPriceMode] = useState("단가합산");
  const [favorite, setFavorite] = useState(false);
  const [active, setActive] = useState(true);
  const [unbundle, setUnbundle] = useState(false);
  const [verbal, setVerbal] = useState(false);
  const [noBilling, setNoBilling] = useState(false);

  // 상병 / 처방 — 차트에서 prefill (prototype: 편집 미지원, 표시만)
  const [dxList] = useState<ModalDx[]>(SAMPLE_DX);
  const [rxList] = useState<ModalRx[]>(SAMPLE_RX);
  const [activeDx, setActiveDx] = useState<string | null>("L708");

  // 텍스트 영역
  const [symptom, setSymptom] = useState("");
  const [mx999, setMx999] = useState("");

  const canSave = code.trim().length > 0 && name.trim().length > 0;

  const subCategoriesForMain =
    MAIN_CATEGORIES.find(c => c.label === mainCat)?.subs ?? [];

  return createPortal(
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/40"
      onMouseDown={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-2xl flex flex-col overflow-hidden"
        style={{ width: "min(1280px, 96vw)", maxHeight: "92vh" }}
        onMouseDown={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 h-12 border-b border-[var(--line-default)] flex-shrink-0">
          <span className="text-[15px] font-bold text-[var(--text-main)]">신규 묶음 등록</span>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center text-[var(--text-tertiary)] hover:text-[var(--text-main)]" aria-label="닫기">
            <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
              <path d="M3 3L13 13M13 3L3 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Body — scrollable */}
        <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-4 min-h-0">
          {/* Section 1: 묶음 신규 추가 ─────────────────────────── */}
          <section className="border border-[var(--line-default)] rounded-md">
            <div className="flex items-center justify-between px-3 h-9 border-b border-[var(--line-default)] bg-[var(--bg-subtle)]">
              <span className="text-[12px] font-bold text-[var(--text-main)]">묶음 신규 추가</span>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-1.5 text-[11px] text-[var(--text-sub)]">
                  즐겨찾기
                  <ToggleSwitch checked={favorite} onChange={setFavorite} />
                </label>
                <label className="flex items-center gap-1.5 text-[11px] text-[var(--text-sub)]">
                  사용여부
                  <ToggleSwitch checked={active} onChange={setActive} />
                </label>
              </div>
            </div>
            <div className="grid gap-3 px-3 py-3" style={{ gridTemplateColumns: "200px 1fr 1fr 160px 1.4fr" }}>
              {/* 카테고리 */}
              <div className="flex flex-col gap-1">
                <span className="text-[11px] font-medium text-[var(--text-sub)]">카테고리</span>
                <div className="flex items-center gap-1">
                  <select
                    value={mainCat}
                    onChange={e => { setMainCat(e.target.value); setSubCat("선택안함"); }}
                    className="flex-1 h-8 px-1.5 text-[11px] border border-[var(--line-default)] rounded-md bg-white outline-none focus:border-[var(--brand-primary)]"
                  >
                    <option value="선택안함">선택안함</option>
                    {MAIN_CATEGORIES.map(c => <option key={c.label} value={c.label}>{c.label.replace("★ ", "")}</option>)}
                  </select>
                  <select
                    value={subCat}
                    onChange={e => setSubCat(e.target.value)}
                    disabled={mainCat === "선택안함"}
                    className="flex-1 h-8 px-1.5 text-[11px] border border-[var(--line-default)] rounded-md bg-white outline-none focus:border-[var(--brand-primary)] disabled:bg-[var(--bg-subtle)] disabled:text-[var(--text-tertiary)]"
                  >
                    <option value="선택안함">선택안함</option>
                    {subCategoriesForMain.map(s => <option key={s.label} value={s.label}>{s.label}</option>)}
                  </select>
                </div>
              </div>
              {/* 묶음코드 */}
              <div className="flex flex-col gap-1">
                <span className="text-[11px] font-medium text-[var(--text-sub)]">
                  묶음코드 <span className="text-[var(--red-500)]">*</span>
                </span>
                <input
                  value={code}
                  onChange={e => setCode(e.target.value)}
                  className="h-8 px-2 text-[11px] border border-[var(--line-default)] rounded-md outline-none focus:border-[var(--brand-primary)]"
                />
              </div>
              {/* 묶음명칭 */}
              <div className="flex flex-col gap-1">
                <span className="text-[11px] font-medium text-[var(--text-sub)]">
                  묶음명칭 <span className="text-[var(--red-500)]">*</span>
                </span>
                <input
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="h-8 px-2 text-[11px] border border-[var(--line-default)] rounded-md outline-none focus:border-[var(--brand-primary)]"
                />
              </div>
              {/* 묶음가 */}
              <div className="flex flex-col gap-1">
                <span className="text-[11px] font-medium text-[var(--text-sub)]">
                  묶음가 <span className="text-[var(--red-500)]">*</span>
                </span>
                <select
                  value={priceMode}
                  onChange={e => setPriceMode(e.target.value)}
                  className="h-8 px-1.5 text-[11px] border border-[var(--line-default)] rounded-md bg-white outline-none focus:border-[var(--brand-primary)]"
                >
                  <option>단가합산</option>
                  <option>고정가</option>
                  <option>할인가</option>
                </select>
              </div>
              {/* 기타 */}
              <div className="flex flex-col gap-1">
                <span className="text-[11px] font-medium text-[var(--text-sub)]">기타</span>
                <div className="flex items-center gap-3 h-8">
                  <label className="flex items-center gap-1 text-[11px] text-[var(--text-main)] cursor-pointer">
                    <input type="checkbox" checked={unbundle} onChange={e => setUnbundle(e.target.checked)} className="accent-[var(--brand-primary)]" />
                    묶음풀어서처방
                  </label>
                  <label className="flex items-center gap-1 text-[11px] text-[var(--text-main)] cursor-pointer">
                    <input type="checkbox" checked={verbal} onChange={e => setVerbal(e.target.checked)} className="accent-[var(--brand-primary)]" />
                    구두처방 가능
                  </label>
                  <label className="flex items-center gap-1 text-[11px] text-[var(--text-main)] cursor-pointer">
                    <input type="checkbox" checked={noBilling} onChange={e => setNoBilling(e.target.checked)} className="accent-[var(--brand-primary)]" />
                    내원일 비청구
                  </label>
                </div>
              </div>
            </div>
          </section>

          {/* Section 2: 상병 ─────────────────────────────────── */}
          <section className="border border-[var(--line-default)] rounded-md overflow-hidden">
            <table className="w-full border-collapse">
              <thead className="bg-[var(--bg-subtle)] border-b border-[var(--line-default)]">
                <tr>
                  <ThCell className="w-7 text-center">≡</ThCell>
                  <ThCell className="w-20">상병코드</ThCell>
                  <ThCell>명칭</ThCell>
                  <ThCell className="w-12 text-center">의증</ThCell>
                  <ThCell className="w-12 text-center">배제</ThCell>
                  <ThCell className="w-10 text-center">좌</ThCell>
                  <ThCell className="w-10 text-center">우</ThCell>
                  <ThCell className="w-20">진료과</ThCell>
                  <ThCell className="w-20">특정기호</ThCell>
                  <ThCell className="w-20">상해외인</ThCell>
                  <ThCell className="w-12 text-center">수술</ThCell>
                  <ThCell>영문명</ThCell>
                </tr>
              </thead>
              <tbody>
                {dxList.map(d => {
                  const isActive = activeDx === d.code;
                  return (
                    <tr
                      key={d.code}
                      onClick={() => setActiveDx(d.code)}
                      className={`border-b border-[var(--line-subtle)] cursor-pointer ${
                        isActive ? "bg-[var(--orange-50,#FFF7ED)]" : "hover:bg-[var(--bg-subtle)]"
                      }`}
                    >
                      <td className="px-1.5 py-1 text-center">
                        <span className={`text-[12px] ${isActive ? "text-[var(--orange-500)]" : "text-[var(--text-tertiary)]"}`}>⊕</span>
                      </td>
                      <td className="px-1.5 py-1 text-[11px] font-mono text-[var(--text-main)]">{d.code}</td>
                      <td className="px-1.5 py-1 text-[11px] text-[var(--text-main)]">{d.name}</td>
                      <td className="px-1.5 py-1 text-center"><input type="checkbox" className="accent-[var(--brand-primary)]" /></td>
                      <td className="px-1.5 py-1 text-center"><input type="checkbox" className="accent-[var(--brand-primary)]" /></td>
                      <td className="px-1.5 py-1 text-center"><input type="checkbox" className="accent-[var(--brand-primary)]" /></td>
                      <td className="px-1.5 py-1 text-center"><input type="checkbox" className="accent-[var(--brand-primary)]" /></td>
                      <td className="px-1.5 py-1 text-[11px] text-[var(--text-main)]">
                        <select defaultValue={d.dept} className="h-6 px-1 text-[11px] border border-[var(--line-default)] rounded bg-white outline-none w-full">
                          <option>피부과</option><option>내과</option><option>가정의학과</option>
                        </select>
                      </td>
                      <td className="px-1.5 py-1 text-[11px] text-[var(--text-tertiary)]">—</td>
                      <td className="px-1.5 py-1 text-[11px] text-[var(--text-tertiary)]">—</td>
                      <td className="px-1.5 py-1 text-center"><input type="checkbox" className="accent-[var(--brand-primary)]" /></td>
                      <td className="px-1.5 py-1 text-[11px] text-[var(--text-tertiary)]">—</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {/* 상병 검색 — 행 추가 입력 */}
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[var(--bg-base)] border-t border-[var(--line-default)]">
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none" className="flex-shrink-0">
                <circle cx="6.5" cy="6.5" r="4.5" stroke="var(--text-tertiary)" strokeWidth="1.4"/>
                <path d="M10 10L13.5 13.5" stroke="var(--text-tertiary)" strokeWidth="1.4" strokeLinecap="round"/>
              </svg>
              <input
                placeholder="상병 검색"
                className="flex-1 h-6 text-[11px] outline-none bg-transparent placeholder:text-[var(--text-tertiary)]"
              />
            </div>
          </section>

          {/* Section 3: 처방 ─────────────────────────────────── */}
          <section className="border border-[var(--line-default)] rounded-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse" style={{ minWidth: "1100px" }}>
                <thead className="bg-[var(--bg-subtle)] border-b border-[var(--line-default)]">
                  <tr>
                    <ThCell className="w-7 text-center">≡</ThCell>
                    <ThCell className="w-20">사용자코드</ThCell>
                    <ThCell>명칭</ThCell>
                    <ThCell className="w-12 text-center">용량</ThCell>
                    <ThCell className="w-12 text-center">일투</ThCell>
                    <ThCell className="w-12 text-center">일수</ThCell>
                    <ThCell className="w-12 text-center">용법</ThCell>
                    <ThCell className="w-16">특정내역</ThCell>
                    <ThCell className="w-10 text-center">청구</ThCell>
                    <ThCell className="w-16">수납방법</ThCell>
                    <ThCell className="w-12">검체</ThCell>
                    <ThCell className="w-14">단가</ThCell>
                    <ThCell className="w-12">단위</ThCell>
                    <ThCell className="w-20">청구코드</ThCell>
                    <ThCell className="w-10 text-center">예외</ThCell>
                    <ThCell className="w-10 text-center">원내</ThCell>
                    <ThCell className="w-10 text-center">가루</ThCell>
                  </tr>
                </thead>
                <tbody>
                  {rxList.map(r => (
                    <tr key={r.userCode} className="border-b border-[var(--line-subtle)] hover:bg-[var(--bg-subtle)]">
                      <td className="px-1.5 py-1 text-center">
                        <svg width="11" height="11" viewBox="0 0 16 16" fill="none" className="inline-block text-[var(--text-tertiary)]">
                          <path d="M5 4l4 4-4 4M12 3v10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                        </svg>
                      </td>
                      <td className="px-1.5 py-1 text-[11px] font-mono text-[var(--text-main)]">{r.userCode}</td>
                      <td className="px-1.5 py-1 text-[11px] text-[var(--text-main)]">{r.name}</td>
                      <td className="px-1.5 py-1 text-[11px] text-center tabular-nums">{r.dose}</td>
                      <td className="px-1.5 py-1 text-[11px] text-center tabular-nums">{r.per}</td>
                      <td className="px-1.5 py-1 text-[11px] text-center tabular-nums">{r.days}</td>
                      <td className="px-1.5 py-1 text-[11px] text-center tabular-nums">{r.usage}</td>
                      <td className="px-1.5 py-1 text-[11px] text-[var(--text-tertiary)]">{r.spec || "—"}</td>
                      <td className="px-1.5 py-1 text-center">
                        <span className={`inline-flex items-center justify-center w-5 h-5 rounded text-[10px] font-bold text-white ${
                          r.claim === "청" ? "bg-[var(--orange-500)]" : "bg-[var(--text-tertiary)]"
                        }`}>{r.claim}</span>
                      </td>
                      <td className="px-1.5 py-1 text-center">
                        <span className={`inline-flex items-center justify-center px-1.5 h-5 rounded text-[10px] font-medium ${
                          r.payment === "보험가" ? "bg-[var(--orange-50,#FFF7ED)] text-[var(--orange-500)]" : "bg-[var(--bg-subtle)] text-[var(--text-sub)]"
                        }`}>{r.payment}</span>
                      </td>
                      <td className="px-1.5 py-1 text-[11px] text-[var(--text-tertiary)]">{r.sample || "—"}</td>
                      <td className="px-1.5 py-1 text-[11px] tabular-nums text-[var(--text-main)]">{r.price}</td>
                      <td className="px-1.5 py-1 text-[11px] text-[var(--text-tertiary)]">{r.unit || "—"}</td>
                      <td className="px-1.5 py-1 text-[11px] font-mono text-[var(--text-tertiary)]">{r.billCode}</td>
                      <td className="px-1.5 py-1 text-center"><input type="checkbox" defaultChecked={r.exception} className="accent-[var(--brand-primary)]" /></td>
                      <td className="px-1.5 py-1 text-center"><input type="checkbox" defaultChecked={r.inHouse} className="accent-[var(--brand-primary)]" /></td>
                      <td className="px-1.5 py-1 text-center"><input type="checkbox" defaultChecked={r.powder} className="accent-[var(--brand-primary)]" /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* 처방 검색 */}
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[var(--bg-base)] border-t border-[var(--line-default)]">
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none" className="flex-shrink-0">
                <circle cx="6.5" cy="6.5" r="4.5" stroke="var(--text-tertiary)" strokeWidth="1.4"/>
                <path d="M10 10L13.5 13.5" stroke="var(--text-tertiary)" strokeWidth="1.4" strokeLinecap="round"/>
              </svg>
              <input
                placeholder="처방 검색"
                className="flex-1 h-6 text-[11px] outline-none bg-transparent placeholder:text-[var(--text-tertiary)]"
              />
            </div>
          </section>

          {/* Section 4: 증상 / 특정내역 ───────────────────────── */}
          <section className="grid gap-4" style={{ gridTemplateColumns: "1fr 1fr" }}>
            {/* 증상 */}
            <div className="border border-[var(--line-default)] rounded-md flex flex-col">
              <div className="flex items-center justify-between px-3 h-8 border-b border-[var(--line-default)] bg-[var(--bg-subtle)]">
                <span className="text-[11px] font-bold text-[var(--text-main)]">증상</span>
              </div>
              <textarea
                value={symptom}
                onChange={e => setSymptom(e.target.value)}
                rows={4}
                placeholder="('/' 입력하여 상용구 검색)"
                className="px-3 py-2 text-[11px] text-[var(--text-main)] leading-[17px] resize-none outline-none placeholder:text-[var(--text-tertiary)] bg-transparent"
              />
              <div className="flex items-center gap-1 px-2 py-1.5 border-t border-[var(--line-default)] bg-[var(--bg-base)]">
                {["1st", "2nd", "abd"].map(t => (
                  <button key={t} className="text-[10px] px-2 py-0.5 rounded border border-[var(--line-default)] bg-white text-[var(--text-sub)] hover:bg-[var(--bg-primary-subtle)] hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)]">
                    {t}
                  </button>
                ))}
              </div>
            </div>
            {/* 특정내역(MX999) */}
            <div className="border border-[var(--line-default)] rounded-md flex flex-col">
              <div className="flex items-center justify-between px-3 h-8 border-b border-[var(--line-default)] bg-[var(--bg-subtle)]">
                <span className="text-[11px] font-bold text-[var(--text-main)]">특정내역(MX999)</span>
                <span className="text-[10px] text-[var(--text-tertiary)] tabular-nums">{new Blob([mx999]).size}/700 bytes</span>
              </div>
              <textarea
                value={mx999}
                onChange={e => setMx999(e.target.value)}
                rows={4}
                placeholder="특정내역(MX999)을 입력해주세요."
                className="px-3 py-2 text-[11px] text-[var(--text-main)] leading-[17px] resize-none outline-none placeholder:text-[var(--text-tertiary)] bg-transparent"
              />
              <div className="flex items-center gap-1 px-2 py-1.5 border-t border-[var(--line-default)] bg-[var(--bg-base)]">
                {["1st", "2nd", "abd"].map(t => (
                  <button key={t} className="text-[10px] px-2 py-0.5 rounded border border-[var(--line-default)] bg-white text-[var(--text-sub)] hover:bg-[var(--bg-primary-subtle)] hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)]">
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-5 h-13 py-3 border-t border-[var(--line-default)] flex-shrink-0 bg-white">
          <button onClick={onClose} className="h-9 px-4 text-[12px] font-medium rounded-md border border-[var(--line-default)] bg-white text-[var(--text-main)] hover:bg-[var(--bg-subtle)]">
            취소
          </button>
          <button
            onClick={() => { if (canSave) onSave(); }}
            disabled={!canSave}
            className={`h-9 px-5 text-[12px] font-bold rounded-md text-white transition-colors ${
              canSave ? "bg-[var(--text-main)] hover:opacity-90" : "bg-[var(--text-disabled)] cursor-not-allowed"
            }`}
          >
            저장
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

export function PanelE() {
  const [expandedSet, setExpandedSet] = useState<number | null>(null);
  const [activeMain, setActiveMain] = useState("기능의학");
  const [activeSub, setActiveSub] = useState("전체");
  // 신규 묶음 등록 모달 — 현재 차트 내용으로 prefill 되어 열림
  const [newSetOpen, setNewSetOpen] = useState(false);

  const currentMain = MAIN_CATEGORIES.find(c => c.label === activeMain) ?? MAIN_CATEGORIES[5];
  const currentSubInfo = currentMain.subs.find(s => s.label === activeSub) ?? currentMain.subs[0];

  return (
    <PanelGroup direction="vertical" className="w-full h-full">
      {/* 묶음처방 (상단) */}
      <Panel defaultSize={70} minSize={30}>
      <div className="bg-white rounded-md shadow-[0_1px_3px_rgba(0,0,0,0.06)] flex flex-col h-full overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-1.5 px-2.5 py-1.5 border-b border-[var(--line-default)] flex-shrink-0">
          <span className="text-[12px] font-bold text-[var(--text-main)]">묶음처방</span>
          <div className="flex items-center gap-1 bg-[var(--bg-subtle)] border border-[var(--line-default)] rounded-[6px] px-2 h-7 flex-1">
            <div className="w-3 h-3 bg-[var(--text-tertiary)] rounded-sm flex-shrink-0" />
            <span className="text-[10px] text-[var(--text-tertiary)]">묶음 검색</span>
          </div>
          <button className="w-6 h-6 border border-[var(--line-default)] rounded-[4px] flex items-center justify-center text-[11px] text-[var(--text-sub)]">⚙</button>
          <button
            onClick={() => setNewSetOpen(true)}
            title="현재 차트 내용으로 묶음 신규 등록"
            className="w-6 h-6 border border-[var(--line-default)] bg-white rounded-[4px] flex items-center justify-center text-[var(--text-sub)] text-[13px] hover:bg-[var(--bg-primary-subtle)] hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)] transition-colors"
          >+</button>
        </div>

        {/* 대분류 chips — 1-depth (rounded-md, 활성 시 solid brand-primary) */}
        <div className="flex flex-wrap gap-1 px-2.5 py-1 border-b border-[var(--line-default)] flex-shrink-0">
          {MAIN_CATEGORIES.map((cat) => {
            const active = activeMain === cat.label;
            return (
              <button
                key={cat.label}
                onClick={() => { setActiveMain(cat.label); setActiveSub("전체"); }}
                className={`flex items-center gap-1 h-6 px-2 rounded-md text-[10px] font-medium border whitespace-nowrap transition-colors ${
                  active
                    ? "bg-[var(--brand-primary)] text-white border-[var(--brand-primary)] font-bold"
                    : "bg-white text-[var(--text-sub)] border-[var(--line-default)] hover:bg-[var(--bg-subtle)]"
                }`}
              >
                {cat.label}
                <span className={`text-[9px] tabular-nums ${active ? "opacity-80" : "text-[var(--text-tertiary)]"}`}>{cat.count}</span>
              </button>
            );
          })}
        </div>

        {/* 중분류 chips — 2-depth (rounded-md 동일 형태, 활성 시 outlined brand-primary) */}
        <div className="flex flex-wrap gap-1 px-2.5 py-1 bg-[var(--bg-base)] border-b border-[var(--line-default)] flex-shrink-0">
          {currentMain.subs.map(sub => {
            const active = activeSub === sub.label;
            return (
              <button
                key={sub.label}
                onClick={() => setActiveSub(sub.label)}
                className={`flex items-center gap-1 h-6 px-2 rounded-md text-[10px] font-medium whitespace-nowrap transition-colors ${
                  active
                    ? "bg-[var(--bg-primary-subtle)] text-[var(--brand-primary)] border border-[var(--brand-primary)]"
                    : "bg-[var(--bg-subtle)] text-[var(--text-sub)] border border-transparent hover:bg-white hover:border-[var(--line-default)]"
                }`}
              >
                {sub.label}
                <span className={`text-[9px] tabular-nums ${active ? "opacity-80" : "text-[var(--text-tertiary)]"}`}>{sub.count}</span>
              </button>
            );
          })}
        </div>

        {/* Current Category Bar */}
        <div className="flex items-center justify-between px-2.5 py-1 bg-[var(--bg-subtle)] border-b border-[var(--line-default)] flex-shrink-0">
          <span className="text-[10px] text-[var(--text-sub)]">
            {activeMain} <span className="text-[var(--text-tertiary)]">›</span> {activeSub} · <span className="font-bold text-[var(--text-main)]">{currentSubInfo.count}</span>개 묶음
          </span>
          <button className="text-[10px] text-[var(--text-sub)]">이름순 ▾</button>
        </div>

        {/* 묶음 List — 컴팩트 행 */}
        <div className="flex-1 overflow-y-auto">
          {setItems.map((item) => {
            const isExpanded = expandedSet === item.id;
            return (
              <div key={item.id} className="border-b border-[var(--line-subtle)]">
                {/* 메인 행 — 한 줄 */}
                <div className="flex items-center gap-1.5 px-2.5 py-1 hover:bg-[var(--bg-subtle)] cursor-pointer">
                  <span className={`text-[12px] flex-shrink-0 ${item.starred ? "text-[var(--orange-500)]" : "text-[var(--text-disabled)]"}`}>
                    {item.starred ? "★" : "☆"}
                  </span>
                  <span className="text-[11px] font-medium text-[var(--text-main)] truncate flex-1 min-w-0">{item.name}</span>
                  <span className="text-[10px] text-[var(--text-tertiary)] tabular-nums flex-shrink-0">{item.count}항목</span>
                  <span className="text-[10px] font-medium text-[var(--brand-primary)] tabular-nums flex-shrink-0 w-14 text-right">{item.price.toLocaleString()}원</span>
                  <button
                    onClick={() => setExpandedSet(isExpanded ? null : item.id)}
                    title={isExpanded ? "접기" : "펼치기"}
                    className="text-[11px] text-[var(--text-tertiary)] hover:text-[var(--text-sub)] w-5 h-5 flex items-center justify-center flex-shrink-0">
                    {isExpanded ? "⌃" : "⌄"}
                  </button>
                  <button
                    title="추가"
                    className="w-5 h-5 border border-[var(--line-default)] bg-white rounded-full flex items-center justify-center text-[var(--text-sub)] text-[11px] flex-shrink-0 hover:bg-[var(--bg-primary-subtle)] hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)]">
                    +
                  </button>
                </div>

                {/* 펼친 항목 (변경 없음) */}
                {isExpanded && item.items && (
                  <div className="bg-[var(--bg-primary-subtle)] border-t border-[var(--line-default)] px-3 py-1.5">
                    {item.items.map((sub) => (
                      <div key={sub.name} className="flex items-center justify-between py-0.5">
                        <span className="text-[11px] text-[var(--text-main)]">{sub.name}</span>
                        <span className="text-[10px] text-[var(--text-tertiary)] tabular-nums">{sub.price.toLocaleString()}원</span>
                      </div>
                    ))}
                    <div className="flex items-center justify-between pt-1 border-t border-[var(--line-default)] mt-1">
                      <span className="text-[11px] font-bold text-[var(--text-main)]">합계</span>
                      <span className="text-[11px] font-bold text-[var(--brand-primary)] tabular-nums">
                        {item.items.reduce((s, sub) => s + sub.price, 0).toLocaleString()}원
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
      </Panel>

      <PanelResizeHandle className="h-1 hover:bg-[var(--brand-primary)]/30 active:bg-[var(--brand-primary)]/50 transition-colors" />

      {/* 공유메모 (하단) */}
      <Panel defaultSize={30} minSize={15}>
        <SharedMemoCard />
      </Panel>

      {/* 신규 묶음 등록 모달 — + 버튼으로 오픈 */}
      {newSetOpen && (
        <NewSetModal
          onClose={() => setNewSetOpen(false)}
          onSave={() => setNewSetOpen(false)}
        />
      )}
    </PanelGroup>
  );
}
