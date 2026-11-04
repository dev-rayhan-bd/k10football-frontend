export type PlanCategory = "PLAYER" | "COACH" | "AGENT" | "CLUB" | "ACADEMY" | string;

export interface IMembershipPlan {
  _id: string;
  id?: string;
  planName: string;
  title?: string;
  planCategory: PlanCategory;
  targetRole?: string;
  price: number;
  planPrice?: number;
  currency?: string;
  billingCycle?: "MONTHLY" | "YEARLY" | string;
  billingLabel?: string;
  features: string[];
  startDate?: string;
  endDate?: string;
  isActive: boolean;
  status?: "ACTIVE" | "INACTIVE" | string;
  isDefaultPricing?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface IMembershipPlansMeta {
  total: number;
  activeCount: number;
  inactiveCount: number;
}

export interface IMembershipPlansResponse {
  statusCode: number;
  success: boolean;
  message: string;
  meta?: IMembershipPlansMeta;
  data: IMembershipPlan[];
}

export interface ISingleMembershipPlanResponse {
  statusCode: number;
  success: boolean;
  message: string;
  data: IMembershipPlan;
}

export interface ICreateMembershipPlanPayload {
  planName: string;
  planCategory: string;
  features: string[];
  startDate: string;
  endDate: string;
  isActive: boolean;
  price: number;
  billingCycle?: string;
  isDefaultPricing?: boolean;
}

export interface IUpdateMembershipPlanPayload {
  planName?: string;
  planCategory?: string;
  features?: string[];
  startDate?: string;
  endDate?: string;
  isActive?: boolean;
  price?: number;
  billingCycle?: string;
  isDefaultPricing?: boolean;
}

export interface IDropdownUser {
  _id: string;
  userId: string;
  name: string;
  email: string;
  role: string;
  category: string;
  currentPlan?: string;
  displayLabel?: string;
}

export interface IMembershipGrantUserDetails {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  role: string;
}

export interface IMembershipGrant {
  _id: string;
  grantId?: string;
  userId: string;
  userDetails?: IMembershipGrantUserDetails;
  name: string;
  email: string;
  category: string;
  duration?: string;
  durationMonths?: number | null;
  startDate?: string;
  endDate?: string;
  validityPeriod?: string;
  status: "ACTIVE" | "EXPIRED" | "REVOKED" | string;
  isAdminGrant?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface IMembershipGrantsMeta {
  total: number;
  totalGrants: number;
  page: number;
  limit: number;
  totalPages: number;
  dropdownUsers: IDropdownUser[];
}

export interface IMembershipGrantsResponse {
  statusCode: number;
  success: boolean;
  message: string;
  meta: IMembershipGrantsMeta;
  data: IMembershipGrant[];
}

export interface IGrantMembershipPayload {
  category: string;
  userId: string;
  duration: string;
}

export interface IGrantMembershipResponse {
  statusCode: number;
  success: boolean;
  message: string;
  data?: IMembershipGrant;
}

export interface IApprovalVerificationDoc {
  _id: string;
  documentType?: string;
  fileUrl: string;
  status?: string;
  adminReviewNotes?: string;
  createdAt?: string;
}

export interface IApprovalUserDetails {
  _id: string;
  email: string;
  name: string;
  role: string;
  avatar?: string;
  phone?: string;
  isVerified?: boolean;
  verificationStatus?: string;
  country?: string;
  fifaLicenseNumber?: string;
  agencyName?: string;
  clubName?: string;
  officialWebsite?: string;
  identityDocument?: string;
  licenseCertificateDocument?: string;
  adminReviewNotes?: string;
  verifiedAt?: string;
  createdAt?: string;
}

export interface IApprovalProfileDetails {
  _id: string;
  createdAt?: string;
  licenseId?: string;
  fifaLicenseNumber?: string;
  agencyName?: string;
  country?: string;
  countryOfOperation?: string;
  fullName?: string;
  name?: string;
  officialWebsite?: string;
  clubType?: string;
  league?: string;
  logo?: string;
  authorizedRepresentativeJobTitle?: string;
  identityDocument?: string;
  licenseCertificateDocument?: string;
  associationMembershipDocument?: string;
  verificationStatus?: string;
  adminReviewNotes?: string;
  verifiedAt?: string;
  verificationDocuments?: IApprovalVerificationDoc[];
}

export interface IApprovalApplication {
  _id: string;
  userId: string;
  profileId?: string | null;
  name: string;
  email: string;
  avatar?: string;
  role: "AGENT" | "CLUB" | "ACADEMY" | string;
  roleLabel?: string;
  date: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | string;
  verificationStatus?: string;
  reviewNotes?: string;
  user?: IApprovalUserDetails;
  profile?: IApprovalProfileDetails | null;
}

export interface IApprovalsMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  counts?: {
    pending: number;
    approved: number;
    rejected: number;
  };
}

export interface IApprovalsResponse {
  statusCode: number;
  success: boolean;
  message: string;
  meta: IApprovalsMeta;
  data: IApprovalApplication[];
}

export interface IApprovalDetailsResponse {
  statusCode: number;
  success: boolean;
  message: string;
  data: IApprovalApplication;
}

export interface IUpdateApprovalStatusPayload {
  status: "APPROVED" | "REJECTED";
  reviewNotes: string;
}

export interface IGetApprovalsParams {
  role?: "ALL" | "ACADEMIES" | "AGENTS" | "CLUBS" | string;
  status?: "ALL" | "PENDING" | "APPROVED" | "REJECTED" | string;
  search?: string;
  page?: number;
  limit?: number;
}



