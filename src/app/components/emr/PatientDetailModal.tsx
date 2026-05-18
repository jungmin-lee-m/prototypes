// 환자 자세히보기 모달 — 진료실에서 환자명 클릭 등 다양한 진입점에서 열림
//
// 구조:
//   - Header (상시 노출): 식별(차트번호·이름·알러지·보험) / 진료 컨텍스트(좌) / 원무 컨텍스트(우)
//   - Tabs: 기본정보 ⭐ / 내원이력 / 바이탈 / 파일 / 약물 / 예약
//
// 진입점 별 첫 탭:
//   - 환자명 클릭 → "기본정보"
//   - 내원이력 자세히보기 → "내원이력"
//   - 약물 알러지 칩 클릭 → "약물"
//   - 등등 — initialTab prop 으로 제어
//
// 1단계 구현 범위: Header + 기본정보 탭. 다른 탭은 "준비 중" placeholder.

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

// ╔══════════════════════════════════════════════════════════════════════════════
// ║ 타입 정의
// ╚══════════════════════════════════════════════════════════════════════════════
export type PatientDetailTab =
  | "기본정보"
  | "내원이력"
  | "바이탈"
  | "파일"
  | "약물"
  | "예약";

// 환자 자세히보기 상세 정보 모델 — PanelA 의 Patient 보다 풍부.
// 실제로는 PanelA Patient + 원무·보험·가족 정보를 합친 형태.
export type PatientDetail = {
  // 식별
  chartNo: string;
  name: string;
  birth: string;            // "1980-07-15"
  gender: "남" | "여";
  rrn: string;              // 주민번호 (마스킹된 형태로 저장 가능)
  phone: string;
  homePhone?: string;
  emergencyPhone?: string;
  address?: string;
  occupation?: string;

  // 원내 분류
  patientGroup?: string;        // 환자그룹 (병원 자체 분류 — VIP·만성·임직원 등)
  patientTypes: string[];       // 환자유형 태그 (만성질환·고혈압·당뇨 등 다중 가능)
  // 공유메모 — 진료실의 PanelMemo 와 동일한 채팅형 메모. 환자에 묶인 다자간 메시지.
  sharedMemos: {
    id: number;
    author: string;
    authorRole?: "원장" | "간호사" | "데스크" | "기타";
    message: string;            // \n 허용
    timestamp: string;          // "3/14 11:20"
  }[];
  // 상단 고정 공지 (optional) — PanelMemo 의 공지 아코디언과 동일 개념
  notice?: {
    message: string;
    author: string;
    timestamp: string;
  };

  // 안전 정보
  drugProhibitedCount: number;  // 알러지·금기 약물 갯수 (헤더 칩에 사용)
  drugProhibited: { name: string; reason?: string }[];  // 약물 탭에서 사용

  // 보험 정보
  insurance: {
    type: "건강보험" | "의료급여" | "산재" | "일반";
    isVerified: boolean;        // 수진자조회 결과 — 자격 확인 여부
    verifiedAt?: string;        // 마지막 자격 확인 일시 (YYYY-MM-DD HH:MM)
    coverageRate: number;       // 본인부담률 (%, 예: 30 / 5 (산정특례) 등)
    cardNumber?: string;        // 보험증 번호
    coverageStart?: string;     // 자격 시작일
    coverageEnd?: string;       // 자격 종료일
    specialCoverage?: {         // 산정특례
      code: string;             // 등록 코드 (예: V193)
      diseaseName: string;      // 등록 질환명
      startDate: string;        // 시작일
      endDate: string;          // 만료일
    };
  };

  // 공단검진 — 국민건강보험공단 검진 대상·수검 내역. 검진 종류별로 행 단위 관리.
  nationalScreenings: {
    type: string;               // "일반건강검진", "위암검진", "자궁경부암검진", "대장암검진" 등
    targetYear: number;         // 대상 년도
    status: "대상" | "수검완료" | "미대상";
    lastCheckedAt?: string;     // 마지막 수검일 (있을 때만)
  }[];

  // 가족 정보
  family: {
    chartNo?: string;           // 가족 차트번호 (있으면 클릭으로 점프)
    name: string;
    relation: string;           // "딸" "배우자" "부" "모" 등
    age?: number;
  }[];

  // 원무 요약 (헤더 우측 노출)
  admin: {
    unpaidAmount: number;       // 미수금 합계
    isSelfVerified: boolean;    // 본인확인 완료 여부
    visitCount: number;         // 누적 방문 횟수
  };

  // 방문 컨텍스트 (헤더 좌측 노출)
  lastVisit?: string;           // 최근 내원일 "2026-04-12"
  nextAppointment?: string;     // 예약일 "2026-05-20"
};

