// Panel B: 환자정보 + AI요약 + 임상메모 통합 패널
// 각 서브카드는 별도 export — Layout 2에서 재배치할 때 사용
// 임상메모는 환자 누적 메모이므로 차트(PanelD) 가 아닌 환자 정보 영역(PanelB)에 위치
import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { ClinicalNoteCard } from "./ClinicalNoteCard";

// 바이탈 데이터 — 기본 표시 컬럼: 혈압(BP) / 맥박(HR) / 체온(T) / 당화혈색소(HbA1c).
// HbA1c 는 매 내원마다 측정하지 않으므로 측정한 날에만 값이 있고 그 외엔 undefined.
// 정상 범위: 4.0~5.7% (당뇨 관리 목표 일반적으로 7% 미만)
const vitals = [
  { date: "05-19", bp: "130/85", bpHigh: false, hr: 74, temp: 36.6, hba1c: 6.8, hba1cHigh: true  },  // 오늘 측정
  { date: "03-12", bp: "128/82", bpHigh: false, hr: 76, temp: 36.5, hba1c: 7.2, hba1cHigh: true  },
  { date: "02-28", bp: "135/88", bpHigh: false, hr: 72, temp: 36.7 },
  { date: "02-14", bp: "142/90", bpHigh: true,  hr: 80, temp: 36.8, hba1c: 7.5, hba1cHigh: true  },
];

// ── 환자 인적사항 (헤더용) ──────────────────────────────────────────
const PATIENT_PROFILE = {
  chartNo: "100236",
  name: "황미진",
  rrn: "800715-2******",
  dob: "1980.07.15",
  age: 45,
  ageLabel: "만 45세",  // legacy; 사용처는 gender/age 통합 표기로 정리됨
  gender: "여",
  phone: "010-1234-5678",
  address: "서울특별시 강남구 테헤란로 123, 4층 401호",
};

// ── 수진자조회 결과 = "보험정보" (외부 NHIS 자격조회로 받은 정보) ──
const INSURANCE_LOOKUP = {
  type: "건강보험",
  subType: "직장가입자",
  holder: "본인",
  workplace: "GC Cell",
  copayRate: "30%",
  status: "정상" as "정상" | "정지",
  validFrom: "2024.01.01",
  checkups: ["일반검진", "위암검진", "자궁경부암"],
  lastLookup: "2026-05-08 09:12",
};

// ── 차트 접수정보 = "이번 진료 청구" (오늘 진료에 적용되는 보험·청구 구분) ──
const VISIT_INTAKE = {
  insuranceType: "건강보험",
  claimType: "청구" as "청구" | "비청구",
  visitType: "외래",
  visitNumber: "재진" as "초진" | "재진",
  timeZone: "주간",
  department: "내과",
  doctor: "김의사",
};

// ── 등록된 가족 ────────────────────────────────────────────────────
type FamilyMember = {
  chartNo: string;
  name: string;
  relation: string;
  age: number;
  avatar: string;
  bg: string;
  fg: string;
  lastVisit?: string;
};
// chartNo 는 PatientDetailModal 의 DUMMY_PATIENTS 맵 키와 일치해야 클릭 시 해당 환자 모달이 열림.
const FAMILY_MEMBERS: FamilyMember[] = [
  { chartNo: "100412", name: "김허나", relation: "딸",      age: 19, avatar: "허", bg: "var(--bg-primary-subtle)",        fg: "var(--brand-primary)", lastVisit: "2026-03-20" },
  { chartNo: "100089", name: "박혜은", relation: "배우자", age: 48, avatar: "혜", bg: "var(--status-success-bg-subtle)", fg: "var(--green-500)",     lastVisit: "2026-04-11" },
];

type SharedMemo = {
  id: number;
  avatar: string;
  avatarBg: string;
  avatarColor: string;
  name: string;
  nameColor: string;
  content: string;
  time: string;
};
const INITIAL_MEMOS: SharedMemo[] = [
  {
    id: 1,
    avatar: "이",
    avatarBg: "var(--bg-primary-subtle)",
    avatarColor: "var(--blue-500)",
    name: "이간호사",
    nameColor: "var(--blue-500)",
    content: "자보 서류 제출 완료 확인",
    time: "3/14 11:20",
  },
  {
    id: 2,
    avatar: "박",
    avatarBg: "var(--status-warning-bg-subtle)",
    avatarColor: "var(--orange-500)",
    name: "박데스크",
    nameColor: "var(--orange-500)",
    content: "보험사 담당자 연락처:\n010-9999-8888 (홍길동)",
    time: "3/15 14:00",
  },
];

// 현재 로그인한 EMR 사용자 — 프로토타입에선 의사(김원장)로 고정.
// 신규 메모 작성 시 자동으로 작성자/아바타 정보가 채워짐.
const CURRENT_USER: Omit<SharedMemo, "id" | "content" | "time"> = {
  avatar: "김",
  avatarBg: "var(--violet-050)",
  avatarColor: "var(--violet-500)",
  name: "김원장",
  nameColor: "var(--violet-500)",
};
// 채팅형 메모 작성일시 — "M/D HH:MM" 포맷 (기존 시각 표시와 일관)
const formatMemoTime = (d: Date) => {
  const m = d.getMonth() + 1;
  const day = d.getDate();
  const h = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  return `${m}/${day} ${h}:${min}`;
};

// ── 헬퍼 ────────────────────────────────────────────────────────
function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center px-2.5 min-h-[22px] py-0.5 border-b border-[var(--line-subtle)] last:border-b-0">
      <span className="text-sm text-[var(--text-tertiary)] w-[56px] flex-shrink-0">{label}</span>
      <div className="text-md text-[var(--text-main)] flex-1 min-w-0">{children}</div>
    </div>
  );
}

// 차트번호 badge — 환자대기목록과 동일 형식, 아웃라인 두른 미니 뱃지
function ChartNoBadge({ no, size = "sm" }: { no: string; size?: "sm" | "xs" }) {
  const cls = size === "xs"
    ? "text-xs px-1 py-0 leading-tight"
    : "text-sm px-1.5 py-0 leading-snug";
  return (
    <span className={`${cls} font-medium rounded-[3px] border border-[var(--line-default)] text-[var(--text-sub)] tabular-nums`}>
      {no}
    </span>
  );
}

// ── 처방금지 약품 (환자 알러지 / 부작용 이력) — 환자명 옆 아이콘 클릭 시 팝오버 노출 ──
// 데이터는 EmrScreen 에서 lift up. BannedDrug 타입은 PanelD 에서 export.
import type { BannedDrug } from "./PanelD";

