import type {
  AIVerificationReport,
  Application,
  VerificationFinding,
} from '../types/application';
import type { UploadedDocument } from '../types/document';
import type {
  DocumentRequirement,
  EligibilityRule,
  GovernmentService,
} from '../types/service';
import type { AuditLog, User } from '../types/user';
import { buildSampleDocumentPreview } from '../utils/helpers';

export interface DemoDatabase {
  users: User[];
  services: GovernmentService[];
  documentRequirements: DocumentRequirement[];
  eligibilityRules: EligibilityRule[];
  applications: Application[];
  auditLogs: AuditLog[];
}

const DB_STORAGE_KEY = 'jansahayak_demo_db_v1';

function createInitialDb(): DemoDatabase {
  const users: User[] = [
    {
      id: 'usr-cit-1',
      fullName: 'Aarav Sharma',
      email: 'citizen@jansahayak.gov.in',
      phone: '+91 98765 43210',
      role: 'citizen',
      status: 'active',
      aadhaarMasked: 'XXXX-XXXX-4821',
      createdAt: '2026-01-14T09:15:00Z',
      lastLoginAt: '2026-11-26T10:30:00Z',
    },
    {
      id: 'usr-cit-2',
      fullName: 'Priya Deshmukh',
      email: 'priya.deshmukh@example.com',
      phone: '+91 98220 11842',
      role: 'citizen',
      status: 'active',
      aadhaarMasked: 'XXXX-XXXX-7190',
      createdAt: '2026-03-02T11:20:00Z',
      lastLoginAt: '2026-11-25T16:45:00Z',
    },
    {
      id: 'usr-off-1',
      fullName: 'Rajeshwar Verma',
      email: 'officer@jansahayak.gov.in',
      phone: '+91 98111 77654',
      role: 'officer',
      status: 'active',
      department: 'Department of Revenue & Civic Welfare',
      designation: 'Sub-Divisional Verification Officer',
      createdAt: '2025-11-01T08:00:00Z',
      lastLoginAt: '2026-11-27T08:40:00Z',
    },
    {
      id: 'usr-off-2',
      fullName: 'Meenakshi Iyer',
      email: 'meenakshi.iyer@jansahayak.gov.in',
      phone: '+91 98401 33920',
      role: 'officer',
      status: 'active',
      department: 'Social Justice & Education Directorate',
      designation: 'Senior Welfare Verifier',
      createdAt: '2025-12-10T09:00:00Z',
      lastLoginAt: '2026-11-26T17:15:00Z',
    },
    {
      id: 'usr-adm-1',
      fullName: 'Dr. Kavita Nair',
      email: 'admin@jansahayak.gov.in',
      phone: '+91 99000 10001',
      role: 'admin',
      status: 'active',
      department: 'e-Governance State Secretariat',
      designation: 'System & Policy Administrator',
      createdAt: '2025-09-15T08:00:00Z',
      lastLoginAt: '2026-11-27T09:00:00Z',
    },
  ];

  const services: GovernmentService[] = [
    {
      id: 'srv-income-cert',
      code: 'REV-INC-01',
      name: 'Official Income Certificate',
      department: 'Department of Revenue',
      category: 'Income & Revenue',
      shortDescription:
        'Certified annual household income statement required for scholarships, fee concessions, and welfare subsidies.',
      fullDescription:
        'Issued by the Tehsildar / Revenue Authority after verifying salary slips, ITR or employer declarations, and identity proof. JanSahayak AI automatically extracts income figures and flags any discrepancy before officer sign-off.',
      processingDays: 7,
      feeInr: 50,
      isActive: true,
      eligibilitySummary: [
        'Applicant must be a resident citizen aged 18 years or older (or represented by legal guardian).',
        'Declared annual family income must match supporting income proof within 5% tolerance.',
        'Valid Aadhaar Card and Address Proof are mandatory.',
      ],
      formFields: [
        { name: 'applicantName', label: 'Full Legal Name (as on Aadhaar)', type: 'text', required: true, placeholder: 'e.g. Aarav Sharma' },
        { name: 'fatherOrSpouseName', label: 'Father / Mother / Spouse Name', type: 'text', required: true, placeholder: 'e.g. Suresh Sharma' },
        { name: 'dob', label: 'Date of Birth', type: 'date', required: true },
        { name: 'annualIncome', label: 'Declared Annual Family Income (INR)', type: 'number', required: true, placeholder: 'e.g. 240000' },
        { name: 'occupation', label: 'Primary Occupation', type: 'select', required: true, options: ['Salaried Private', 'Government Employee', 'Self-Employed / Trader', 'Agriculture', 'Daily Wage / Unorganized'] },
        { name: 'district', label: 'District & Tehsil', type: 'text', required: true, placeholder: 'e.g. Pune City, Pune' },
        { name: 'purpose', label: 'Purpose of Certificate', type: 'select', required: true, options: ['Education Scholarship', 'Fee Waiver', 'Housing Scheme', 'Healthcare Subsidy', 'Other'] },
      ],
    },
    {
      id: 'srv-senior-pension',
      code: 'SOC-PEN-02',
      name: 'Senior Citizen Social Security Pension',
      department: 'Directorate of Social Welfare',
      category: 'Social Welfare',
      shortDescription:
        'Monthly financial assistance for citizens aged 60+ belonging to economically vulnerable households.',
      fullDescription:
        'Provides direct-benefit monthly pension transfers to eligible senior citizens. AI verification validates age proof against birth/Aadhaar records, checks annual income threshold (<= INR 2,00,000), and verifies bank passbook IFSC details.',
      processingDays: 14,
      feeInr: 0,
      isActive: true,
      eligibilitySummary: [
        'Applicant age must be 60 years or above.',
        'Annual household income must not exceed INR 2,00,000.',
        'Active bank account seeded with Aadhaar required for DBT.',
      ],
      formFields: [
        { name: 'applicantName', label: 'Senior Citizen Full Name', type: 'text', required: true, placeholder: 'Full name as on Aadhaar' },
        { name: 'age', label: 'Age (in completed years)', type: 'number', required: true, placeholder: 'e.g. 64' },
        { name: 'annualIncome', label: 'Annual Household Income (INR)', type: 'number', required: true, placeholder: 'e.g. 120000' },
        { name: 'bankAccountLast4', label: 'Bank Account (Last 4 Digits)', type: 'text', required: true, placeholder: 'e.g. 8842' },
        { name: 'ifscCode', label: 'Bank IFSC Code', type: 'text', required: true, placeholder: 'e.g. SBIN0001234' },
        { name: 'district', label: 'Residential District', type: 'text', required: true, placeholder: 'e.g. Jaipur' },
      ],
    },
    {
      id: 'srv-scholarship',
      code: 'EDU-SCH-03',
      name: 'Post-Matric Merit-cum-Means Scholarship',
      department: 'Department of Higher Education',
      category: 'Education & Scholarship',
      shortDescription:
        'Tuition and maintenance grant for meritorious students from low- and middle-income families.',
      fullDescription:
        'Supports undergraduate and diploma students enrolled in recognized institutions. AI cross-checks marksheet percentage (>= 60%), income ceiling (<= INR 3,50,000), and bonafide enrollment letter.',
      processingDays: 15,
      feeInr: 0,
      isActive: true,
      eligibilitySummary: [
        'Minimum 60% marks in previous qualifying examination.',
        'Annual family income must not exceed INR 3,50,000.',
        'Must hold bonafide student certificate from recognized institute.',
      ],
      formFields: [
        { name: 'applicantName', label: 'Student Full Name', type: 'text', required: true, placeholder: 'As per marksheet & Aadhaar' },
        { name: 'institutionName', label: 'Institution / University Name', type: 'text', required: true, placeholder: 'e.g. National Institute of Technology' },
        { name: 'courseName', label: 'Course & Year', type: 'text', required: true, placeholder: 'e.g. B.Tech CSE - 2nd Year' },
        { name: 'previousPercentage', label: 'Previous Exam Percentage (%)', type: 'number', required: true, placeholder: 'e.g. 78' },
        { name: 'annualIncome', label: 'Annual Family Income (INR)', type: 'number', required: true, placeholder: 'e.g. 260000' },
      ],
    },
    {
      id: 'srv-domicile',
      code: 'CIV-DOM-04',
      name: 'Domicile / Residence Certificate',
      department: 'District Collectorate',
      category: 'Identity & Civil',
      shortDescription:
        'Official proof of continuous state residency for state quota admissions and public employment.',
      fullDescription:
        'Certifies that the applicant has resided continuously in the state for the mandated period. AI validates address consistency across Aadhaar and utility/ration records.',
      processingDays: 10,
      feeInr: 30,
      isActive: true,
      eligibilitySummary: [
        'Minimum 5 years of continuous residence in the state.',
        'Address across identity and utility proof must match.',
      ],
      formFields: [
        { name: 'applicantName', label: 'Applicant Full Name', type: 'text', required: true, placeholder: 'Full legal name' },
        { name: 'yearsOfResidence', label: 'Years of Continuous Residence', type: 'number', required: true, placeholder: 'e.g. 12' },
        { name: 'currentAddress', label: 'Current Residential Address', type: 'textarea', required: true, placeholder: 'House No, Street, Locality, PIN' },
        { name: 'district', label: 'District', type: 'text', required: true, placeholder: 'e.g. Lucknow' },
      ],
    },
    {
      id: 'srv-msme-license',
      code: 'BIZ-MSME-05',
      name: 'Micro-Enterprise Municipal Trade License',
      department: 'Urban Local Body & Commerce',
      category: 'Business & Licensing',
      shortDescription:
        'Fast-track municipal trade clearance for micro businesses, clinics, and retail establishments.',
      fullDescription:
        'Enables small business owners to obtain municipal trade registration with automated PAN/GST and premises proof validation.',
      processingDays: 5,
      feeInr: 250,
      isActive: true,
      eligibilitySummary: [
        'Valid PAN Card of proprietor/partner.',
        'Commercial property tax receipt or valid rent agreement.',
      ],
      formFields: [
        { name: 'applicantName', label: 'Proprietor Full Name', type: 'text', required: true },
        { name: 'businessName', label: 'Registered Business / Shop Name', type: 'text', required: true },
        { name: 'panNumber', label: 'PAN Number', type: 'text', required: true, placeholder: 'ABCDE1234F' },
        { name: 'premisesAddress', label: 'Business Premises Address', type: 'textarea', required: true },
        { name: 'annualTurnover', label: 'Estimated Annual Turnover (INR)', type: 'number', required: true },
      ],
    },
  ];

  const documentRequirements: DocumentRequirement[] = [
    {
      id: 'req-inc-aadhaar',
      serviceId: 'srv-income-cert',
      documentType: 'aadhaar_card',
      title: 'Aadhaar Card / National ID',
      description: 'Front & back clear scan showing full name, DOB, and masked Aadhaar number.',
      mandatory: true,
      acceptedFormats: ['PDF', 'JPG', 'PNG'],
      maxSizeMb: 5,
      aiCheckPoints: ['Name match with form', 'DOB verification', 'Document clarity & tamper check'],
    },
    {
      id: 'req-inc-salary',
      serviceId: 'srv-income-cert',
      documentType: 'income_proof',
      title: 'Salary Slip / Form 16 / Employer Certificate',
      description: 'Latest 3 months salary slip, ITR acknowledgment, or employer-stamped income letter.',
      mandatory: true,
      acceptedFormats: ['PDF', 'JPG', 'PNG'],
      maxSizeMb: 5,
      aiCheckPoints: ['Annualized income within 5% of declared income', 'Issuer seal & date validity'],
    },
    {
      id: 'req-inc-address',
      serviceId: 'srv-income-cert',
      documentType: 'address_proof',
      title: 'Address Proof (Electricity / Water Bill)',
      description: 'Recent utility bill (not older than 3 months) or Ration Card.',
      mandatory: true,
      acceptedFormats: ['PDF', 'JPG', 'PNG'],
      maxSizeMb: 5,
      aiCheckPoints: ['District & address consistency', 'Recency check (< 90 days)'],
    },
    {
      id: 'req-pen-aadhaar',
      serviceId: 'srv-senior-pension',
      documentType: 'aadhaar_card',
      title: 'Aadhaar Card (Age & Identity Proof)',
      description: 'Clear copy confirming date of birth and senior citizen age (>= 60).',
      mandatory: true,
      acceptedFormats: ['PDF', 'JPG', 'PNG'],
      maxSizeMb: 5,
      aiCheckPoints: ['Age >= 60 calculation', 'Name match with application'],
    },
    {
      id: 'req-pen-bank',
      serviceId: 'srv-senior-pension',
      documentType: 'bank_passbook',
      title: 'Bank Passbook Front Page / Cancelled Cheque',
      description: 'Must display account holder name, account number, and IFSC code.',
      mandatory: true,
      acceptedFormats: ['PDF', 'JPG', 'PNG'],
      maxSizeMb: 5,
      aiCheckPoints: ['IFSC code match', 'Account holder name match'],
    },
    {
      id: 'req-sch-marksheet',
      serviceId: 'srv-scholarship',
      documentType: 'marksheet',
      title: 'Previous Qualifying Examination Marksheet',
      description: 'Official board/university marksheet showing percentage or CGPA.',
      mandatory: true,
      acceptedFormats: ['PDF', 'JPG', 'PNG'],
      maxSizeMb: 5,
      aiCheckPoints: ['Percentage >= 60%', 'Student name match'],
    },
    {
      id: 'req-sch-bonafide',
      serviceId: 'srv-scholarship',
      documentType: 'bonafide_certificate',
      title: 'Institute Bonafide Student Certificate',
      description: 'Signed by Principal / Registrar for current academic year.',
      mandatory: true,
      acceptedFormats: ['PDF', 'JPG', 'PNG'],
      maxSizeMb: 5,
      aiCheckPoints: ['Institution name match', 'Academic year currency'],
    },
    {
      id: 'req-sch-income',
      serviceId: 'srv-scholarship',
      documentType: 'income_certificate',
      title: 'Family Income Proof / Certificate',
      description: 'Valid income certificate or parent salary/ITR proof.',
      mandatory: true,
      acceptedFormats: ['PDF', 'JPG', 'PNG'],
      maxSizeMb: 5,
      aiCheckPoints: ['Income <= INR 3,50,000'],
    },
    {
      id: 'req-dom-aadhaar',
      serviceId: 'srv-domicile',
      documentType: 'aadhaar_card',
      title: 'Aadhaar Card',
      description: 'Identity and current address proof.',
      mandatory: true,
      acceptedFormats: ['PDF', 'JPG', 'PNG'],
      maxSizeMb: 5,
      aiCheckPoints: ['Name and district match'],
    },
    {
      id: 'req-dom-utility',
      serviceId: 'srv-domicile',
      documentType: 'residence_proof',
      title: '5-Year Residence Proof (Utility / School / Rent Deed)',
      description: 'Supporting documentary evidence of continuous stay.',
      mandatory: true,
      acceptedFormats: ['PDF', 'JPG', 'PNG'],
      maxSizeMb: 5,
      aiCheckPoints: ['Duration >= 5 years', 'Address match'],
    },
    {
      id: 'req-biz-pan',
      serviceId: 'srv-msme-license',
      documentType: 'pan_card',
      title: 'Proprietor PAN Card',
      description: 'Clear scan of Permanent Account Number card.',
      mandatory: true,
      acceptedFormats: ['PDF', 'JPG', 'PNG'],
      maxSizeMb: 5,
      aiCheckPoints: ['PAN format & number match'],
    },
    {
      id: 'req-biz-premises',
      serviceId: 'srv-msme-license',
      documentType: 'premises_proof',
      title: 'Commercial Rent Agreement / Tax Receipt',
      description: 'Valid proof of business premises occupation.',
      mandatory: true,
      acceptedFormats: ['PDF', 'JPG', 'PNG'],
      maxSizeMb: 5,
      aiCheckPoints: ['Premises address match'],
    },
  ];

  const eligibilityRules: EligibilityRule[] = [
    {
      id: 'rule-inc-1',
      serviceId: 'srv-income-cert',
      ruleName: 'Positive Annual Income Declaration',
      field: 'annualIncome',
      operator: '>=',
      value: '0',
      failureMessage: 'Declared annual income must be zero or positive.',
      severity: 'blocking',
      isActive: true,
    },
    {
      id: 'rule-pen-1',
      serviceId: 'srv-senior-pension',
      ruleName: 'Minimum Senior Citizen Age',
      field: 'age',
      operator: '>=',
      value: '60',
      failureMessage: 'Applicant must be at least 60 years of age for Senior Citizen Pension.',
      severity: 'blocking',
      isActive: true,
    },
    {
      id: 'rule-pen-2',
      serviceId: 'srv-senior-pension',
      ruleName: 'Senior Pension Income Ceiling',
      field: 'annualIncome',
      operator: '<=',
      value: '200000',
      failureMessage: 'Annual household income exceeds INR 2,00,000 limit.',
      severity: 'blocking',
      isActive: true,
    },
    {
      id: 'rule-sch-1',
      serviceId: 'srv-scholarship',
      ruleName: 'Minimum Academic Merit Threshold',
      field: 'previousPercentage',
      operator: '>=',
      value: '60',
      failureMessage: 'Minimum 60% marks in previous exam required.',
      severity: 'blocking',
      isActive: true,
    },
    {
      id: 'rule-sch-2',
      serviceId: 'srv-scholarship',
      ruleName: 'Scholarship Income Ceiling',
      field: 'annualIncome',
      operator: '<=',
      value: '350000',
      failureMessage: 'Family income exceeds INR 3,50,000 scholarship cap.',
      severity: 'blocking',
      isActive: true,
    },
    {
      id: 'rule-dom-1',
      serviceId: 'srv-domicile',
      ruleName: 'Minimum State Residency Duration',
      field: 'yearsOfResidence',
      operator: '>=',
      value: '5',
      failureMessage: 'Minimum 5 years of continuous residence required.',
      severity: 'blocking',
      isActive: true,
    },
  ];

  const doc1Preview = buildSampleDocumentPreview(
    'AADHAAR IDENTITY CARD',
    'Aarav Sharma',
    'XXXX-XXXX-4821',
    ['DOB: 14-08-1998 | Gender: Male', 'Address: 204 Shastri Nagar, Pune 411006', 'Father: Suresh Sharma'],
  );
  const doc2Preview = buildSampleDocumentPreview(
    'ANNUAL SALARY CERTIFICATE (FORM-16)',
    'Aarav Sharma',
    'FY 2025-26 · GROSS: INR 2,85,000',
    ['Employer: Apex Civic Logistics Pvt Ltd', 'TAN: PNE048192A', 'Verified Payroll Extract'],
  );
  const doc3Preview = buildSampleDocumentPreview(
    'MSEDCL ELECTRICITY BILL',
    'Suresh Sharma (Parent Residence)',
    'CONSUMER NO: 17004829102',
    ['Billing Address: 204 Shastri Nagar, Pune', 'Bill Date: 05-Nov-2026', 'Status: Paid'],
  );
  const doc4Preview = buildSampleDocumentPreview(
    'MARKSHEET — B.TECH SEMESTER IV',
    'Priya Deshmukh',
    'ROLL NO: 2024CSE089 · SCORE: 84.6%',
    ['Institute: Govt College of Engineering Pune', 'Result: First Class with Distinction', 'Academic Year: 2025-26'],
  );
  const doc5Preview = buildSampleDocumentPreview(
    'BONAFIDE STUDENT CERTIFICATE',
    'Priya Deshmukh',
    'REF: COEP/REG/2026/1142',
    ['Course: B.Tech Computer Engineering (3rd Year)', 'Valid Through: May 2027', 'Signed: Registrar'],
  );

  const applications: Application[] = [
    {
      id: 'app-1001',
      referenceNumber: 'JS-2026-001042',
      citizenId: 'usr-cit-1',
      citizenName: 'Aarav Sharma',
      citizenEmail: 'citizen@jansahayak.gov.in',
      serviceId: 'srv-income-cert',
      serviceName: 'Official Income Certificate',
      department: 'Department of Revenue',
      status: 'under_officer_review',
      submittedAt: '2026-11-23T09:30:00Z',
      updatedAt: '2026-11-25T14:20:00Z',
      assignedOfficerId: 'usr-off-1',
      assignedOfficerName: 'Rajeshwar Verma',
      formData: {
        applicantName: 'Aarav Sharma',
        fatherOrSpouseName: 'Suresh Sharma',
        dob: '1998-08-14',
        annualIncome: 240000,
        occupation: 'Salaried Private',
        district: 'Pune City, Pune',
        purpose: 'Education Scholarship',
      },
      documents: [
        {
          id: 'doc-101',
          applicationId: 'app-1001',
          requirementId: 'req-inc-aadhaar',
          documentType: 'aadhaar_card',
          title: 'Aadhaar Card / National ID',
          fileName: 'aarav_aadhaar_masked.png',
          fileSizeBytes: 428120,
          mimeType: 'image/png',
          previewUrl: doc1Preview,
          uploadedAt: '2026-11-23T09:35:00Z',
          status: 'ai_verified',
          aiConfidence: 97,
          aiNotes: 'Name, DOB, and Pune district verified cleanly against form submission.',
          extractedFields: [
            { field: 'Full Name', extractedValue: 'Aarav Sharma', formValue: 'Aarav Sharma', matches: true, confidence: 99 },
            { field: 'Date of Birth', extractedValue: '1998-08-14', formValue: '1998-08-14', matches: true, confidence: 98 },
            { field: 'District', extractedValue: 'Pune', formValue: 'Pune City, Pune', matches: true, confidence: 95 },
          ],
        },
        {
          id: 'doc-102',
          applicationId: 'app-1001',
          requirementId: 'req-inc-salary',
          documentType: 'income_proof',
          title: 'Salary Slip / Form 16 / Employer Certificate',
          fileName: 'form16_fy25_26.pdf',
          fileSizeBytes: 812400,
          mimeType: 'application/pdf',
          previewUrl: doc2Preview,
          uploadedAt: '2026-11-23T09:37:00Z',
          status: 'mismatch_detected',
          aiConfidence: 84,
          aiNotes: 'Form-16 shows gross annual income INR 2,85,000 whereas applicant declared INR 2,40,000 (18.75% variance).',
          extractedFields: [
            { field: 'Employee Name', extractedValue: 'Aarav Sharma', formValue: 'Aarav Sharma', matches: true, confidence: 98 },
            { field: 'Gross Annual Income', extractedValue: 'INR 2,85,000', formValue: 'INR 2,40,000', matches: false, confidence: 91 },
          ],
        },
        {
          id: 'doc-103',
          applicationId: 'app-1001',
          requirementId: 'req-inc-address',
          documentType: 'address_proof',
          title: 'Address Proof (Electricity / Water Bill)',
          fileName: 'msedcl_bill_nov2026.png',
          fileSizeBytes: 318000,
          mimeType: 'image/png',
          previewUrl: doc3Preview,
          uploadedAt: '2026-11-23T09:40:00Z',
          status: 'ai_verified',
          aiConfidence: 93,
          aiNotes: 'Recent electricity bill (< 30 days) matching Pune residential address.',
          extractedFields: [
            { field: 'Billing City', extractedValue: 'Pune', formValue: 'Pune City, Pune', matches: true, confidence: 96 },
            { field: 'Bill Date', extractedValue: '05-Nov-2026', formValue: 'Within 90 days', matches: true, confidence: 95 },
          ],
        },
      ],
      aiReport: {
        generatedAt: '2026-11-23T09:41:12Z',
        overallScore: 81,
        eligibilityPassed: true,
        completenessScore: 100,
        consistencyScore: 72,
        summary:
          'All 3 mandatory documents uploaded. Identity and address verified with high confidence; AI flagged an 18.75% income discrepancy between declared form income (INR 2,40,000) and Form-16 gross earnings (INR 2,85,000) requiring officer confirmation.',
        missingDocuments: [],
        recommendedAction: 'manual_review',
        findings: [
          {
            id: 'fnd-1',
            type: 'inconsistency',
            severity: 'medium',
            title: 'Declared Income vs Form-16 Variance (18.75%)',
            description:
              'Applicant entered INR 2,40,000 on application form, while uploaded Form-16 reports gross salary INR 2,85,000 (net taxable after deductions may explain difference).',
            fieldAffected: 'annualIncome',
          },
          {
            id: 'fnd-2',
            type: 'passed',
            severity: 'info',
            title: 'Identity & Address Cross-Check Passed',
            description: 'Aadhaar Card and MSEDCL Electricity Bill match applicant name, father name, and Pune address.',
          },
        ],
      },
      timeline: [
        {
          id: 'tl-1',
          timestamp: '2026-11-23T09:30:00Z',
          stage: 'Application Submitted',
          actor: 'Aarav Sharma (Citizen)',
          description: 'Submitted Official Income Certificate request with form details.',
          state: 'completed',
        },
        {
          id: 'tl-2',
          timestamp: '2026-11-23T09:40:00Z',
          stage: 'Documents Uploaded (3/3)',
          actor: 'Aarav Sharma (Citizen)',
          description: 'Uploaded Aadhaar, Form-16 Salary Proof, and Electricity Bill.',
          state: 'completed',
        },
        {
          id: 'tl-3',
          timestamp: '2026-11-23T09:41:12Z',
          stage: 'AI Verification Completed',
          actor: 'JanSahayak AI Engine',
          description: 'Score 81/100 · Flagged income variance for officer review.',
          state: 'warning',
        },
        {
          id: 'tl-4',
          timestamp: '2026-11-25T14:20:00Z',
          stage: 'Assigned to Verification Officer',
          actor: 'Rajeshwar Verma (Officer)',
          description: 'Queued for sub-divisional officer decision.',
          state: 'active',
        },
      ],
    },
    {
      id: 'app-1002',
      referenceNumber: 'JS-2026-001055',
      citizenId: 'usr-cit-2',
      citizenName: 'Priya Deshmukh',
      citizenEmail: 'priya.deshmukh@example.com',
      serviceId: 'srv-scholarship',
      serviceName: 'Post-Matric Merit-cum-Means Scholarship',
      department: 'Department of Higher Education',
      status: 'action_required',
      submittedAt: '2026-11-20T11:00:00Z',
      updatedAt: '2026-11-24T16:05:00Z',
      assignedOfficerId: 'usr-off-2',
      assignedOfficerName: 'Meenakshi Iyer',
      officerRemarks: 'Please upload an updated Tehsildar-signed Family Income Certificate; previous document is missing.',
      requestedDocuments: ['Family Income Proof / Certificate'],
      formData: {
        applicantName: 'Priya Deshmukh',
        institutionName: 'Govt College of Engineering Pune',
        courseName: 'B.Tech Computer Engineering - 3rd Year',
        previousPercentage: 84.6,
        annualIncome: 195000,
      },
      documents: [
        {
          id: 'doc-201',
          applicationId: 'app-1002',
          requirementId: 'req-sch-marksheet',
          documentType: 'marksheet',
          title: 'Previous Qualifying Examination Marksheet',
          fileName: 'priya_sem4_marksheet.png',
          fileSizeBytes: 510000,
          mimeType: 'image/png',
          previewUrl: doc4Preview,
          uploadedAt: '2026-11-20T11:05:00Z',
          status: 'approved',
          aiConfidence: 98,
          aiNotes: '84.6% exceeds minimum 60% requirement. Student name matches.',
          extractedFields: [
            { field: 'Student Name', extractedValue: 'Priya Deshmukh', formValue: 'Priya Deshmukh', matches: true, confidence: 99 },
            { field: 'Percentage', extractedValue: '84.6%', formValue: '84.6', matches: true, confidence: 98 },
          ],
          officerComment: 'Verified against COEP portal.',
        },
        {
          id: 'doc-202',
          applicationId: 'app-1002',
          requirementId: 'req-sch-bonafide',
          documentType: 'bonafide_certificate',
          title: 'Institute Bonafide Student Certificate',
          fileName: 'coep_bonafide_2026.pdf',
          fileSizeBytes: 295000,
          mimeType: 'application/pdf',
          previewUrl: doc5Preview,
          uploadedAt: '2026-11-20T11:08:00Z',
          status: 'approved',
          aiConfidence: 96,
          aiNotes: 'Valid bonafide certificate for academic year 2026-27.',
          extractedFields: [
            { field: 'Institution', extractedValue: 'Govt College of Engineering Pune', formValue: 'Govt College of Engineering Pune', matches: true, confidence: 97 },
          ],
        },
      ],
      aiReport: {
        generatedAt: '2026-11-20T11:10:00Z',
        overallScore: 68,
        eligibilityPassed: true,
        completenessScore: 67,
        consistencyScore: 98,
        summary:
          '2 of 3 mandatory documents verified. Family Income Proof / Certificate is missing, blocking final scholarship disbursement.',
        missingDocuments: ['Family Income Proof / Certificate'],
        recommendedAction: 'request_documents',
        findings: [
          {
            id: 'fnd-201',
            type: 'missing_document',
            severity: 'high',
            title: 'Missing Mandatory Document: Family Income Proof',
            description: 'Applicant has not uploaded Family Income Proof / Certificate required to validate the INR 3,50,000 ceiling.',
          },
          {
            id: 'fnd-202',
            type: 'passed',
            severity: 'info',
            title: 'Academic Merit & Bonafide Verified',
            description: '84.6% score meets >= 60% eligibility threshold.',
          },
        ],
      },
      timeline: [
        {
          id: 'tl-201',
          timestamp: '2026-11-20T11:00:00Z',
          stage: 'Application Submitted',
          actor: 'Priya Deshmukh (Citizen)',
          description: 'Applied for Post-Matric Merit-cum-Means Scholarship.',
          state: 'completed',
        },
        {
          id: 'tl-202',
          timestamp: '2026-11-20T11:10:00Z',
          stage: 'AI Verification Flagged Missing File',
          actor: 'JanSahayak AI Engine',
          description: 'Detected missing Family Income Proof / Certificate.',
          state: 'warning',
        },
        {
          id: 'tl-203',
          timestamp: '2026-11-24T16:05:00Z',
          stage: 'Officer Requested Additional Document',
          actor: 'Meenakshi Iyer (Officer)',
          description: 'Requested Tehsildar-signed Family Income Certificate.',
          state: 'warning',
        },
      ],
    },
    {
      id: 'app-1003',
      referenceNumber: 'JS-2026-000991',
      citizenId: 'usr-cit-1',
      citizenName: 'Aarav Sharma',
      citizenEmail: 'citizen@jansahayak.gov.in',
      serviceId: 'srv-domicile',
      serviceName: 'Domicile / Residence Certificate',
      department: 'District Collectorate',
      status: 'approved',
      submittedAt: '2026-11-10T10:15:00Z',
      updatedAt: '2026-11-14T15:40:00Z',
      assignedOfficerId: 'usr-off-1',
      assignedOfficerName: 'Rajeshwar Verma',
      officerRemarks: 'All residency documents verified. Digital Domicile Certificate issued.',
      formData: {
        applicantName: 'Aarav Sharma',
        yearsOfResidence: 14,
        currentAddress: '204 Shastri Nagar, Pune 411006',
        district: 'Pune',
      },
      documents: [
        {
          id: 'doc-301',
          applicationId: 'app-1003',
          requirementId: 'req-dom-aadhaar',
          documentType: 'aadhaar_card',
          title: 'Aadhaar Card',
          fileName: 'aarav_aadhaar_masked.png',
          fileSizeBytes: 428120,
          mimeType: 'image/png',
          previewUrl: doc1Preview,
          uploadedAt: '2026-11-10T10:18:00Z',
          status: 'approved',
          aiConfidence: 98,
          aiNotes: 'Identity and Pune address verified.',
          extractedFields: [
            { field: 'Full Name', extractedValue: 'Aarav Sharma', formValue: 'Aarav Sharma', matches: true, confidence: 99 },
          ],
        },
        {
          id: 'doc-302',
          applicationId: 'app-1003',
          requirementId: 'req-dom-utility',
          documentType: 'residence_proof',
          title: '5-Year Residence Proof (Utility / School / Rent Deed)',
          fileName: 'msedcl_residence_history.png',
          fileSizeBytes: 318000,
          mimeType: 'image/png',
          previewUrl: doc3Preview,
          uploadedAt: '2026-11-10T10:20:00Z',
          status: 'approved',
          aiConfidence: 95,
          aiNotes: 'Residency duration confirmed (> 5 years).',
          extractedFields: [
            { field: 'District', extractedValue: 'Pune', formValue: 'Pune', matches: true, confidence: 96 },
          ],
        },
      ],
      aiReport: {
        generatedAt: '2026-11-10T10:22:00Z',
        overallScore: 96,
        eligibilityPassed: true,
        completenessScore: 100,
        consistencyScore: 96,
        summary: 'All eligibility rules and document cross-checks passed with 96% confidence. Recommended for fast-track approval.',
        missingDocuments: [],
        recommendedAction: 'recommend_approve',
        findings: [
          {
            id: 'fnd-301',
            type: 'passed',
            severity: 'info',
            title: '14-Year Residency Rule Satisfied',
            description: 'Exceeds minimum 5-year residency requirement.',
          },
        ],
      },
      timeline: [
        {
          id: 'tl-301',
          timestamp: '2026-11-10T10:15:00Z',
          stage: 'Application Submitted',
          actor: 'Aarav Sharma (Citizen)',
          description: 'Submitted Domicile Certificate request.',
          state: 'completed',
        },
        {
          id: 'tl-302',
          timestamp: '2026-11-10T10:22:00Z',
          stage: 'AI Verification Passed (96%)',
          actor: 'JanSahayak AI Engine',
          description: 'Recommended fast-track approval.',
          state: 'completed',
        },
        {
          id: 'tl-303',
          timestamp: '2026-11-14T15:40:00Z',
          stage: 'Application Approved',
          actor: 'Rajeshwar Verma (Officer)',
          description: 'Digitally signed and issued certificate.',
          state: 'completed',
        },
      ],
    },
    {
      id: 'app-1004',
      referenceNumber: 'JS-2026-001061',
      citizenId: 'usr-cit-2',
      citizenName: 'Priya Deshmukh',
      citizenEmail: 'priya.deshmukh@example.com',
      serviceId: 'srv-senior-pension',
      serviceName: 'Senior Citizen Social Security Pension',
      department: 'Directorate of Social Welfare',
      status: 'under_officer_review',
      submittedAt: '2026-11-25T13:10:00Z',
      updatedAt: '2026-11-26T09:15:00Z',
      assignedOfficerId: 'usr-off-1',
      assignedOfficerName: 'Rajeshwar Verma',
      formData: {
        applicantName: 'Ramesh Deshmukh',
        age: 58,
        annualIncome: 145000,
        bankAccountLast4: '4491',
        ifscCode: 'SBIN0004521',
        district: 'Nagpur',
      },
      documents: [
        {
          id: 'doc-401',
          applicationId: 'app-1004',
          requirementId: 'req-pen-aadhaar',
          documentType: 'aadhaar_card',
          title: 'Aadhaar Card (Age & Identity Proof)',
          fileName: 'ramesh_aadhaar.png',
          fileSizeBytes: 390000,
          mimeType: 'image/png',
          previewUrl: buildSampleDocumentPreview(
            'AADHAAR IDENTITY CARD',
            'Ramesh Deshmukh',
            'XXXX-XXXX-3109',
            ['DOB: 12-04-1968 (Age 58)', 'Address: Dharampeth, Nagpur'],
          ),
          uploadedAt: '2026-11-25T13:14:00Z',
          status: 'ai_verified',
          aiConfidence: 95,
          aiNotes: 'Aadhaar verified; extracted age is 58 years.',
          extractedFields: [
            { field: 'Full Name', extractedValue: 'Ramesh Deshmukh', formValue: 'Ramesh Deshmukh', matches: true, confidence: 98 },
            { field: 'Age', extractedValue: '58 years', formValue: '58', matches: true, confidence: 97 },
          ],
        },
        {
          id: 'doc-402',
          applicationId: 'app-1004',
          requirementId: 'req-pen-bank',
          documentType: 'bank_passbook',
          title: 'Bank Passbook Front Page / Cancelled Cheque',
          fileName: 'sbi_passbook.png',
          fileSizeBytes: 274000,
          mimeType: 'image/png',
          previewUrl: buildSampleDocumentPreview(
            'STATE BANK OF INDIA PASSBOOK',
            'Ramesh Deshmukh',
            'A/C: XXXXXXXX4491 · IFSC: SBIN0004521',
            ['Branch: Dharampeth Nagpur', 'DBT Status: Aadhaar Seeded'],
          ),
          uploadedAt: '2026-11-25T13:16:00Z',
          status: 'ai_verified',
          aiConfidence: 94,
          aiNotes: 'IFSC SBIN0004521 and account suffix 4491 matched.',
          extractedFields: [
            { field: 'IFSC Code', extractedValue: 'SBIN0004521', formValue: 'SBIN0004521', matches: true, confidence: 98 },
          ],
        },
      ],
      aiReport: {
        generatedAt: '2026-11-25T13:17:00Z',
        overallScore: 54,
        eligibilityPassed: false,
        completenessScore: 100,
        consistencyScore: 95,
        summary:
          'Documents are complete and consistent, but applicant age (58) fails the mandatory Minimum Senior Citizen Age rule (>= 60 years).',
        missingDocuments: [],
        recommendedAction: 'recommend_reject',
        findings: [
          {
            id: 'fnd-401',
            type: 'eligibility_flag',
            severity: 'high',
            title: 'Eligibility Rule Failed: Minimum Age >= 60',
            description: 'Applicant declared and Aadhaar-verified age is 58 years, below the 60-year statutory threshold.',
            fieldAffected: 'age',
          },
        ],
      },
      timeline: [
        {
          id: 'tl-401',
          timestamp: '2026-11-25T13:10:00Z',
          stage: 'Application Submitted',
          actor: 'Priya Deshmukh (Citizen)',
          description: 'Submitted Senior Citizen Pension application on behalf of Ramesh Deshmukh.',
          state: 'completed',
        },
        {
          id: 'tl-402',
          timestamp: '2026-11-25T13:17:00Z',
          stage: 'AI Flagged Eligibility Rule',
          actor: 'JanSahayak AI Engine',
          description: 'Flagged Minimum Senior Citizen Age (< 60 years).',
          state: 'danger',
        },
        {
          id: 'tl-403',
          timestamp: '2026-11-26T09:15:00Z',
          stage: 'Under Officer Review',
          actor: 'Rajeshwar Verma (Officer)',
          description: 'Awaiting final officer determination.',
          state: 'active',
        },
      ],
    },
  ];

  const auditLogs: AuditLog[] = [
    {
      id: 'aud-1',
      timestamp: '2026-11-27T09:00:00Z',
      actorId: 'usr-adm-1',
      actorName: 'Dr. Kavita Nair',
      actorRole: 'admin',
      action: 'POLICY_RULE_REVIEWED',
      targetType: 'rule',
      targetId: 'rule-pen-1',
      details: 'Verified Senior Citizen Pension age >= 60 rule is active.',
      ipAddress: '10.24.18.4',
      severity: 'info',
    },
    {
      id: 'aud-2',
      timestamp: '2026-11-25T14:20:00Z',
      actorId: 'usr-off-1',
      actorName: 'Rajeshwar Verma',
      actorRole: 'officer',
      action: 'APPLICATION_ASSIGNED',
      targetType: 'application',
      targetId: 'JS-2026-001042',
      details: 'Picked up Official Income Certificate application for manual income variance check.',
      ipAddress: '10.24.19.12',
      severity: 'info',
    },
    {
      id: 'aud-3',
      timestamp: '2026-11-24T16:05:00Z',
      actorId: 'usr-off-2',
      actorName: 'Meenakshi Iyer',
      actorRole: 'officer',
      action: 'DOCUMENT_REQUESTED',
      targetType: 'application',
      targetId: 'JS-2026-001055',
      details: 'Requested missing Family Income Proof / Certificate from Priya Deshmukh.',
      ipAddress: '10.24.19.38',
      severity: 'warning',
    },
    {
      id: 'aud-4',
      timestamp: '2026-11-14T15:40:00Z',
      actorId: 'usr-off-1',
      actorName: 'Rajeshwar Verma',
      actorRole: 'officer',
      action: 'APPLICATION_APPROVED',
      targetType: 'application',
      targetId: 'JS-2026-000991',
      details: 'Approved Domicile Certificate after 96% AI verification confidence.',
      ipAddress: '10.24.19.12',
      severity: 'info',
    },
  ];

  return {
    users,
    services,
    documentRequirements,
    eligibilityRules,
    applications,
    auditLogs,
  };
}

