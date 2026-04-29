// Shared types for today's chart data (used across App, PanelC, EMRExpandedHistory, PanelD)

export type TodayDiagnosis = {
  code: string;
  name: string;
  isMain?: boolean;
  special?: string;
  isNew?: boolean;
};

export type DurType = 'prohibited' | 'age' | 'pregnancy' | 'duplicate' | 'dose' | 'diagnosis';

export type TodayPrescription = {
  code: string;
  name: string;
  dose: string;
  freq: number;
  days: number;
  method: string;
  exception?: string;
  claim: boolean;
  pay: boolean;
  price: number;
  isReserved?: boolean;
  isDur?: boolean;
  durType?: DurType;
  durExtra?: string;
  conflictCode?: string; // code of the conflicting prescription (for 병용금기/중복처방)
  durReason?: string;
  isNew?: boolean;
};

// History visit item types (from PanelC / EMRExpandedHistory)
export type HistoryDx = { code: string; name: string };
export type HistoryRx = {
  name: string;
  dose: string;
  freq: string;
  days: number;
  price: number;
  method?: string;
};