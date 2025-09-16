export interface CRMRecord {
  slNo: number;
  leadReceivedDate: string;
  fullName: string;
  email: string;
  phone: string;
  place: string;
  counselor: string;
  region: string;
  branch: string;
  preferredCountry: string;
  ielts: string;
  latestRemarks: string;
  followupDate: string;
}

export interface ProcessedData {
  records: CRMRecord[];
  uniqueRecords: CRMRecord[];
  duplicates: {
    byEmail: CRMRecord[][];
    byPhone: CRMRecord[][];
    allDuplicateRecords: Set<CRMRecord>;
  };
  sqlStatements: string[];
}