export function loadDemoDb(): DemoDatabase {
  try {
    const raw = localStorage.getItem(DB_STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw) as DemoDatabase;
    }
  } catch {
    // Fallback to fresh seed if storage is malformed
  }
  const initial = createInitialDb();
  saveDemoDb(initial);
  return initial;
}

export function saveDemoDb(db: DemoDatabase): void {
  localStorage.setItem(DB_STORAGE_KEY, JSON.stringify(db));
}

export function resetDemoDb(): DemoDatabase {
  const initial = createInitialDb();
  saveDemoDb(initial);
  return initial;
}

export function appendAuditLog(
  db: DemoDatabase,
  entry: Omit<AuditLog, 'id' | 'timestamp' | 'ipAddress'>,
): void {
  db.auditLogs.unshift({
    ...entry,
    id: `aud-${Date.now()}`,
    timestamp: new Date().toISOString(),
    ipAddress: '10.24.18.105',
  });
}

function evaluateSingleRule(rule: EligibilityRule, formData: Record<string, string | number>): boolean {
  const raw = formData[rule.field];
  if (raw === undefined || raw === null || raw === '') return true;
  const numVal = Number(raw);
  const targetNum = Number(rule.value);

  switch (rule.operator) {
    case '>=':
      return !Number.isNaN(numVal) && !Number.isNaN(targetNum) ? numVal >= targetNum : true;
    case '<=':
      return !Number.isNaN(numVal) && !Number.isNaN(targetNum) ? numVal <= targetNum : true;
    case '==':
      return String(raw).toLowerCase() === rule.value.toLowerCase();
    case '!=':
      return String(raw).toLowerCase() !== rule.value.toLowerCase();
    case 'contains':
      return String(raw).toLowerCase().includes(rule.value.toLowerCase());
    case 'in':
      return rule.value
        .split(',')
        .map((s) => s.trim().toLowerCase())
        .includes(String(raw).toLowerCase());
    default:
      return true;
  }
}