// ╔══════════════════════════════════════════════════════════════════════════════
// ║ 더미 데이터 — 1단계용. 추후 patientId 기반 lookup 으로 대체.
// ╚══════════════════════════════════════════════════════════════════════════════
const DUMMY_PATIENT: PatientDetail = {
  chartNo: "100236",
  name: "황미진",
  birth: "1980-07-15",
  gender: "여",
  rrn: "800715-2******",
  phone: "010-1234-5678",
  homePhone: "02-555-1234",
  emergencyPhone: "010-9876-5432 (배우자)",
  address: "서울특별시 강남구 테헤란로 123, 4층 401호",
  occupation: "회사원",

  patientGroup: "GC Cell",
  patientTypes: ["만성질환", "고혈압", "당뇨"],
  sharedMemos: [
    { id: 1, author: "이간호사", authorRole: "간호사", message: "자보 서류 제출 완료 확인", timestamp: "3/14 11:20" },
    { id: 2, author: "박데스크", authorRole: "데스크", message: "보험사 담당자 연락처:\n010-9999-8888 (홍길동)", timestamp: "3/15 14:00" },
    { id: 3, author: "김원장", authorRole: "원장",   message: "임신성 당뇨 과거력 있음. 카페인 제한 권고.", timestamp: "3/16 09:42" },
    { id: 4, author: "이간호사", authorRole: "간호사", message: "다음 방문 시 공복혈당 재측정 필요", timestamp: "4/02 10:15" },
  ],
  notice: {
    message: "건보/자보 동시 진행 환자 — 차트 분리하여 청구",
    author: "김원장",
    timestamp: "3/12 10:00",
  },

  drugProhibitedCount: 2,
  drugProhibited: [
    { name: "페니실린", reason: "두드러기·아나필락시스" },
    { name: "아스피린", reason: "위장출혈 과거력" },
  ],

  insurance: {
    type: "건강보험",
    isVerified: true,
    verifiedAt: "2026-05-07 09:14",
    coverageRate: 30,
    cardNumber: "1-1234567890",
    coverageStart: "2024-01-01",
    coverageEnd: "2026-12-31",
    specialCoverage: {
      code: "V193",
      diseaseName: "본태성 고혈압 (산정특례)",
      startDate: "2025-07-01",
      endDate: "2026-06-30",
    },
  },

  nationalScreenings: [
    { type: "일반건강검진",     targetYear: 2026, status: "대상",     lastCheckedAt: "2024-08-15" },
    { type: "위암검진",         targetYear: 2026, status: "대상",     lastCheckedAt: "2024-08-15" },
    { type: "자궁경부암검진",   targetYear: 2026, status: "수검완료", lastCheckedAt: "2026-02-10" },
  ],

  family: [
    { chartNo: "100412", name: "김허나", relation: "딸", age: 19 },
    { chartNo: "100089", name: "박혜은", relation: "배우자", age: 48 },
  ],

  admin: {
    unpaidAmount: 12300,
    isSelfVerified: true,
    visitCount: 24,
  },

  lastVisit: "2026-04-12",
  nextAppointment: "2026-05-20",
};

// ╔══════════════════════════════════════════════════════════════════════════════
// ║ 유틸
// ╚══════════════════════════════════════════════════════════════════════════════
// 생년월일 ISO → "만 나이" 계산
const calcAge = (birthISO: string): number => {
  const b = new Date(birthISO);
  if (Number.isNaN(b.getTime())) return 0;
  const now = new Date();
  let age = now.getFullYear() - b.getFullYear();
  const m = now.getMonth() - b.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < b.getDate())) age--;
  return age;
};

// ISO 날짜를 "YYYY.MM.DD" 로 포맷
const fmtDate = (iso: string): string => iso.replaceAll("-", ".");

// 산정특례 만료까지 남은 일수
const daysUntil = (iso: string): number => {
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return 0;
  return Math.ceil((t - Date.now()) / (1000 * 60 * 60 * 24));
};

// ╔══════════════════════════════════════════════════════════════════════════════
// ║ 메인 컴포넌트
// ╚══════════════════════════════════════════════════════════════════════════════
export function PatientDetailModal({
  // patientId,  // 1단계는 더미 데이터만 사용 — patientId 기반 lookup 은 추후 구현
  initialTab = "기본정보",
  onClose,
}: {
  patientId?: string;
  initialTab?: PatientDetailTab;
  onClose: () => void;
}) {
  const [activeTab, setActiveTab] = useState<PatientDetailTab>(initialTab);
  const [show, setShow] = useState(false);
  const p = DUMMY_PATIENT;  // 1단계: 더미 단일 환자

  // 페이드 인 애니메이션
  useEffect(() => {
    const id = window.setTimeout(() => setShow(true), 10);
    return () => window.clearTimeout(id);
  }, []);

  // ESC 키로 닫기
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const TABS: PatientDetailTab[] = ["기본정보", "내원이력", "바이탈", "파일", "약물", "예약"];

  return createPortal(
    <div
      className={`fixed inset-0 z-[9990] flex items-center justify-center bg-black/40 transition-opacity duration-150 ${
        show ? "opacity-100" : "opacity-0"
      }`}
      onClick={onClose}
    >
      <div
        className="bg-[var(--bg-base)] rounded-2xl shadow-2xl w-[1200px] max-w-[95vw] max-h-[92vh] overflow-hidden flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* ── 헤더 ── */}
        <PatientDetailHeader
          p={p}
          onClose={onClose}
          onChipClick={(target) => setActiveTab(target)}
        />

        {/* ── 탭 바 ── */}
        <div className="flex items-center px-3 bg-white border-b border-[var(--line-default)] flex-shrink-0">
          {TABS.map(t => {
            const active = t === activeTab;
            return (
              <button
                key={t}
                onClick={() => setActiveTab(t)}
                className={`relative h-8 px-3 text-sm font-medium transition-colors ${
                  active
                    ? "text-[var(--brand-primary)]"
                    : "text-[var(--text-sub)] hover:text-[var(--text-main)]"
                }`}
              >
                {t}
                {active && (
                  <span className="absolute left-0 right-0 bottom-0 h-0.5 bg-[var(--brand-primary)]" />
                )}
              </button>
            );
          })}
        </div>

        {/* ── 탭 본문 — overflow 는 각 탭이 자체 관리 (기본정보의 좌측 stack vs 우측 chat 처럼) ── */}
        <div className="flex-1 min-h-0 bg-[var(--bg-subtle)]">
          {activeTab === "기본정보" && <BasicInfoTab p={p} />}
          {activeTab !== "기본정보" && <PlaceholderTab name={activeTab} />}
        </div>
      </div>
    </div>,
    document.body,
  );
}