function BannedDrugsPopover({ rect, drugs, onClose }: { rect: DOMRect; drugs: BannedDrug[]; onClose: () => void }) {
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const t = e.target as Element;
      if (!t.closest("[data-banned-popover]") && !t.closest("[data-banned-trigger]")) onClose();
    };
    const id = window.setTimeout(() => document.addEventListener("mousedown", handler), 80);
    return () => { clearTimeout(id); document.removeEventListener("mousedown", handler); };
  }, [onClose]);

  const width = 240;
  const left = Math.max(8, Math.min(rect.left, (window.innerWidth || 1200) - width - 8));
  const top = rect.bottom + 6;

  return createPortal(
    <div data-banned-popover
      className="fixed z-[9998] bg-white rounded-lg shadow-[0_4px_24px_rgba(0,0,0,0.12)] border border-[var(--red-200)] overflow-hidden"
      style={{ top, left, width }}>
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-[var(--red-200)] bg-[var(--status-error-bg-subtle)]">
        <div className="flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 bg-[var(--red-500)] rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-white text-micro font-bold leading-none">!</span>
          </span>
          <span className="text-md font-bold text-[var(--red-700)]">처방금지 약품</span>
          <span className="text-xs text-[var(--red-700)] tabular-nums">({drugs.length})</span>
        </div>
        <button onClick={onClose} className="text-[var(--red-700)] hover:text-[var(--red-500)] text-lg leading-none">✕</button>
      </div>
      <div>
        {drugs.length === 0 ? (
          <p className="px-3 py-3 text-xs text-[var(--text-tertiary)] text-center">등록된 처방금지 약품 없음</p>
        ) : (
          drugs.map((d, i) => (
            <div key={d.id} className={`px-3 py-1.5 ${i > 0 ? "border-t border-[var(--line-subtle)]" : ""}`}>
              <div className="text-md font-medium text-[var(--text-main)]">{d.drugName}</div>
              <div className="text-xs text-[var(--text-tertiary)] mt-0.5">{d.memo || "사유 없음"}</div>
            </div>
          ))
        )}
      </div>
    </div>,
    document.body
  );
}

// ── 공통: 팝오버 하단 "조회일시 + 재조회" 바 ──────────────────────
// 보험정보 / 공단검진 팝오버 모두 동일한 위치·UI로 표현되도록 추출.
function fmtLookup(d: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
function LookupFooter({
  fetchedAt,
  refetching,
  onRefetch,
  title,
}: {
  fetchedAt: Date;
  refetching: boolean;
  onRefetch: () => void;
  title: string;
}) {
  return (
    <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[var(--bg-subtle)] border-t border-[var(--line-default)]">
      <span className="text-micro text-[var(--text-tertiary)] flex-1 tabular-nums">조회 {fmtLookup(fetchedAt)}</span>
      <button
        onClick={onRefetch}
        disabled={refetching}
        title={title}
        className="flex items-center gap-0.5 h-6 px-2 text-xs font-medium text-[var(--brand-primary)] border border-[var(--brand-primary)] rounded-[3px] hover:bg-[var(--brand-primary)] hover:text-white transition-colors disabled:opacity-60 disabled:cursor-wait"
      >
        <span className={refetching ? "inline-block animate-spin" : ""}>↻</span>
        {refetching ? "조회중" : "재조회"}
      </button>
    </div>
  );
}

// ── 보험정보 팝오버 (수진자조회 결과 = 건강보험 chip 클릭 시) ────────
function InsurancePopover({ rect, onClose }: { rect: DOMRect; onClose: () => void }) {
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const t = e.target as Element;
      if (!t.closest("[data-ins-popover]") && !t.closest("[data-ins-trigger]")) onClose();
    };
    const id = window.setTimeout(() => document.addEventListener("mousedown", handler), 80);
    return () => { clearTimeout(id); document.removeEventListener("mousedown", handler); };
  }, [onClose]);

  const ins = INSURANCE_LOOKUP;
  const [fetchedAt, setFetchedAt] = useState<Date>(() => {
    const d = new Date();
    d.setMinutes(d.getMinutes() - 17);
    return d;
  });
  const [refetching, setRefetching] = useState(false);
  const handleRefetch = () => {
    if (refetching) return;
    setRefetching(true);
    window.setTimeout(() => {
      setFetchedAt(new Date());
      setRefetching(false);
    }, 900);
  };

  const width = 290;
  const left = Math.max(8, Math.min(rect.right - width, (window.innerWidth || 1200) - width - 8));
  const top = rect.bottom + 6;

  return createPortal(
    <div data-ins-popover
      className="fixed z-[9998] bg-white rounded-lg shadow-[0_4px_24px_rgba(0,0,0,0.12)] border border-[var(--line-default)] overflow-hidden"
      style={{ top, left, width }}>
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-[var(--line-default)] bg-[var(--bg-subtle)]">
        <div className="flex items-baseline gap-1.5">
          <span className="text-md font-bold text-[var(--text-main)]">보험정보</span>
          <span className="text-xs text-[var(--text-tertiary)]">수진자조회 결과</span>
        </div>
        <button onClick={onClose} className="text-[var(--text-tertiary)] hover:text-[var(--text-main)] text-lg leading-none">✕</button>
      </div>
      <div>
        <InfoRow label="보험구분">{ins.type} · {ins.subType}</InfoRow>
        <InfoRow label="가입자">{ins.holder}</InfoRow>
        <InfoRow label="직장명">{ins.workplace}</InfoRow>
        <InfoRow label="본인부담"><span className="font-medium">{ins.copayRate}</span></InfoRow>
        <InfoRow label="자격">
          <span className={`font-medium ${ins.status === "정상" ? "text-[var(--green-500)]" : "text-[var(--red-500)]"}`}>{ins.status}</span>
          <span className="text-[var(--text-tertiary)] ml-1.5">{ins.validFrom}~</span>
        </InfoRow>
      </div>
      <LookupFooter
        fetchedAt={fetchedAt}
        refetching={refetching}
        onRefetch={handleRefetch}
        title="수진자조회 재조회 — 건강보험 자격 정보 다시 가져오기"
      />
    </div>,
    document.body
  );
}

// ── 공단검진 팝오버 (검진 대상 리스트) ───────────────────────────────
const CHECKUP_DETAILS = [
  { name: "일반건강검진",   eligible: "2026년 대상", lastDone: "2024.05.12" },
  { name: "위암검진",       eligible: "2026년 대상", lastDone: "2024.05.12" },
  { name: "자궁경부암검진", eligible: "2026년 대상", lastDone: "—" },
];

