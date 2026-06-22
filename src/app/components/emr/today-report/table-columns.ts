// 수납완료 환자 목록 표 — 컬럼 정의 (SettledPatientsTable + ExcelExportModal 공용)
// 출처: nextemr-docs chart-prototype/_components/today-report/table-columns.ts (그대로 이식)

export type ColId =
  | "chartNo" | "name" | "gender" | "age" | "rrn" | "phone" | "insType" | "visitorType"
  | "visitTime" | "visitOrder" | "doctor"
  | "total" | "nhis" | "selfPay" | "noPay"
  | "settledTime" | "card" | "cash" | "unpaid";

export type ColGroup = "환자정보" | "진료정보" | "진료비 산정" | "결제";

export type SortKey = "name" | "gender" | "visitTime" | "settledTime" | "total" | "nhis" | "selfPay" | "noPay";

export interface ColDef {
  id: ColId;
  label: string;
  group: ColGroup;
  width?: string;
  align: "left" | "center" | "right";
  sortable?: SortKey;
}

export const COL_GROUPS: ColGroup[] = ["환자정보", "진료정보", "진료비 산정", "결제"];

export const ALL_COLUMNS: ColDef[] = [
  { id: "chartNo",     label: "차트번호", group: "환자정보",    width: "48px",  align: "center" },
  { id: "name",        label: "이름",     group: "환자정보",    width: "60px",  align: "center", sortable: "name" },
  { id: "gender",      label: "성별",     group: "환자정보",    width: "36px",  align: "center", sortable: "gender" },
  { id: "age",         label: "나이",     group: "환자정보",    width: "36px",  align: "center" },
  { id: "rrn",         label: "주민번호", group: "환자정보",    width: "124px", align: "center" },
  { id: "phone",       label: "핸드폰",   group: "환자정보",    width: "116px", align: "center" },
  { id: "insType",     label: "보험",     group: "환자정보",    width: "56px",  align: "center" },
  { id: "visitorType", label: "신환",     group: "환자정보",    width: "40px",  align: "center" },
  { id: "visitTime",   label: "진료시간", group: "진료정보",    width: "60px",  align: "center", sortable: "visitTime" },
  { id: "visitOrder",  label: "초/재진",  group: "진료정보",    width: "52px",  align: "center" },
  { id: "doctor",      label: "담당의",   group: "진료정보",    width: "60px",  align: "center" },
  { id: "total",       label: "총액",     group: "진료비 산정", width: "80px",  align: "right",  sortable: "total" },
  { id: "nhis",        label: "공단",     group: "진료비 산정", width: "72px",  align: "right",  sortable: "nhis" },
  { id: "selfPay",     label: "본인",     group: "진료비 산정", width: "72px",  align: "right",  sortable: "selfPay" },
  { id: "noPay",       label: "비급여",   group: "진료비 산정", width: "72px",  align: "right",  sortable: "noPay" },
  { id: "settledTime", label: "수납시간", group: "결제",        width: "60px",  align: "center", sortable: "settledTime" },
  { id: "card",        label: "카드",     group: "결제",        width: "72px",  align: "right" },
  { id: "cash",        label: "현금",     group: "결제",        width: "72px",  align: "right" },
  { id: "unpaid",      label: "미수",     group: "결제",        width: "72px",  align: "right" },
];