// ╔══════════════════════════════════════════════════════════════════════════════
// ║ 헤더 — 식별 + 진료 컨텍스트(좌) + 원무 컨텍스트(우)
// ╚══════════════════════════════════════════════════════════════════════════════
function PatientDetailHeader({
  p,
  onClose,
  onChipClick,
}: {
  p: PatientDetail;
  onClose: () => void;
  onChipClick: (tab: PatientDetailTab) => void;
}) {
  const age = calcAge(p.birth);
  const sc = p.insurance.specialCoverage;
  const scDaysLeft = sc ? daysUntil(sc.endDate) : null;
  const scExpiring = scDaysLeft !== null && scDaysLeft <= 60 && scDaysLeft >= 0;

  return (
    <div className="flex-shrink-0 border-b border-[var(--line-default)] bg-white">
      {/* Title row — 팝업 제목 + 닫기만. 편집 아이콘 제거. */}
      <div className="flex items-center justify-between px-4 h-9 border-b border-[var(--line-subtle)]">
        <h2 className="text-md font-bold text-[var(--text-main)]">환자 상세정보</h2>
        <button
          onClick={onClose}
          title="닫기 (ESC)"
          className="w-6 h-6 rounded-sm text-[var(--text-tertiary)] hover:text-[var(--text-main)] hover:bg-[var(--bg-subtle)] flex items-center justify-center text-md leading-none"
        >
          ✕
        </button>
      </div>

      {/* Body — 3-col: 환자 식별(좌) | 진료 컨텍스트(중) | 원무 컨텍스트(우).
          기존엔 식별이 빈 공간을 많이 차지했는데, 이제 우측에 요약 정보를 같이 두어 공간 효율화. */}
      <div className="flex">
        {/* 좌측: 환자 식별 stack — bg-subtle 배경 + 굵은 값 텍스트로 "ID 카드" 영역임을 시각적으로 강조 */}
        <div className="flex-[3] px-4 py-2.5 flex flex-col gap-1 border-r border-[var(--line-subtle)] bg-[var(--bg-subtle)] min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-[var(--text-tertiary)] tabular-nums">{p.chartNo}</span>
            <span className="text-[17px] font-bold text-[var(--text-main)]">{p.name}</span>
            {/* 알러지·금기약물 칩 — 안전 critical, 진료 전 항상 확인 필요 */}
            {p.drugProhibitedCount > 0 && (
              <button
                onClick={() => onChipClick("약물")}
                title={`처방금지·알러지 약물 ${p.drugProhibitedCount}건 — 클릭하여 약물 탭으로 이동`}
                className="flex items-center gap-0.5 h-5 px-1.5 rounded-sm bg-[var(--status-error-bg-subtle)] border border-[var(--status-error-line)] hover:brightness-95 transition"
              >
                <span className="text-xs text-[var(--red-500)]">🚫</span>
                <span className="text-xs font-bold text-[var(--status-error-text-main)] tabular-nums">{p.drugProhibitedCount}</span>
              </button>
            )}
          </div>
          {/* 값 텍스트들 — text-main + font-medium 으로 위계 상승 (기존 text-sub 보다 강조) */}
          <div className="text-sm font-medium text-[var(--text-main)] tabular-nums">
            {fmtDate(p.birth)} <span className="font-normal text-[var(--text-tertiary)]">·</span> 만 {age}세 <span className="font-normal text-[var(--text-tertiary)]">·</span> {p.gender}
          </div>
          <div className="text-sm font-medium text-[var(--text-main)] tabular-nums">{p.phone}</div>
          <div className="text-xs font-medium text-[var(--text-sub)] tabular-nums">{p.rrn}</div>
        </div>

        {/* 중간: 진료 컨텍스트 */}
        <div className="flex-[4] px-4 py-2 grid grid-cols-[64px_1fr] gap-y-1 gap-x-2 items-center border-r border-[var(--line-subtle)] min-w-0">
          <span className="text-xs text-[var(--text-tertiary)]">최근내원</span>
          <span className="text-sm text-[var(--text-main)] tabular-nums">{p.lastVisit ? fmtDate(p.lastVisit) : "—"}</span>

          <span className="text-xs text-[var(--text-tertiary)]">예약일</span>
          <button
            onClick={() => onChipClick("예약")}
            className={`text-sm text-left tabular-nums hover:underline ${
              p.nextAppointment ? "text-[var(--red-500)] font-medium" : "text-[var(--text-tertiary)]"
            }`}
            title="예약 탭으로 이동"
          >
            {p.nextAppointment ? fmtDate(p.nextAppointment) : "예약 없음"}
          </button>

          <span className="text-xs text-[var(--text-tertiary)]">환자그룹</span>
          <span className="text-sm text-[var(--text-main)]">{p.patientGroup ?? "—"}</span>

          <span className="text-xs text-[var(--text-tertiary)]">환자유형</span>
          <div className="flex items-center gap-1 flex-wrap">
            {p.patientTypes.length === 0
              ? <span className="text-sm text-[var(--text-tertiary)]">—</span>
              : p.patientTypes.map(t => (
                <span key={t} className="px-1.5 h-[18px] rounded-sm bg-[var(--bg-primary-subtle)] text-xs text-[var(--brand-primary)] flex items-center font-medium">
                  {t}
                </span>
              ))}
          </div>

          <span className="text-xs text-[var(--text-tertiary)]">가족</span>
          <div className="flex items-center gap-1 flex-wrap text-sm text-[var(--text-main)]">
            {p.family.length === 0
              ? <span className="text-[var(--text-tertiary)]">—</span>
              : p.family.map((f, i) => (
                <span key={i} className="text-sm">
                  {/* 가족 이름 폰트 — 다른 필드 텍스트와 동일한 text-sm 명시. base button 의 16px 기본값을 덮어씀. */}
                  <button
                    className="text-sm hover:underline hover:text-[var(--brand-primary)]"
                    title={f.chartNo ? `차트 ${f.chartNo} 로 이동` : ""}
                  >
                    {f.name}
                  </button>
                  <span className="text-[var(--text-tertiary)]"> ({f.relation})</span>
                  {i < p.family.length - 1 && <span className="text-[var(--text-tertiary)]"> · </span>}
                </span>
              ))}
          </div>
        </div>

        {/* 우측: 원무 컨텍스트 */}
        <div className="flex-[3] px-4 py-2 grid grid-cols-[64px_1fr] gap-y-1 gap-x-2 items-center min-w-0">
          <span className="text-xs text-[var(--text-tertiary)]">미수금</span>
          <button
            onClick={() => onChipClick("내원이력")}
            className={`text-left tabular-nums hover:underline ${
              p.admin.unpaidAmount > 0
                ? "text-sm font-bold text-[var(--red-500)]"
                : "text-sm text-[var(--text-sub)]"
            }`}
            title={p.admin.unpaidAmount > 0 ? "내원이력 탭의 미수 회차로 이동" : ""}
          >
            ₩{p.admin.unpaidAmount.toLocaleString()}
            {p.admin.unpaidAmount > 0 && " ⚠"}
          </button>

          <span className="text-xs text-[var(--text-tertiary)]">본인확인</span>
          <span className={`text-sm font-medium ${p.admin.isSelfVerified ? "text-[var(--green-700)]" : "text-[var(--text-tertiary)]"}`}>
            {p.admin.isSelfVerified ? "✓ 확인됨" : "미확인"}
          </span>

          <span className="text-xs text-[var(--text-tertiary)]">본인부담률</span>
          <span className="text-sm text-[var(--text-main)] tabular-nums">{p.insurance.coverageRate}%</span>

          <span className="text-xs text-[var(--text-tertiary)]">산정특례</span>
          {sc ? (
            <button
              onClick={() => onChipClick("기본정보")}
              className={`text-left tabular-nums hover:underline ${
                scExpiring ? "text-sm font-medium text-[var(--orange-700)]" : "text-sm text-[var(--text-sub)]"
              }`}
              title="기본정보 탭의 보험 섹션으로 이동"
            >
              D-{scDaysLeft} {scExpiring && "⚠"}
            </button>
          ) : (
            <span className="text-sm text-[var(--text-tertiary)]">미등록</span>
          )}

          <span className="text-xs text-[var(--text-tertiary)]">누적 방문</span>
          <span className="text-sm text-[var(--text-main)] tabular-nums">{p.admin.visitCount}회</span>
        </div>
      </div>
    </div>
  );
}