export function generateAiVerificationReport(
  application: Application,
  requirements: DocumentRequirement[],
  rules: EligibilityRule[],
): AIVerificationReport {
  const mandatoryReqs = requirements.filter((r) => r.serviceId === application.serviceId && r.mandatory);
  const uploadedReqIds = new Set(application.documents.map((d) => d.requirementId));
  const missingReqs = mandatoryReqs.filter((r) => !uploadedReqIds.has(r.id));

  const completenessScore =
    mandatoryReqs.length === 0
      ? 100
      : Math.round(((mandatoryReqs.length - missingReqs.length) / mandatoryReqs.length) * 100);

  const findings: VerificationFinding[] = [];

  for (const miss of missingReqs) {
    findings.push({
      id: `fnd-miss-${miss.id}`,
      type: 'missing_document',
      severity: 'high',
      title: `Missing Mandatory Document: ${miss.title}`,
      description: `Upload required: ${miss.description}`,
    });
  }

  let mismatchCount = 0;
  for (const doc of application.documents) {
    if (doc.status === 'mismatch_detected' || doc.status === 'blurry_or_unreadable' || doc.status === 'rejected') {
      mismatchCount += 1;
      findings.push({
        id: `fnd-doc-${doc.id}`,
        type: 'inconsistency',
        severity: 'medium',
        title: `Document Alert: ${doc.title}`,
        description: doc.aiNotes,
      });
    }
  }

  const serviceRules = rules.filter((r) => r.serviceId === application.serviceId && r.isActive);
  let eligibilityPassed = true;
  for (const rule of serviceRules) {
    const passed = evaluateSingleRule(rule, application.formData);
    if (!passed) {
      if (rule.severity === 'blocking') {
        eligibilityPassed = false;
      }
      findings.push({
        id: `fnd-rule-${rule.id}`,
        type: 'eligibility_flag',
        severity: rule.severity === 'blocking' ? 'high' : 'medium',
        title: `Eligibility Rule Flag: ${rule.ruleName}`,
        description: rule.failureMessage,
        fieldAffected: rule.field,
      });
    }
  }

  if (findings.length === 0) {
    findings.push({
      id: 'fnd-all-clear',
      type: 'passed',
      severity: 'info',
      title: 'All Verification Checks Passed',
      description: 'Mandatory documents are complete, OCR values align with form inputs, and all eligibility rules passed.',
    });
  }

  const consistencyScore = Math.max(45, 98 - mismatchCount * 18);
  const rawScore =
    completenessScore * 0.45 + consistencyScore * 0.35 + (eligibilityPassed ? 20 : 0);
  const overallScore = Math.min(99, Math.max(25, Math.round(rawScore)));

  let recommendedAction: AIVerificationReport['recommendedAction'] = 'recommend_approve';
  if (!eligibilityPassed) {
    recommendedAction = 'recommend_reject';
  } else if (missingReqs.length > 0) {
    recommendedAction = 'request_documents';
  } else if (mismatchCount > 0) {
    recommendedAction = 'manual_review';
  }

  const summaryParts: string[] = [];
  summaryParts.push(
    `${mandatoryReqs.length - missingReqs.length}/${mandatoryReqs.length} mandatory documents uploaded.`,
  );
  if (missingReqs.length > 0) {
    summaryParts.push(`Missing: ${missingReqs.map((m) => m.title).join(', ')}.`);
  }
  if (mismatchCount > 0) {
    summaryParts.push(`${mismatchCount} document(s) flagged for OCR or clarity review.`);
  }
  if (!eligibilityPassed) {
    summaryParts.push('One or more statutory eligibility rules failed.');
  } else {
    summaryParts.push('All statutory eligibility thresholds satisfied.');
  }

  return {
    generatedAt: new Date().toISOString(),
    overallScore,
    eligibilityPassed,
    completenessScore,
    consistencyScore,
    summary: summaryParts.join(' '),
    missingDocuments: missingReqs.map((m) => m.title),
    findings,
    recommendedAction,
  };
}