function CheckupPopover({ rect, onClose }: { rect: DOMRect; onClose: () => void }) {
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const t = e.target as Element;
      if (!t.closest("[data-checkup-popover]") && !t.closest("[data-checkup-trigger]")) onClose();
    };
    const id = window.setTimeout(() => document.addEventListener("mousedown", handler), 80);
    return () => { clearTimeout(id); document.removeEventListener("mousedown", handler); };
  }, [onClose]);

  // ── 재조회 상태 — 보험정보 팝오버와 동일한 패턴 ──
  const [fetchedAt, setFetchedAt] = useState<Date>(() => {
    const d = new Date();
    d.setMinutes(d.getMinutes() - 17);
    return d;
  });
  const [refetching, setRefetching] = useState(false);
  const handleRefetch = () => {
    if (refetching) return;
    setRefetching(true);
    window.setTimeout(() => {
      setFetchedAt(new Date());
      setRefetching(false);
    }, 900);
  };

  const width = 290;
  const left = Math.max(8, Math.min(rect.right - width, (window.innerWidth || 1200) - width - 8));
  const top = rect.bottom + 6;

  return createPortal(
    <div data-checkup-popover
      className="fixed z-[9998] bg-white rounded-lg shadow-[0_4px_24px_rgba(0,0,0,0.12)] border border-[var(--line-default)] overflow-hidden"
      style={{ top, left, width }}>
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-[var(--line-default)] bg-[var(--bg-subtle)]">
        <div className="flex items-baseline gap-1.5">
          <span className="text-md font-bold text-[var(--text-main)]">공단검진</span>
          <span className="text-xs text-[var(--text-tertiary)]">{CHECKUP_DETAILS.length}건 대상</span>
        </div>
        <button onClick={onClose} className="text-[var(--text-tertiary)] hover:text-[var(--text-main)] text-lg leading-none">✕</button>
      </div>
      <div>
        {CHECKUP_DETAILS.map(c => (
          <div key={c.name} className="flex items-center gap-1.5 px-2.5 py-1.5 border-b border-[var(--line-subtle)] last:border-b-0">
            <div className="flex-1 min-w-0">
              <p className="text-md font-medium text-[var(--text-main)]">{c.name}</p>
              <p className="text-xs text-[var(--text-tertiary)]">최근 수검 · {c.lastDone}</p>
            </div>
            <span className="text-xs font-bold text-[var(--brand-primary)] bg-[var(--bg-primary-subtle)] rounded-[3px] px-1.5 py-0.5 flex-shrink-0">
              {c.eligible}
            </span>
            {/* 대상별 오더 추가 — 클릭 시 해당 검진을 현재 차트의 처방/오더에 추가 (prototype: placeholder) */}
            <button
              title={`${c.name} 오더 추가`}
              className="text-xs font-medium text-[var(--brand-primary)] border border-[var(--brand-primary)] rounded-[3px] px-1.5 py-0.5 hover:bg-[var(--brand-primary)] hover:text-white transition-colors flex-shrink-0"
            >
              + 오더
            </button>
          </div>
        ))}
      </div>
      <LookupFooter
        fetchedAt={fetchedAt}
        refetching={refetching}
        onRefetch={handleRefetch}
        title="공단 서버에서 검진 대상 재조회"
      />
    </div>,
    document.body
  );
}

