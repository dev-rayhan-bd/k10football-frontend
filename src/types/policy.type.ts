export interface IPolicyDocument {
  _id: string;
  type: string;
  title: string;
  slug?: string;
  content: string;
  version?: string;
  isMajorUpdate?: boolean;
  isCurrent?: boolean;
  isPublished?: boolean;
  effectiveDate?: string;
  summaryOfChanges?: string;
  createdBy?: string;
  updatedBy?: {
    _id?: string;
    email?: string;
    name?: string;
  };
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
}

export interface IPolicyDocumentResponse {
  statusCode: number;
  success: boolean;
  message: string;
  data: IPolicyDocument;
}