export function buildSimulatedDocumentOcr(
  doc: Omit<UploadedDocument, 'status' | 'aiConfidence' | 'aiNotes' | 'extractedFields'>,
  application: Application,
): Pick<UploadedDocument, 'status' | 'aiConfidence' | 'aiNotes' | 'extractedFields'> {
  const applicantName = String(application.formData.applicantName || application.citizenName);
  const lowerName = doc.fileName.toLowerCase();

  if (lowerName.includes('blur') || lowerName.includes('blurry')) {
    return {
      status: 'blurry_or_unreadable',
      aiConfidence: 42,
      aiNotes: 'Low image contrast / blur detected by OCR quality gate. Please re-upload a clearer scan.',
      extractedFields: [
        { field: 'Applicant Name', extractedValue: 'Unreadable', formValue: applicantName, matches: false, confidence: 38 },
      ],
    };
  }

  if (lowerName.includes('mismatch')) {
    return {
      status: 'mismatch_detected',
      aiConfidence: 76,
      aiNotes: 'Extracted document value differs from application form declaration.',
      extractedFields: [
        { field: 'Applicant Name', extractedValue: applicantName, formValue: applicantName, matches: true, confidence: 96 },
        { field: 'Declared Metric', extractedValue: 'Discrepancy Flagged', formValue: 'Submitted Value', matches: false, confidence: 71 },
      ],
    };
  }

  const fields = [
    {
      field: 'Holder Name',
      extractedValue: applicantName,
      formValue: applicantName,
      matches: true,
      confidence: 97,
    },
  ];

  if (application.formData.district) {
    fields.push({
      field: 'District / Jurisdiction',
      extractedValue: String(application.formData.district),
      formValue: String(application.formData.district),
      matches: true,
      confidence: 94,
    });
  }

  if (application.formData.annualIncome !== undefined) {
    fields.push({
      field: 'Verified Income Reference',
      extractedValue: `INR ${Number(application.formData.annualIncome).toLocaleString('en-IN')}`,
      formValue: `INR ${Number(application.formData.annualIncome).toLocaleString('en-IN')}`,
      matches: true,
      confidence: 95,
    });
  }

  return {
    status: 'ai_verified',
    aiConfidence: 95,
    aiNotes: `OCR extraction completed cleanly for ${doc.title}. Key identifiers match the application form.`,
    extractedFields: fields,
  };
}
