export type ServiceCategory =
  | 'Identity & Civil'
  | 'Social Welfare'
  | 'Income & Revenue'
  | 'Education & Scholarship'
  | 'Business & Licensing';

export type FieldType = 'text' | 'number' | 'date' | 'select' | 'textarea';

export interface ServiceFormField {
  name: string;
  label: string;
  type: FieldType;
  required: boolean;
  placeholder?: string;
  options?: string[];
  helpText?: string;
}

export interface DocumentRequirement {
  id: string;
  serviceId: string;
  documentType: string;
  title: string;
  description: string;
  mandatory: boolean;
  acceptedFormats: string[];
  maxSizeMb: number;
  aiCheckPoints: string[];
}

export interface EligibilityRule {
  id: string;
  serviceId: string;
  ruleName: string;
  field: string;
  operator: '<=' | '>=' | '==' | '!=' | 'contains' | 'in';
  value: string;
  failureMessage: string;
  severity: 'blocking' | 'warning';
  isActive: boolean;
}

export interface GovernmentService {
  id: string;
  code: string;
  name: string;
  department: string;
  category: ServiceCategory;
  shortDescription: string;
  fullDescription: string;
  processingDays: number;
  feeInr: number;
  isActive: boolean;
  eligibilitySummary: string[];
  formFields: ServiceFormField[];
}