// ╔══════════════════════════════════════════════════════════════════════════════
// ║ 탭 1. 기본정보
// ╚══════════════════════════════════════════════════════════════════════════════
function BasicInfoTab({ p }: { p: PatientDetail }) {
  return (
    // 좌(주요 정보 4섹션, 자체 스크롤) | 우(공유메모 — 채팅 세로 스택, 탭 본문 전체 높이)
    <div className="p-2 grid grid-cols-[2fr_1fr] gap-2 h-full min-h-0 overflow-hidden">
      {/* ── 좌측: 인적사항·기타정보 (2-col) → 보험 → 공단검진. 길어지면 자체 스크롤. ── */}
      <div className="flex flex-col gap-2 min-w-0 overflow-y-auto pr-1">
        <div className="grid grid-cols-2 gap-2">
          <PersonalInfoSection p={p} />
          <EtcInfoSection p={p} />
        </div>

      {/* 보험정보 — 좌측 컬럼 내부의 full-width */}
      <div>
        <SectionCard
          title="보험정보"
          actionLabel="재조회"
          actionIcon="↻"
        >
          {/* 자격 정보 — 상단 grid */}
          <div className="grid grid-cols-4 gap-x-3 gap-y-1 pb-2 border-b border-[var(--line-subtle)]">
            <Field label="보험유형" value={p.insurance.type} />
            <Field label="본인부담률" value={`${p.insurance.coverageRate}%`} />
            <Field label="자격 확인">
              {p.insurance.isVerified ? (
                <span className="text-sm font-medium text-[var(--green-700)]">
                  ✓ 확인됨
                  {p.insurance.verifiedAt && (
                    <span className="ml-1 text-xs text-[var(--text-tertiary)] tabular-nums">
                      ({p.insurance.verifiedAt})
                    </span>
                  )}
                </span>
              ) : (
                <span className="text-sm text-[var(--red-500)] font-medium">⚠ 미확인</span>
              )}
            </Field>
            <Field label="보험증" value={p.insurance.cardNumber ?? "—"} />
            <Field label="시작일" value={p.insurance.coverageStart ? fmtDate(p.insurance.coverageStart) : "—"} />
            <Field label="종료일" value={p.insurance.coverageEnd ? fmtDate(p.insurance.coverageEnd) : "—"} />
          </div>

          {/* 산정특례 — 별도 sub-section */}
          <div className="pt-2">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-[var(--text-main)]">산정특례</span>
              {p.insurance.specialCoverage ? (
                <button className="text-xs text-[var(--brand-primary)] hover:underline">수정</button>
              ) : (
                <button className="text-xs text-[var(--brand-primary)] hover:underline">+ 등록</button>
              )}
            </div>
            {p.insurance.specialCoverage ? (
              <div className="grid grid-cols-4 gap-x-3 gap-y-1 bg-[var(--bg-subtle)] rounded-md p-2">
                <Field label="등록 코드" value={p.insurance.specialCoverage.code} />
                <Field label="질환명" value={p.insurance.specialCoverage.diseaseName} />
                <Field label="시작일" value={fmtDate(p.insurance.specialCoverage.startDate)} />
                <Field label="만료일">
                  <span className="text-sm tabular-nums text-[var(--text-main)]">
                    {fmtDate(p.insurance.specialCoverage.endDate)}
                    <span className={`ml-1 text-xs font-medium ${
                      daysUntil(p.insurance.specialCoverage.endDate) <= 60
                        ? "text-[var(--orange-700)]"
                        : "text-[var(--text-tertiary)]"
                    }`}>
                      (D-{daysUntil(p.insurance.specialCoverage.endDate)})
                    </span>
                  </span>
                </Field>
              </div>
            ) : (
              <p className="text-xs text-[var(--text-tertiary)] py-1">등록된 산정특례 없음</p>
            )}
          </div>
        </SectionCard>
      </div>

      {/* 공단검진 — 보험정보와 보조적 정보. 검진 종류별로 행 단위 노출. */}
      <div>
        <SectionCard
          title="공단검진"
          actionLabel="재조회"
          actionIcon="↻"
        >
          {p.nationalScreenings.length === 0 ? (
            <p className="text-xs text-[var(--text-tertiary)]">조회된 공단검진 없음</p>
          ) : (
            <div className="divide-y divide-[var(--line-subtle)]">
              {p.nationalScreenings.map((s, i) => {
                // 상태 → 색상 매핑. 대상=blue, 수검완료=green, 미대상=gray.
                const statusStyle =
                  s.status === "대상"     ? "text-[var(--status-info-text-main)] bg-[var(--status-info-bg-subtle)] border-[var(--status-info-line)]" :
                  s.status === "수검완료" ? "text-[var(--green-700)] bg-[var(--status-success-bg-subtle)] border-[var(--status-success-line)]" :
                                            "text-[var(--text-tertiary)] bg-[var(--bg-subtle)] border-[var(--line-default)]";
                return (
                  <div key={i} className="flex items-center py-1.5 gap-3">
                    <span className="text-sm text-[var(--text-main)] w-32 flex-shrink-0">{s.type}</span>
                    <span className="text-xs text-[var(--text-sub)] tabular-nums w-20 flex-shrink-0">{s.targetYear}년</span>
                    <span className={`text-xs font-medium px-1.5 h-[18px] rounded-sm border inline-flex items-center ${statusStyle}`}>
                      {s.status === "수검완료" && "✓ "}{s.status}
                    </span>
                    <div className="flex-1" />
                    {s.lastCheckedAt && (
                      <span className="text-xs text-[var(--text-tertiary)] tabular-nums">
                        최종 {fmtDate(s.lastCheckedAt)}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </SectionCard>
      </div>

      {/* 가족정보 카드는 기타정보 sub-section 으로 통합됨 (위 SectionCard "기타정보" 참고) */}
      </div> {/* end of 좌측 컬럼 flex-col */}

      {/* ── 우측: 공유메모 — 채팅 세로 스택. 탭 본문 높이 전체 사용. ── */}
      <SharedMemoCard memos={p.sharedMemos} notice={p.notice} />
    </div>
  );
}

// ╔══════════════════════════════════════════════════════════════════════════════
// ║ 공유메모 — 진료실 PanelMemo 와 동일 패턴, 세로 chat 스택 + 공지 + 입력
// ╚══════════════════════════════════════════════════════════════════════════════
// 작성자 역할 → 아바타 색상 매핑 (PanelMemo 와 동일 톤)
const ROLE_COLORS: Record<NonNullable<PatientDetail["sharedMemos"][number]["authorRole"]>, { bg: string; fg: string }> = {
  원장:   { bg: "var(--violet-050)", fg: "var(--violet-500)" },
  간호사: { bg: "var(--bg-primary-subtle)", fg: "var(--blue-500)" },
  데스크: { bg: "var(--status-warning-bg-subtle)", fg: "var(--orange-500)" },
  기타:   { bg: "var(--bg-subtle)", fg: "var(--text-sub)" },
};

function SharedMemoCard({
  memos,
  notice,
}: {
  memos: PatientDetail["sharedMemos"];
  notice?: PatientDetail["notice"];
}) {
  const [noticeOpen, setNoticeOpen] = useState(true);

  return (
    <div className="bg-white border border-[var(--line-default)] rounded-md flex flex-col min-h-0 overflow-hidden">
      {/* 헤더 */}
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-[var(--line-subtle)] flex-shrink-0">
        <div className="flex items-center gap-1.5">
          <h3 className="text-sm font-bold text-[var(--text-main)]">공유메모</h3>
          {memos.length > 0 && (
            <span className="text-xs text-[var(--text-tertiary)] tabular-nums">{memos.length}건</span>
          )}
        </div>
        <button className="text-xs text-[var(--brand-primary)] hover:underline">전체보기</button>
      </div>

      {/* 공지 아코디언 (있을 때만) */}
      {notice && (
        <div className="border-b border-[var(--line-subtle)] flex-shrink-0">
          <button
            onClick={() => setNoticeOpen(v => !v)}
            className="w-full bg-[var(--status-warning-bg-subtle)] flex items-center justify-between px-2 py-1"
          >
            <span className="text-xs font-medium text-[var(--orange-700)]">📌 공지 1건</span>
            <span className="text-xs text-[var(--orange-700)]">{noticeOpen ? "▲" : "▼"}</span>
          </button>
          {noticeOpen && (
            <div className="bg-[var(--status-warning-bg-subtle)] px-3 py-1.5">
              <p className="text-sm text-[var(--text-main)] leading-snug whitespace-pre-line">{notice.message}</p>
              <div className="flex items-center gap-1 mt-1">
                <span className="text-xs font-medium text-[var(--orange-700)]">{notice.author}</span>
                <span className="text-xs text-[var(--text-tertiary)] tabular-nums">{notice.timestamp}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 채팅 메시지 스택 — 세로로 길게, 스크롤 */}
      <div className="flex-1 overflow-y-auto flex flex-col gap-2 px-2.5 py-2">
        {memos.length === 0 ? (
          <p className="text-xs text-[var(--text-tertiary)] text-center py-6">등록된 메모 없음</p>
        ) : (
          memos.map(m => {
            const colors = ROLE_COLORS[m.authorRole ?? "기타"];
            const initial = m.author.charAt(0);
            return (
              <div key={m.id} className="flex items-start gap-1.5">
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold"
                  style={{ backgroundColor: colors.bg, color: colors.fg }}
                >
                  {initial}
                </div>
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="text-xs font-medium" style={{ color: colors.fg }}>{m.author}</span>
                  <div className="bg-[var(--bg-subtle)] rounded-[8px] rounded-tl-[2px] px-2 py-1 mt-0.5">
                    <p className="text-sm text-[var(--text-main)] leading-snug whitespace-pre-line break-words">{m.message}</p>
                  </div>
                  <span className="text-micro text-[var(--text-tertiary)] mt-0.5 tabular-nums">{m.timestamp}</span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 입력 영역 */}
      <div className="border-t border-[var(--line-subtle)] px-2 py-1.5 flex-shrink-0">
        <div className="flex items-end gap-1.5">
          <input
            type="text"
            placeholder="메모 입력..."
            className="flex-1 h-7 px-2 text-sm border border-[var(--line-default)] rounded-md outline-none focus:border-[var(--brand-primary)] bg-white placeholder:text-[var(--text-placeholder)]"
          />
          <button className="h-7 px-2.5 rounded-md bg-[var(--bg-primary-subtle)] text-[var(--brand-primary)] hover:bg-[var(--brand-primary)] hover:text-white transition-colors text-xs font-bold">
            전송
          </button>
        </div>
      </div>
    </div>
  );
}

// ╔══════════════════════════════════════════════════════════════════════════════
// ║ 다른 탭들 — 1단계는 placeholder
// ╚══════════════════════════════════════════════════════════════════════════════
function PlaceholderTab({ name }: { name: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-full py-20 text-[var(--text-tertiary)]">
      <span className="text-3xl mb-2">🚧</span>
      <p className="text-sm font-medium">{name} 탭 — 준비 중</p>
      <p className="text-xs mt-1">2단계 이후 구현 예정</p>
    </div>
  );
}

// ╔══════════════════════════════════════════════════════════════════════════════
// ║ 공통 UI 컴포넌트
// ╚══════════════════════════════════════════════════════════════════════════════
function SectionCard({
  title,
  actionLabel,
  actionIcon,
  actions,
  onAction,
  children,
}: {
  title: string;
  actionLabel?: string;
  actionIcon?: string;
  actions?: React.ReactNode;       // 편집/저장/취소 등 커스텀 액션 묶음 (있으면 actionLabel 무시)
  onAction?: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white border border-[var(--line-default)] rounded-md flex flex-col">
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-[var(--line-subtle)]">
        <h3 className="text-sm font-bold text-[var(--text-main)]">{title}</h3>
        {actions ?? (actionLabel && (
          <button onClick={onAction} className="text-xs text-[var(--brand-primary)] hover:underline flex items-center gap-1">
            {actionIcon && <span>{actionIcon}</span>}
            {actionLabel}
          </button>
        ))}
      </div>
      <div className="px-3 py-2 flex-1">
        {children}
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  children,
}: {
  label: string;
  value?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex items-baseline gap-2 py-0.5">
      <span className="text-xs text-[var(--text-tertiary)] w-16 flex-shrink-0">{label}</span>
      <div className="flex-1 min-w-0">
        {children ?? <span className="text-sm text-[var(--text-main)]">{value ?? "—"}</span>}
      </div>
    </div>
  );
}

// ╔══════════════════════════════════════════════════════════════════════════════
// ║ 편집 가능 Field — editing=true 면 <input>, false 면 <span> 으로 디스플레이
// ╚══════════════════════════════════════════════════════════════════════════════
function EditableField({
  label,
  value,
  editing,
  onChange,
  type = "text",
  placeholder,
}: {
  label: string;
  value: string;
  editing: boolean;
  onChange: (v: string) => void;
  type?: "text" | "date" | "tel";
  placeholder?: string;
}) {
  return (
    <div className="flex items-center gap-2 py-0.5 min-h-[24px]">
      <span className="text-xs text-[var(--text-tertiary)] w-16 flex-shrink-0">{label}</span>
      <div className="flex-1 min-w-0">
        {editing ? (
          <input
            type={type}
            value={value}
            onChange={e => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full h-6 px-1.5 text-sm border border-[var(--line-default)] rounded-sm bg-white outline-none focus:border-[var(--brand-primary)] placeholder:text-[var(--text-placeholder)]"
          />
        ) : (
          <span className="text-sm text-[var(--text-main)] truncate block">{value || "—"}</span>
        )}
      </div>
    </div>
  );
}

// ╔══════════════════════════════════════════════════════════════════════════════
// ║ 편집 액션 그룹 — 편집 / 저장 + 취소 토글
// ╚══════════════════════════════════════════════════════════════════════════════
function EditActions({
  editing,
  onEdit,
  onSave,
  onCancel,
}: {
  editing: boolean;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
}) {
  if (!editing) {
    return (
      <button onClick={onEdit} className="text-xs text-[var(--brand-primary)] hover:underline">
        편집
      </button>
    );
  }
  return (
    <div className="flex items-center gap-2">
      <button onClick={onCancel} className="text-xs text-[var(--text-tertiary)] hover:text-[var(--text-main)]">
        취소
      </button>
      <button onClick={onSave} className="text-xs text-[var(--brand-primary)] font-bold hover:underline">
        저장
      </button>
    </div>
  );
}

// ╔══════════════════════════════════════════════════════════════════════════════
// ║ 인적사항 섹션 — 편집 모드 토글
// ╚══════════════════════════════════════════════════════════════════════════════
type PersonalForm = {
  name: string; rrn: string; birth: string; gender: "남" | "여";
  phone: string; homePhone: string; emergencyPhone: string; address: string; occupation: string;
};
const personalFromPatient = (p: PatientDetail): PersonalForm => ({
  name: p.name, rrn: p.rrn, birth: p.birth, gender: p.gender,
  phone: p.phone, homePhone: p.homePhone ?? "", emergencyPhone: p.emergencyPhone ?? "",
  address: p.address ?? "", occupation: p.occupation ?? "",
});

function PersonalInfoSection({ p }: { p: PatientDetail }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<PersonalForm>(() => personalFromPatient(p));

  const startEdit = () => { setForm(personalFromPatient(p)); setEditing(true); };
  const cancel    = () => { setForm(personalFromPatient(p)); setEditing(false); };
  const save      = () => {
    // 1단계 prototype — 실제 저장 로직 없음. 로컬 state 유지.
    console.log("[저장] 인적사항:", form);
    setEditing(false);
  };
  const set = <K extends keyof PersonalForm>(k: K, v: PersonalForm[K]) => setForm(f => ({ ...f, [k]: v }));

  return (
    <SectionCard
      title="인적사항"
      actions={<EditActions editing={editing} onEdit={startEdit} onSave={save} onCancel={cancel} />}
    >
      <EditableField label="이름"       value={form.name}            editing={editing} onChange={v => set("name", v)} />
      <EditableField label="주민번호"   value={form.rrn}             editing={editing} onChange={v => set("rrn", v)} />
      <EditableField label="생년월일"   value={form.birth}           editing={editing} type="date" onChange={v => set("birth", v)} />
      {/* 성별은 select 가 더 적합하지만, 1단계는 단순 text input 으로 유지 */}
      <EditableField label="성별"       value={form.gender}          editing={editing} onChange={v => set("gender", (v === "남" ? "남" : "여"))} />
      <EditableField label="휴대폰"     value={form.phone}           editing={editing} type="tel" onChange={v => set("phone", v)} />
      <EditableField label="자택"       value={form.homePhone}       editing={editing} type="tel" onChange={v => set("homePhone", v)} />
      <EditableField label="비상연락처" value={form.emergencyPhone}  editing={editing} type="tel" onChange={v => set("emergencyPhone", v)} />
      <EditableField label="주소"       value={form.address}         editing={editing} onChange={v => set("address", v)} />
      <EditableField label="직업"       value={form.occupation}      editing={editing} onChange={v => set("occupation", v)} />
    </SectionCard>
  );
}

// ╔══════════════════════════════════════════════════════════════════════════════
// ║ 기타정보 섹션 — 환자그룹·환자유형(태그)·가족. 편집 모드 토글.
// ╚══════════════════════════════════════════════════════════════════════════════
type EtcForm = {
  patientGroup: string;
  patientTypes: string[];
  family: PatientDetail["family"];
};
const etcFromPatient = (p: PatientDetail): EtcForm => ({
  patientGroup: p.patientGroup ?? "",
  patientTypes: [...p.patientTypes],
  family: p.family.map(f => ({ ...f })),
});

function EtcInfoSection({ p }: { p: PatientDetail }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<EtcForm>(() => etcFromPatient(p));
  const [newTag, setNewTag] = useState("");

  const startEdit = () => { setForm(etcFromPatient(p)); setNewTag(""); setEditing(true); };
  const cancel    = () => { setForm(etcFromPatient(p)); setNewTag(""); setEditing(false); };
  const save      = () => {
    console.log("[저장] 기타정보:", form);
    setEditing(false);
  };

  const addTag = () => {
    const t = newTag.trim();
    if (!t || form.patientTypes.includes(t)) return;
    setForm(f => ({ ...f, patientTypes: [...f.patientTypes, t] }));
    setNewTag("");
  };
  const removeTag = (t: string) =>
    setForm(f => ({ ...f, patientTypes: f.patientTypes.filter(x => x !== t) }));

  const addFamily = () =>
    setForm(f => ({ ...f, family: [...f.family, { name: "", relation: "" }] }));
  const removeFamily = (i: number) =>
    setForm(f => ({ ...f, family: f.family.filter((_, idx) => idx !== i) }));
  const updateFamily = (i: number, patch: Partial<PatientDetail["family"][number]>) =>
    setForm(f => ({ ...f, family: f.family.map((m, idx) => idx === i ? { ...m, ...patch } : m) }));

  return (
    <SectionCard
      title="기타정보"
      actions={<EditActions editing={editing} onEdit={startEdit} onSave={save} onCancel={cancel} />}
    >
      <EditableField label="환자그룹" value={form.patientGroup} editing={editing} onChange={v => setForm(f => ({ ...f, patientGroup: v }))} />

      {/* 환자유형 — 칩 형태. 편집 모드일 땐 ✕ + 추가 input 노출. */}
      <div className="flex items-start gap-2 py-0.5 min-h-[24px]">
        <span className="text-xs text-[var(--text-tertiary)] w-16 flex-shrink-0 pt-0.5">환자유형</span>
        <div className="flex-1 min-w-0 flex items-center gap-1 flex-wrap">
          {form.patientTypes.length === 0 && !editing && (
            <span className="text-sm text-[var(--text-tertiary)]">—</span>
          )}
          {form.patientTypes.map(t => (
            <span key={t} className="inline-flex items-center gap-0.5 px-1.5 h-[18px] rounded-sm bg-[var(--bg-primary-subtle)] text-xs text-[var(--brand-primary)] font-medium">
              {t}
              {editing && (
                <button
                  onClick={() => removeTag(t)}
                  className="ml-0.5 w-3 h-3 flex items-center justify-center text-[10px] leading-none hover:text-[var(--red-500)]"
                  title={`${t} 태그 삭제`}
                >
                  ✕
                </button>
              )}
            </span>
          ))}
          {editing && (
            <div className="inline-flex items-center gap-1">
              <input
                value={newTag}
                onChange={e => setNewTag(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }}
                placeholder="태그 추가"
                className="h-[18px] w-20 px-1 text-xs border border-[var(--line-default)] rounded-sm bg-white outline-none focus:border-[var(--brand-primary)]"
              />
              <button
                onClick={addTag}
                disabled={!newTag.trim()}
                className="text-xs text-[var(--brand-primary)] hover:underline disabled:text-[var(--text-disabled)] disabled:cursor-not-allowed"
              >
                추가
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 가족 sub-section */}
      <div className="pt-2 mt-2 border-t border-[var(--line-subtle)]">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-bold text-[var(--text-main)]">가족</span>
          {editing && (
            <button onClick={addFamily} className="text-xs text-[var(--brand-primary)] hover:underline">
              + 추가
            </button>
          )}
        </div>
        {form.family.length === 0 ? (
          <p className="text-xs text-[var(--text-tertiary)] py-1">등록된 가족 없음</p>
        ) : (
          <div className="divide-y divide-[var(--line-subtle)]">
            {form.family.map((f, i) => (
              <div key={i} className="flex items-center py-1 gap-2 min-w-0">
                {editing ? (
                  <>
                    <input
                      value={f.name}
                      onChange={e => updateFamily(i, { name: e.target.value })}
                      placeholder="이름"
                      className="h-6 w-20 px-1.5 text-sm border border-[var(--line-default)] rounded-sm bg-white outline-none focus:border-[var(--brand-primary)] flex-shrink-0"
                    />
                    <input
                      value={f.relation}
                      onChange={e => updateFamily(i, { relation: e.target.value })}
                      placeholder="관계"
                      className="h-6 w-16 px-1.5 text-xs border border-[var(--line-default)] rounded-sm bg-white outline-none focus:border-[var(--brand-primary)] flex-shrink-0"
                    />
                    <input
                      type="number"
                      value={f.age ?? ""}
                      onChange={e => updateFamily(i, { age: e.target.value ? Number(e.target.value) : undefined })}
                      placeholder="나이"
                      className="h-6 w-14 px-1.5 text-xs border border-[var(--line-default)] rounded-sm bg-white outline-none focus:border-[var(--brand-primary)] tabular-nums flex-shrink-0"
                    />
                    <div className="flex-1" />
                    <button
                      onClick={() => removeFamily(i)}
                      title="가족 행 삭제"
                      className="w-5 h-5 flex items-center justify-center text-xs text-[var(--text-tertiary)] hover:text-[var(--red-500)] flex-shrink-0"
                    >
                      ✕
                    </button>
                  </>
                ) : (
                  <>
                    <span className="text-sm font-medium text-[var(--text-main)] flex-shrink-0">{f.name}</span>
                    <span className="text-xs text-[var(--text-sub)] flex-shrink-0">({f.relation})</span>
                    {f.age !== undefined && (
                      <span className="text-xs text-[var(--text-tertiary)] tabular-nums flex-shrink-0">만 {f.age}세</span>
                    )}
                    <div className="flex-1" />
                    {f.chartNo && (
                      <button className="text-xs text-[var(--brand-primary)] hover:underline tabular-nums flex-shrink-0">
                        차트 {f.chartNo} →
                      </button>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </SectionCard>
  );
}