// ── 환자정보 편집 모달 (인적사항 / 가족 / 분류) ────────────────────
function PatientEditModal({ onClose }: { onClose: () => void }) {
  const [tab, setTab] = useState<"인적사항" | "가족" | "분류">("인적사항");
  const [adding, setAdding] = useState(false);
  const TABS = ["인적사항", "가족", "분류"] as const;

  return createPortal(
    <div className="fixed inset-0 z-[9999] bg-black/40 flex items-center justify-center" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-[600px] max-w-[92vw] max-h-[88vh] flex flex-col" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-[var(--line-default)]">
          <div>
            <h3 className="text-xl font-bold text-[var(--text-main)]">환자 정보 편집</h3>
            <p className="text-sm text-[var(--text-tertiary)] mt-0.5 flex items-center gap-1.5">
              <span>{PATIENT_PROFILE.name}</span>
              <ChartNoBadge no={PATIENT_PROFILE.chartNo} />
            </p>
          </div>
          <button onClick={onClose} className="text-[var(--text-tertiary)] hover:text-[var(--text-main)] text-xl">✕</button>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-0 px-5 border-b border-[var(--line-default)] flex-shrink-0">
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-3 py-2 text-md font-bold border-b-2 transition-colors ${
                tab === t
                  ? "border-[var(--brand-primary)] text-[var(--brand-primary)]"
                  : "border-transparent text-[var(--text-tertiary)] hover:text-[var(--text-sub)]"
              }`}>
              {t}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {tab === "인적사항" && <PersonalTab />}
          {tab === "가족" && <FamilyTab adding={adding} setAdding={setAdding} />}
          {tab === "분류" && <ClassificationTab />}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-[var(--line-default)]">
          <button onClick={onClose} className="h-9 px-4 text-md border border-[var(--line-default)] rounded-md bg-white text-[var(--text-main)] hover:bg-[var(--bg-subtle)]">취소</button>
          <button onClick={() => { onClose(); }}
            className="h-9 px-5 text-md font-bold text-white rounded-md hover:opacity-90"
            style={{ background: "var(--brand-primary)" }}>
            저장
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

function FormField({ label, value, type = "text" }: { label: string; value: string; type?: string }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-[var(--text-tertiary)]">{label}</label>
      <input type={type} defaultValue={value}
        className="h-9 px-3 text-md border border-[var(--line-default)] rounded-md bg-white outline-none focus:border-[var(--brand-primary)]" />
    </div>
  );
}

function PersonalTab() {
  const p = PATIENT_PROFILE;
  return (
    <div className="grid grid-cols-2 gap-3">
      <FormField label="이름" value={p.name} />
      <FormField label="차트번호" value={p.chartNo} />
      <FormField label="주민등록번호" value="800715-2058134" />
      <FormField label="생년월일" value={p.dob} />
      <FormField label="성별" value={p.gender} />
      <FormField label="전화번호" value={p.phone} />
      <div className="col-span-2">
        <FormField label="주소" value="서울특별시 용산구 한강대로 100 GC빌딩 5층" />
      </div>
      <div className="col-span-2 flex flex-col gap-1">
        <label className="text-sm font-medium text-[var(--text-tertiary)]">메모</label>
        <textarea defaultValue="진료 시 보호자(따님 김허나) 동반 희망"
          className="px-3 py-2 text-md border border-[var(--line-default)] rounded-md bg-white outline-none focus:border-[var(--brand-primary)] resize-none h-16" />
      </div>
    </div>
  );
}

function FamilyTab({ adding, setAdding }: { adding: boolean; setAdding: (v: boolean) => void }) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm text-[var(--text-tertiary)]">등록된 가족 {FAMILY_MEMBERS.length}명</p>
      {FAMILY_MEMBERS.map(f => (
        <div key={f.chartNo} className="flex items-center gap-3 px-3 py-2 border border-[var(--line-default)] rounded-md">
          <span className="w-8 h-8 rounded-full flex items-center justify-center text-md font-bold flex-shrink-0"
            style={{ background: f.bg, color: f.fg }}>{f.avatar}</span>
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-medium text-[var(--text-main)]">{f.name}</span>
              <span className="text-sm text-[var(--text-tertiary)] tabular-nums">{f.relation} · {f.age}</span>
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <ChartNoBadge no={f.chartNo} size="xs" />
              {f.lastVisit && <span className="text-xs text-[var(--text-tertiary)]">최근내원 {f.lastVisit}</span>}
            </div>
          </div>
          <button className="h-7 px-2 text-sm text-[var(--text-sub)] border border-[var(--line-default)] rounded hover:bg-[var(--bg-subtle)]">수정</button>
          <button className="h-7 px-2 text-sm text-[var(--red-500)] border border-[var(--line-default)] rounded hover:bg-[var(--status-error-bg-subtle)]">삭제</button>
        </div>
      ))}

      {adding ? (
        <div className="border border-[var(--brand-primary)] rounded-md p-3 bg-[var(--bg-primary-subtle)]">
          <p className="text-md font-bold text-[var(--text-main)] mb-2">새 가족 등록</p>
          <div className="grid grid-cols-2 gap-2">
            <FormField label="이름" value="" />
            <FormField label="관계" value="" />
            <FormField label="생년월일" value="" />
            <FormField label="전화번호" value="" />
            <div className="col-span-2">
              <FormField label="기존 차트번호 (선택)" value="" />
            </div>
          </div>
          <div className="flex items-center justify-end gap-2 mt-3">
            <button onClick={() => setAdding(false)} className="h-7 px-3 text-sm text-[var(--text-sub)] border border-[var(--line-default)] rounded bg-white">취소</button>
            <button onClick={() => setAdding(false)}
              className="h-7 px-3 text-sm font-bold text-white rounded"
              style={{ background: "var(--brand-primary)" }}>등록</button>
          </div>
        </div>
      ) : (
        <button onClick={() => setAdding(true)}
          className="w-full py-2.5 text-md font-medium text-[var(--brand-primary)] border border-dashed border-[var(--line-default)] rounded-md hover:border-[var(--brand-primary)] hover:bg-[var(--bg-primary-subtle)] transition-colors">
          ＋ 가족 추가
        </button>
      )}
    </div>
  );
}

function ClassificationTab() {
  return (
    <div className="flex flex-col gap-3">
      <FormField label="환자그룹" value="GC Cell" />
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-[var(--text-tertiary)]">환자유형</label>
        <div className="flex gap-1.5 flex-wrap">
          {["만성질환", "고혈압", "당뇨", "임산부", "어린이", "고령자"].map((t, i) => (
            <label key={t} className="flex items-center gap-1.5 cursor-pointer px-2 py-1 border border-[var(--line-default)] rounded-md bg-white hover:bg-[var(--bg-subtle)]">
              <input type="checkbox" defaultChecked={i < 3} className="accent-[var(--brand-primary)]" />
              <span className="text-sm text-[var(--text-main)]">{t}</span>
            </label>
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-[var(--text-tertiary)]">처방금지 / 알러지</label>
        <input defaultValue="페니실린, 조영제" className="h-9 px-3 text-md border border-[var(--line-default)] rounded-md bg-white outline-none focus:border-[var(--brand-primary)]" />
      </div>
    </div>
  );
}

// ── 서브카드 1: 환자정보 ───────────────────────────────────────────
// • 2px brand-primary 테두리로 "현재 환자" 강조 (PanelD와 시각 페어링)
// • 헤더 한 줄에 이름 / 차트번호 뱃지 / 본인확인 ✓ / 보험chip / 공단검진chip / 편집
// • 스크롤 없음 — 모든 정보가 한 화면에 들어감
// • 보험·공단검진은 클릭 팝오버로 자세한 정보 노출
export function PatientInfoCard({
  // 환자명 클릭 → 환자 자세히보기 모달. EmrScreen 에서 주입.
  // initialTab 지정 가능 — 헤더의 본인 환자명은 "기본정보", 가족 멤버는 "내원이력"으로 진입.
  // options.personalEdit=true → 인적사항 섹션이 자동으로 편집 모드로 열림 (편집 아이콘 진입점).
  onPatientNameClick,
  // 처방금지 약품 — EmrScreen 에서 lift. PanelD(차트 하단바·처방 우클릭)와 동일 데이터 공유.
  bannedDrugs = [],
}: {
  onPatientNameClick?: (
    patientId: string,
    initialTab?: "기본정보" | "내원이력",
    options?: { personalEdit?: boolean },
  ) => void;
  bannedDrugs?: BannedDrug[];
} = {}) {
  const p = PATIENT_PROFILE;
  const ins = INSURANCE_LOOKUP;
  const insBtnRef = useRef<HTMLButtonElement>(null);
  const checkupBtnRef = useRef<HTMLButtonElement>(null);
  const [insRect, setInsRect] = useState<DOMRect | null>(null);
  const [bannedRect, setBannedRect] = useState<DOMRect | null>(null);
  const bannedBtnRef = useRef<HTMLButtonElement>(null);
  const [checkupRect, setCheckupRect] = useState<DOMRect | null>(null);
  // 환자 정보 편집은 통합 PatientDetailModal 의 기본정보 탭에서 처리 — 별도 모달 제거됨.

  return (
    // Layout 2 가로 배치 — 헤더(이름+chips) → 인적사항 → 2-col 본문 → 처방금지 footer
    <div className="bg-white rounded-md h-full overflow-hidden flex flex-col relative">

      {/* ── 편집 아이콘 — 우상단 절대 위치.
            클릭 시 환자 상세정보 팝업의 기본정보 탭 + 인적사항 자동 편집 모드로 진입. ── */}
      <button
        onClick={() => onPatientNameClick?.(p.chartNo, "기본정보", { personalEdit: true })}
        title="환자 상세정보 — 인적사항 편집 모드로 열기"
        className="absolute top-1.5 right-1.5 w-7 h-7 flex items-center justify-center text-[var(--text-tertiary)] hover:text-[var(--brand-primary)] hover:bg-[var(--bg-subtle)] rounded transition-colors z-10">
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
          <path d="M11.3 2.3l2.4 2.4-8.5 8.5L2 13.5l.3-3.2 9-8z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" fill="none"/>
        </svg>
      </button>

      {/* ── 헤더 — [chart#] [환자명] [성별/나이] + 처방금지 아이콘 + 보험·검진 chip.
            폭이 좁아지면 보험·검진 chip 그룹(ml-auto) 이 자동으로 둘째 줄로 줄바꿈됨 (flex-wrap). ── */}
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 px-2.5 pt-1.5 pb-1 pr-9 flex-shrink-0 min-w-0">
        <ChartNoBadge no={p.chartNo} />
        <button
          onClick={() => onPatientNameClick?.(p.chartNo)}
          title="환자 자세히보기"
          className="text-xl font-bold text-[var(--text-main)] hover:text-[var(--brand-primary)] hover:underline flex-shrink-0"
        >
          {p.name}
        </button>
        {/* 성별/나이 — 환자명 바로 옆. 통합 표기 (여/45). */}
        <span className="text-sm text-[var(--text-sub)] tabular-nums flex-shrink-0">{p.gender}/{p.age}</span>
        {/* 처방금지 아이콘 — 클릭 시 약품 리스트 팝오버. bannedDrugs 가 0건이어도 항상 노출(차트에서 등록 가능 안내). */}
        {bannedDrugs.length > 0 && (
          <button
            ref={bannedBtnRef}
            data-banned-trigger
            onClick={() => {
              setInsRect(null);
              setCheckupRect(null);
              setBannedRect(r => r ? null : bannedBtnRef.current?.getBoundingClientRect() ?? null);
            }}
            title={`처방금지 ${bannedDrugs.length}건 — 클릭하여 자세히 보기`}
            className="flex items-center gap-0.5 h-5 px-1.5 rounded-[3px] bg-[var(--status-error-bg-subtle)] border border-[var(--red-200)] text-[var(--red-500)] hover:bg-[var(--red-500)] hover:text-white hover:border-[var(--red-500)] transition-colors flex-shrink-0">
            <svg width="11" height="11" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.4" fill="none"/>
              <path d="M3.5 3.5L12.5 12.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
            </svg>
            <span className="text-xs font-bold tabular-nums leading-none">{bannedDrugs.length}</span>
          </button>
        )}
        {/* spacer — 한 줄에 모두 들어갈 땐 flex-1 이 남은 공간을 차지해 보험/검진 chip 을 우측 정렬.
            줄바꿈 시엔 spacer 가 첫째 줄에 남고 chip 은 둘째 줄에서 자연스럽게 좌측 정렬됨. */}
        <div className="flex-1 basis-0" aria-hidden="true" />
        <button
          ref={insBtnRef}
          data-ins-trigger
          onClick={() => {
            setCheckupRect(null);
            setInsRect(r => r ? null : insBtnRef.current?.getBoundingClientRect() ?? null);
          }}
          title="보험정보 자세히 (수진자조회 결과)"
          className="flex items-center gap-1 text-xs font-medium text-[var(--brand-primary)] bg-white border border-[var(--blue-200)] hover:bg-[var(--brand-primary)] hover:text-white hover:border-[var(--brand-primary)] rounded-[3px] px-1.5 py-0.5 transition-colors flex-shrink-0">
          {ins.type}
          <svg width="9" height="9" viewBox="0 0 12 12" fill="none">
            <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.2" fill="none"/>
            <text x="6" y="8.4" textAnchor="middle" fontSize="7" fontWeight="bold" fill="currentColor">i</text>
          </svg>
        </button>
        <button
          ref={checkupBtnRef}
          data-checkup-trigger
          onClick={() => {
            setInsRect(null);
            setCheckupRect(r => r ? null : checkupBtnRef.current?.getBoundingClientRect() ?? null);
          }}
          title="공단검진 대상 자세히"
          className="flex items-center gap-1 text-xs font-bold text-[var(--brand-primary)] bg-[var(--bg-primary-subtle)] border border-[var(--brand-primary)] hover:bg-[var(--brand-primary)] hover:text-white rounded-[3px] px-1.5 py-0.5 transition-colors flex-shrink-0">
          공단검진 {ins.checkups.length}
        </button>
      </div>

      {/* ── 인적사항 (주민번호 · 전화 · 주소) — DOB 제거, 주민번호를 첫 항목으로 promote.
            성별/나이는 상단 헤더로 이동됨. ── */}
      <div className="flex items-center gap-1.5 text-sm text-[var(--text-sub)] px-2.5 pb-1.5 border-b border-[var(--line-default)] flex-wrap flex-shrink-0 min-w-0">
        <span className="flex-shrink-0 tabular-nums">{p.rrn}</span>
        <span className="text-[var(--text-tertiary)] flex-shrink-0">|</span>
        <span className="flex-shrink-0">{p.phone}</span>
        <span className="text-[var(--text-tertiary)] flex-shrink-0">|</span>
        <span className="truncate min-w-0" title={p.address}>{p.address}</span>
      </div>

      {/* ── 본문 — 일정+분류+가족 (single col, 전체 폭).
          최근 바이탈은 별도 패널(RecentVitalsPanel)로 분리되어 환자정보 카드 아래로 이동됨. ── */}
      <div className="flex-1 flex min-h-0">

        {/* 진료 일정 + 환자 분류 + 가족 — 반응형 grid (auto-fit).
            폭 ≥ 360px 이면 자동으로 2열, 좁아지면 1열로 stack. 가족 행은 항상 full-width. */}
        <div className="flex-1 px-2.5 py-1.5 min-w-0">
          <div
            className="grid gap-x-3 gap-y-1"
            style={{ gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))" }}
          >
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="text-xs text-[var(--text-tertiary)] w-14 flex-shrink-0">최근내원</span>
              <span className="text-md font-medium text-[var(--text-main)] tabular-nums truncate">2026-04-12</span>
            </div>
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="text-xs text-[var(--text-tertiary)] w-14 flex-shrink-0">예약일</span>
              <span className="text-md font-medium text-[var(--red-500)] tabular-nums truncate">2026-05-20</span>
            </div>
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="text-xs text-[var(--text-tertiary)] w-14 flex-shrink-0">환자그룹</span>
              <span className="text-md font-medium text-[var(--text-main)] truncate">GC Cell</span>
            </div>
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="text-xs text-[var(--text-tertiary)] w-14 flex-shrink-0">환자유형</span>
              <div className="flex gap-1 flex-wrap min-w-0">
                <span className="text-xs font-medium text-[var(--brand-primary)] bg-[var(--bg-primary-subtle)] rounded-[3px] px-1.5 py-0.5">만성질환</span>
                <span className="text-xs font-medium text-[var(--text-link)] bg-[var(--bg-primary-subtle)] rounded-[3px] px-1.5 py-0.5">고혈압</span>
                <span className="text-xs font-medium text-[var(--red-500)] bg-[var(--status-error-bg-subtle)] rounded-[3px] px-1.5 py-0.5">당뇨</span>
              </div>
            </div>
            {/* 가족 — 항상 full-width (gridColumn span all) */}
            <div className="flex items-start gap-1.5 min-w-0" style={{ gridColumn: "1 / -1" }}>
              <span className="text-xs text-[var(--text-tertiary)] w-14 flex-shrink-0 pt-0.5">가족</span>
              <div className="flex items-center gap-1.5 flex-wrap min-w-0">
                {FAMILY_MEMBERS.map((f, i) => (
                  <span key={f.chartNo} className="flex items-center gap-0.5">
                    {i > 0 && <span className="text-[var(--text-tertiary)] mr-1">·</span>}
                    {/* 가족 환자명 클릭 → 해당 환자의 자세히보기 모달 (내원이력 탭으로 진입).
                        EMR 흐름: 진료 중인 환자(예: 황미진)의 보호자(예: 김허나) 정보를
                        빠르게 참고하기 위한 진입점. 처방을 현재 차트로 가져오기 위한 용도. */}
                    <button
                      onClick={() => onPatientNameClick?.(f.chartNo, "내원이력")}
                      title={`${f.name} 내원이력 자세히보기`}
                      className="text-md text-[var(--text-main)] hover:text-[var(--brand-primary)] hover:underline"
                    >
                      {f.name}
                    </button>
                    <span className="text-md text-[var(--text-tertiary)]">({f.relation})</span>
                  </span>
                ))}
              </div>
            </div>
            {/* 주소는 상단 헤더 (번호 옆) 으로 이동됨 */}
          </div>
        </div>

      </div>

      {/* 처방금지 푸터 배너는 환자명 옆 아이콘으로 이동됨 */}
      {/* 최근 바이탈 인라인 strip 은 좌측 진료일정 영역의 mini 테이블로 이동됨 */}

      {/* 보험정보 팝오버 */}
      {insRect && <InsurancePopover rect={insRect} onClose={() => setInsRect(null)} />}

      {/* 처방금지 약품 팝오버 — 환자명 옆 아이콘 클릭 시 노출 */}
      {bannedRect && <BannedDrugsPopover rect={bannedRect} drugs={bannedDrugs} onClose={() => setBannedRect(null)} />}

      {/* 공단검진 팝오버 */}
      {checkupRect && <CheckupPopover rect={checkupRect} onClose={() => setCheckupRect(null)} />}

      {/* 환자정보 편집 모달 — PatientDetailModal 의 기본정보 탭으로 통합되어 제거됨. */}
    </div>
  );
}

// ── 서브카드 2: AI 진료이력 요약 ──────────────────────────────────
export function AISummaryCard() {
  return (
    <div className="bg-white rounded-md h-full overflow-hidden flex flex-col">
      <div className="flex items-center justify-between px-2.5 py-1.5 border-b border-[var(--line-default)] flex-shrink-0">
        <span className="text-md font-bold text-[var(--text-main)]">AI 진료이력 요약</span>
        <button className="text-xs text-[var(--brand-primary)] font-medium">더보기 ›</button>
      </div>
      <p className="text-sm text-[var(--text-sub)] leading-[17px] px-2.5 py-2 flex-1 overflow-y-auto">
        당뇨·고혈압 정기 관리 중. 메트포르민·라미프릴 장기복용. 최근 HbA1c 7.2% (3개월전). 9/20일자 알러지 검사 결과 확인 필요.
      </p>
    </div>
  );
}

// ── 바이탈 — 환자정보 카드 아래 별도 패널. 표 형식 (오늘 포함 최근 3건). ───────
// 헤더 + 3 데이터행. 이전 환자정보 카드 우측에 있던 mini 테이블 그대로 옮긴 형태.
// onOpenDetail — "더보기" 버튼 클릭 시 환자 자세히보기 모달의 바이탈 탭 열림.
export function RecentVitalsPanel({ onOpenDetail }: { onOpenDetail?: () => void } = {}) {
  return (
    <div className="bg-white rounded-md shadow-[0_1px_3px_rgba(0,0,0,0.06)] h-full overflow-hidden flex flex-col">
      {/* 헤더 — 라벨 + 액션. "최근 3건" 부가 텍스트 제거, "+ 기록" → "더보기" 로 변경. */}
      <div className="flex items-center justify-between px-2.5 py-1 border-b border-[var(--line-default)] flex-shrink-0">
        <span className="text-md font-bold text-[var(--text-main)]">바이탈</span>
        <button
          onClick={onOpenDetail}
          title="환자 자세히보기 모달의 바이탈 탭 열기"
          className="text-xs text-[var(--brand-primary)] hover:underline"
        >
          더보기
        </button>
      </div>

      {/* 표 — 헤더 행 + 데이터 3행. 오늘 행은 살짝 강조.
          컬럼: 일자 / BP / HR / T / HbA1c. HbA1c 는 매번 측정 안 하므로 값 없으면 — 표시. */}
      <div className="flex-1 overflow-y-auto">
        {/* 컬럼 헤더 — 진단/처방 표와 동일한 회색 배경 */}
        <div
          className="grid items-center gap-2 px-2.5 py-1 bg-[var(--bg-subtle)] border-b border-[var(--line-default)] sticky top-0 z-10"
          style={{ gridTemplateColumns: "76px 1fr 1fr 1fr 1fr" }}
        >
          <span className="text-xs font-medium text-[var(--text-tertiary)]">일자</span>
          <span className="text-xs font-medium text-[var(--text-tertiary)] text-center">BP</span>
          <span className="text-xs font-medium text-[var(--text-tertiary)] text-center">HR</span>
          <span className="text-xs font-medium text-[var(--text-tertiary)] text-center">T</span>
          <span className="text-xs font-medium text-[var(--text-tertiary)] text-center" title="당화혈색소">HbA1c</span>
        </div>
        {/* 데이터 행 — 오늘 포함 3건 */}
        {vitals.slice(0, 3).map((v, i) => {
          const isToday = i === 0;
          return (
            <div
              key={v.date}
              className={`grid items-center gap-2 px-2.5 py-1 border-b border-[var(--line-subtle)] last:border-b-0 ${
                isToday ? "bg-[var(--bg-primary-subtle)]/30" : ""
              }`}
              style={{ gridTemplateColumns: "76px 1fr 1fr 1fr 1fr" }}
            >
              <span className={`text-xs tabular-nums ${isToday ? "font-bold text-[var(--brand-primary)]" : "text-[var(--text-sub)]"}`}>
                {v.date}{isToday && " 오늘"}
              </span>
              <span className={`text-sm tabular-nums text-center font-medium ${v.bpHigh ? "text-[var(--red-500)]" : "text-[var(--text-main)]"}`}>{v.bp}</span>
              <span className="text-sm tabular-nums text-center text-[var(--text-main)]">{v.hr}</span>
              <span className="text-sm tabular-nums text-center text-[var(--text-main)]">{v.temp}</span>
              <span className={`text-sm tabular-nums text-center ${
                v.hba1c === undefined ? "text-[var(--text-tertiary)]" :
                v.hba1cHigh ? "text-[var(--orange-700)] font-medium" :
                "text-[var(--text-main)]"
              }`}>
                {v.hba1c ?? "—"}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── 서브카드 3: 최근 바이탈 (legacy mini 테이블 — Layout 1 등에서 사용) ───────
// 내원이력(PanelC) 표 스타일과 동일한 패턴 — bg-subtle 헤더, 작은 폰트, 컴팩트 행
export function RecentVitalsCard() {
  const VITAL_COLS = "56px 1fr 1fr 1fr 1fr"; // 일자 / 혈압 / 맥박 / 체온 / HbA1c
  return (
    <div className="bg-white rounded-md h-full overflow-hidden flex flex-col">
      {/* 헤더 */}
      <div className="flex items-center justify-between px-2.5 py-1.5 border-b border-[var(--line-default)] flex-shrink-0">
        <span className="text-md font-bold text-[var(--text-main)]">최근 바이탈</span>
        <button className="text-xs text-[var(--text-tertiary)] hover:text-[var(--brand-primary)]">+ 기록</button>
      </div>
      {/* 표 — 내원이력 스타일: bg-subtle 컬럼 헤더, 9px 라벨, 컴팩트 행 */}
      <div className="flex-1 overflow-y-auto">
        {/* 컬럼 헤더 (sticky) */}
        <div className="grid bg-[var(--bg-subtle)] border-b border-[var(--line-default)] px-2 py-1 gap-1 sticky top-0 z-10"
          style={{ gridTemplateColumns: VITAL_COLS }}>
          {[["일자","left"],["혈압","center"],["맥박","center"],["체온","center"],["HbA1c","center"]].map(([label, align]) => (
            <span key={label} className={`text-micro font-medium text-[var(--text-tertiary)] text-${align} truncate`}>
              {label}
            </span>
          ))}
        </div>
        {/* 행 */}
        {vitals.map((v) => (
          <div key={v.date}
            className="grid items-center px-2 py-1 border-b border-[var(--line-subtle)] gap-1 hover:bg-[var(--status-success-bg-subtle)]"
            style={{ gridTemplateColumns: VITAL_COLS }}>
            <span className="text-xs font-medium text-[var(--text-main)]">{v.date}</span>
            <span className={`text-xs font-medium text-center tabular-nums ${
              v.bpHigh ? "text-[var(--red-500)]" : "text-[var(--text-main)]"
            }`}>{v.bp}</span>
            <span className="text-xs font-medium text-[var(--text-main)] text-center tabular-nums">{v.hr}</span>
            <span className="text-xs font-medium text-[var(--text-main)] text-center tabular-nums">{v.temp}</span>
            <span className={`text-xs font-medium text-center tabular-nums ${
              v.hba1c === undefined ? "text-[var(--text-tertiary)]" :
              v.hba1cHigh ? "text-[var(--orange-700)]" :
              "text-[var(--text-main)]"
            }`}>{v.hba1c ?? "—"}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── 서브카드 4: 공유메모 ──────────────────────────────────────────
export function SharedMemoCard() {
  const [noticeOpen, setNoticeOpen] = useState(true);
  // ── 채팅형 메모 state ─────────────────────────────────────────
  // 신규 메모는 작성자(현재 사용자) + 작성일시(현재 시각) 가 자동 추가되어 누적.
  const [memos, setMemos] = useState<SharedMemo[]>(INITIAL_MEMOS);
  const [draft, setDraft] = useState("");
  const memosScrollRef = useRef<HTMLDivElement>(null);

  const submitMemo = () => {
    const text = draft.trim();
    if (!text) return;
    const newMemo: SharedMemo = {
      ...CURRENT_USER,
      id: Date.now(),
      content: text,
      time: formatMemoTime(new Date()),
    };
    setMemos(prev => [...prev, newMemo]);
    setDraft("");
    // 새 메시지 작성 후 스크롤을 가장 아래로 (다음 frame 에서 DOM 갱신 후)
    requestAnimationFrame(() => {
      const el = memosScrollRef.current;
      if (el) el.scrollTop = el.scrollHeight;
    });
  };

  return (
    <div className="bg-white rounded-md overflow-hidden flex flex-col h-full">
      {/* Header — 메모 아이콘 제거. 타이틀 + 공지 표시 dot 만 유지. */}
      <div className="flex items-center justify-between px-[10.5px] py-[7px] border-b border-[var(--line-subtle)] flex-shrink-0">
        <div className="flex items-center gap-[3px]">
          <span className="text-md font-bold text-black">공유 메모</span>
          <div className="w-[8px] h-[8px] rounded-full bg-[var(--orange-500)]" />
        </div>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M7.33333 12.6667C10.2789 12.6667 12.6667 10.2789 12.6667 7.33333C12.6667 4.38781 10.2789 2 7.33333 2C4.38781 2 2 4.38781 2 7.33333C2 10.2789 4.38781 12.6667 7.33333 12.6667Z" stroke="var(--text-tertiary)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333"/>
          <path d="M14 14L11.1333 11.1333" stroke="var(--text-tertiary)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333"/>
        </svg>
      </div>

      {/* Notice Accordion */}
      <div className="border-b border-[var(--line-subtle)] flex-shrink-0">
        <button
          className="w-full bg-[var(--status-warning-bg-subtle)] flex items-center justify-between px-[8px] py-[5px]"
          onClick={() => setNoticeOpen((v) => !v)}
        >
          <div className="flex items-center gap-[5px]">
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" className="rotate-45 flex-shrink-0">
              <path d="M5 7.08333V9.16667" stroke="var(--orange-500)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.833333"/>
              <path d="M3.75 4.48333C3.74992 4.63837 3.70659 4.79031 3.62488 4.92206C3.54318 5.05382 3.42634 5.16018 3.2875 5.22917L2.54583 5.60417C2.40699 5.67316 2.29015 5.77951 2.20845 5.91127C2.12675 6.04303 2.08342 6.19496 2.08333 6.35V6.66667C2.08333 6.77717 2.12723 6.88315 2.20537 6.96129C2.28351 7.03943 2.38949 7.08333 2.5 7.08333H7.5C7.61051 7.08333 7.71649 7.03943 7.79463 6.96129C7.87277 6.88315 7.91667 6.77717 7.91667 6.66667V6.35C7.91658 6.19496 7.87325 6.04303 7.79155 5.91127C7.70985 5.77951 7.59301 5.67316 7.45417 5.60417L6.7125 5.22917C6.57366 5.16018 6.45682 5.05382 6.37512 4.92206C6.29341 4.79031 6.25008 4.63837 6.25 4.48333V2.91667C6.25 2.80616 6.2939 2.70018 6.37204 2.62204C6.45018 2.5439 6.55616 2.5 6.66667 2.5C6.88768 2.5 7.09964 2.4122 7.25592 2.25592C7.4122 2.09964 7.5 1.88768 7.5 1.66667C7.5 1.44565 7.4122 1.23369 7.25592 1.07741C7.09964 0.921131 6.88768 0.833333 6.66667 0.833333H3.33333C3.11232 0.833333 2.90036 0.921131 2.74408 1.07741C2.5878 1.23369 2.5 1.44565 2.5 1.66667C2.5 1.88768 2.5878 2.09964 2.74408 2.25592C2.90036 2.4122 3.11232 2.5 3.33333 2.5C3.44384 2.5 3.54982 2.5439 3.62796 2.62204C3.7061 2.70018 3.75 2.80616 3.75 2.91667V4.48333Z" stroke="var(--orange-500)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.833333"/>
            </svg>
            <span className="text-sm font-medium text-[var(--orange-700)]">공지 1건</span>
          </div>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path
              d={noticeOpen ? "M9 7.5L6 4.5L3 7.5" : "M3 4.5L6 7.5L9 4.5"}
              stroke="var(--orange-700)" strokeLinecap="round" strokeLinejoin="round"
            />
          </svg>
        </button>
        {noticeOpen && (
          <div className="bg-[var(--status-warning-bg-subtle)] px-[10.5px] pb-[6px]">
            <div className="flex items-start gap-[5px] pt-[5px]">
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none" className="rotate-45 flex-shrink-0 mt-[3px]">
                <path d="M5 7.08333V9.16667" stroke="var(--orange-500)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.833333"/>
                <path d="M3.75 4.48333C3.74992 4.63837 3.70659 4.79031 3.62488 4.92206C3.54318 5.05382 3.42634 5.16018 3.2875 5.22917L2.54583 5.60417C2.40699 5.67316 2.29015 5.77951 2.20845 5.91127C2.12675 6.04303 2.08342 6.19496 2.08333 6.35V6.66667C2.08333 6.77717 2.12723 6.88315 2.20537 6.96129C2.28351 7.03943 2.38949 7.08333 2.5 7.08333H7.5C7.61051 7.08333 7.71649 7.03943 7.79463 6.96129C7.87277 6.88315 7.91667 6.77717 7.91667 6.66667V6.35C7.91658 6.19496 7.87325 6.04303 7.79155 5.91127C7.70985 5.77951 7.59301 5.67316 7.45417 5.60417L6.7125 5.22917C6.57366 5.16018 6.45682 5.05382 6.37512 4.92206C6.29341 4.79031 6.25008 4.63837 6.25 4.48333V2.91667C6.25 2.80616 6.2939 2.70018 6.37204 2.62204C6.45018 2.5439 6.55616 2.5 6.66667 2.5C6.88768 2.5 7.09964 2.4122 7.25592 2.25592C7.4122 2.09964 7.5 1.88768 7.5 1.66667C7.5 1.44565 7.4122 1.23369 7.25592 1.07741C7.09964 0.921131 6.88768 0.833333 6.66667 0.833333H3.33333C3.11232 0.833333 2.90036 0.921131 2.74408 1.07741C2.5878 1.23369 2.5 1.44565 2.5 1.66667C2.5 1.88768 2.5878 2.09964 2.74408 2.25592C2.90036 2.4122 3.11232 2.5 3.33333 2.5C3.44384 2.5 3.54982 2.5439 3.62796 2.62204C3.7061 2.70018 3.75 2.80616 3.75 2.91667V4.48333Z" stroke="var(--orange-500)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.833333"/>
              </svg>
              <div className="flex flex-col gap-[2px]">
                <p className="text-md text-[var(--text-main)] leading-[16.5px]">건보/자보 동시 진행 환자 — 차트 분리하여 청구</p>
                <div className="flex items-center gap-[3.5px]">
                  <span className="text-xs font-medium text-[var(--orange-700)]">김원장</span>
                  <span className="text-xs text-[var(--text-tertiary)]">3/12 10:00</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Chat Messages */}
      <div
        ref={memosScrollRef}
        className="flex-1 overflow-y-auto flex flex-col gap-[8.75px] pl-[10.5px] pr-[8px] pt-[7px] pb-[4px]"
      >
        {memos.map((m) => (
          <div key={m.id} className="flex items-start gap-[5.25px]">
            <div
              className="w-[22px] h-[22px] rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold"
              style={{ backgroundColor: m.avatarBg, color: m.avatarColor }}
            >
              {m.avatar}
            </div>
            <div className="flex flex-col gap-0">
              <span className="text-xs font-medium pl-[1.75px]" style={{ color: m.nameColor }}>{m.name}</span>
              <div className="bg-[var(--bg-subtle)] rounded-bl-[8px] rounded-br-[8px] rounded-tl-[2px] rounded-tr-[8px] px-[8.75px] pt-[5.25px] pb-[5.25px] mt-[2px]">
                <p className="text-md text-[var(--text-main)] leading-[17px] whitespace-pre-line">{m.content}</p>
              </div>
              <span className="text-micro text-[var(--text-tertiary)] pl-[1.75px] mt-[2px]">{m.time}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Memo Input — 실제 입력 + Enter/버튼 전송. Shift+Enter 로 줄바꿈. */}
      <div className="border-t border-[var(--line-subtle)] px-[7px] pt-[5.917px] pb-[7px] flex-shrink-0">
        <div className="flex items-end gap-[5.25px]">
          <input
            type="text"
            value={draft}
            onChange={e => setDraft(e.target.value)}
            onKeyDown={e => {
              if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                e.preventDefault();
                submitMemo();
              }
            }}
            placeholder={`${CURRENT_USER.name} (으)로 메모 입력...`}
            className="flex-1 border border-[var(--line-default)] rounded-[6px] px-[8.75px] py-[5.25px] h-[30px] text-md text-[var(--text-main)] outline-none focus:border-[var(--brand-primary)] placeholder:text-[rgba(41,42,45,0.5)] bg-white"
          />
          <button
            onClick={submitMemo}
            disabled={!draft.trim()}
            title="메모 전송 (Enter)"
            className={`w-[30px] h-[30px] rounded-[6px] flex items-center justify-center flex-shrink-0 transition-colors ${
              draft.trim()
                ? "bg-[var(--violet-500)] text-white hover:opacity-90"
                : "bg-[var(--bg-primary-subtle)] text-[var(--violet-500)] cursor-not-allowed opacity-60"
            }`}
          >
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
              <g clipPath="url(#clip_send_b)">
                <path d="M7.87367 11.7466C7.89425 11.7979 7.93002 11.8416 7.97619 11.872C8.02236 11.9024 8.07671 11.9179 8.13196 11.9165C8.1872 11.9151 8.24069 11.8968 8.28524 11.8641C8.32979 11.8314 8.36328 11.7859 8.38121 11.7336L11.902 1.44192C11.9194 1.39392 11.9227 1.34198 11.9116 1.29218C11.9005 1.24237 11.8754 1.19675 11.8393 1.16067C11.8032 1.12459 11.7576 1.09953 11.7078 1.08842C11.658 1.07731 11.6061 1.08062 11.5581 1.09796L1.26642 4.61879C1.21414 4.63672 1.16861 4.67021 1.13591 4.71476C1.10322 4.75931 1.08494 4.8128 1.08353 4.86804C1.08211 4.92329 1.09763 4.97764 1.128 5.02381C1.15837 5.06998 1.20213 5.10575 1.25342 5.12633L5.54883 6.84883C5.68462 6.9032 5.808 6.9845 5.91151 7.08783C6.01503 7.19117 6.09656 7.31439 6.15117 7.45008L7.87367 11.7466Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.08333"/>
                <path d="M11.8376 1.16296L5.91175 7.08825" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.08333"/>
              </g>
              <defs>
                <clipPath id="clip_send_b"><rect fill="white" width="13" height="13"/></clipPath>
              </defs>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Layout 1: 환자정보 / 바이탈 / AI 요약 / 임상메모 / 공유메모 — 세로 스택 ──
// 바이탈·공유메모 까지 Panel B 안으로 가져와 좌측 카드 컬럼이 진료 컨텍스트의 단일 진입점이 됨.
// (Layout 2 는 EmrScreen 의 별도 슬롯에서 직접 RecentVitalsPanel 을 사용하고, 공유메모는 PanelE 하단에 위치)
export function PanelB({
  clinicalNote,
  onChangeClinicalNote,
  onPatientNameClick,
  bannedDrugs,
}: {
  clinicalNote?: string;
  onChangeClinicalNote?: (v: string) => void;
  onPatientNameClick?: (
    patientId: string,
    initialTab?: "기본정보" | "내원이력" | "바이탈",
    options?: { personalEdit?: boolean },
  ) => void;
  bannedDrugs?: BannedDrug[];
}) {
  // 바이탈 패널의 "더보기" 클릭 — 현재 차트 환자(PATIENT_PROFILE = 황미진) 모달의 바이탈 탭 열기
  const openVitalsDetail = () => onPatientNameClick?.(PATIENT_PROFILE.chartNo, "바이탈");
  return (
    <PanelGroup direction="vertical" className="w-full h-full">
      <Panel defaultSize={26} minSize={18}>
        <PatientInfoCard onPatientNameClick={onPatientNameClick} bannedDrugs={bannedDrugs} />
      </Panel>
      <PanelResizeHandle className="h-1 hover:bg-[var(--brand-primary)]/30 active:bg-[var(--brand-primary)]/50 transition-colors" />
      <Panel defaultSize={14} minSize={8}>
        <RecentVitalsPanel onOpenDetail={openVitalsDetail} />
      </Panel>
      <PanelResizeHandle className="h-1 hover:bg-[var(--brand-primary)]/30 active:bg-[var(--brand-primary)]/50 transition-colors" />
      <Panel defaultSize={12} minSize={8}>
        <AISummaryCard />
      </Panel>
      <PanelResizeHandle className="h-1 hover:bg-[var(--brand-primary)]/30 active:bg-[var(--brand-primary)]/50 transition-colors" />
      <Panel defaultSize={26} minSize={15}>
        <ClinicalNoteCard clinicalNote={clinicalNote} onChangeClinicalNote={onChangeClinicalNote} />
      </Panel>
      <PanelResizeHandle className="h-1 hover:bg-[var(--brand-primary)]/30 active:bg-[var(--brand-primary)]/50 transition-colors" />
      <Panel defaultSize={22} minSize={12}>
        <SharedMemoCard />
      </Panel>
    </PanelGroup>
  );
}
