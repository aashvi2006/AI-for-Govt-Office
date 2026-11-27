import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { adminService } from '../../services/adminService';
import { applicationService } from '../../services/applicationService';
import type { GovernmentService, ServiceCategory } from '../../types/service';
import { formatCurrencyInr } from '../../utils/helpers';

export function AdminServices() {
  const [services, setServices] = useState<GovernmentService[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [department, setDepartment] = useState('');
  const [category, setCategory] = useState<ServiceCategory>('Identity & Civil');
  const [processingDays, setProcessingDays] = useState(10);
  const [feeInr, setFeeInr] = useState(0);
  const [shortDescription, setShortDescription] = useState('');

  useEffect(() => {
    applicationService
      .getServices(false)
      .then(setServices)
      .finally(() => setLoading(false));
  }, []);

  const handleToggleActive = async (service: GovernmentService) => {
    const updated = await adminService.saveService({
      ...service,
      isActive: !service.isActive,
    });
    setServices((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
  };

  const handleCreateService = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const newService: GovernmentService = {
        id: `srv-${Date.now()}`,
        code: code.trim().toUpperCase(),
        name: name.trim(),
        department: department.trim(),
        category,
        shortDescription: shortDescription.trim(),
        fullDescription: shortDescription.trim(),
        processingDays,
        feeInr,
        isActive: true,
        eligibilitySummary: ['Citizen identity verification required.'],
        formFields: [
          { name: 'applicantName', label: 'Applicant Full Name', type: 'text', required: true },
          { name: 'district', label: 'District', type: 'text', required: true },
        ],
      };
      const saved = await adminService.saveService(newService);
      setServices((prev) => [...prev, saved]);
      setCode('');
      setName('');
      setDepartment('');
      setShortDescription('');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading government services catalog..." />;

  return (
    <div>
      <div className="mb-4">
        <h1 className="h3 fw-bold mb-1">Government Service Configuration</h1>
        <p className="text-muted mb-0">
          Add new public services, update SLA timelines, or toggle portal availability.
        </p>
      </div>

      <div className="js-card p-4 mb-4">
        <h2 className="h6 fw-bold mb-3">Register New Government Service</h2>
        <form onSubmit={handleCreateService} className="row g-3">
          <div className="col-md-2">
            <label className="form-label small fw-medium">Service Code</label>
            <input
              type="text"
              className="form-control form-control-sm"
              placeholder="REV-06"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
            />
          </div>
          <div className="col-md-4">
            <label className="form-label small fw-medium">Service Title</label>
            <input
              type="text"
              className="form-control form-control-sm"
              placeholder="e.g. Caste Validity Certificate"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="col-md-3">
            <label className="form-label small fw-medium">Department</label>
            <input
              type="text"
              className="form-control form-control-sm"
              placeholder="Department of Social Justice"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              required
            />
          </div>
          <div className="col-md-3">
            <label className="form-label small fw-medium">Category</label>
            <select
              className="form-select form-select-sm"
              value={category}
              onChange={(e) => setCategory(e.target.value as ServiceCategory)}
            >
              <option value="Identity & Civil">Identity & Civil</option>
              <option value="Social Welfare">Social Welfare</option>
              <option value="Income & Revenue">Income & Revenue</option>
              <option value="Education & Scholarship">Education & Scholarship</option>
              <option value="Business & Licensing">Business & Licensing</option>
            </select>
          </div>
          <div className="col-md-6">
            <label className="form-label small fw-medium">Short Description</label>
            <input
              type="text"
              className="form-control form-control-sm"
              placeholder="Brief summary shown on citizen directory"
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
              required
            />
          </div>
          <div className="col-md-2">
            <label className="form-label small fw-medium">SLA (Days)</label>
            <input
              type="number"
              className="form-control form-control-sm"
              min={1}
              value={processingDays}
              onChange={(e) => setProcessingDays(Number(e.target.value))}
            />
          </div>
          <div className="col-md-2">
            <label className="form-label small fw-medium">Fee (INR)</label>
            <input
              type="number"
              className="form-control form-control-sm"
              min={0}
              value={feeInr}
              onChange={(e) => setFeeInr(Number(e.target.value))}
            />
          </div>
          <div className="col-md-2 d-flex align-items-end">
            <button type="submit" className="btn btn-sm btn-gov-primary w-100" disabled={saving}>
              {saving ? 'Saving...' : 'Create Service'}
            </button>
          </div>
        </form>
      </div>

      <div className="js-card overflow-hidden">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead>
              <tr>
                <th>Code</th>
                <th>Service Name</th>
                <th>Department</th>
                <th>SLA</th>
                <th>Fee</th>
                <th>Status</th>
                <th className="text-end">Action</th>
              </tr>
            </thead>
            <tbody>
              {services.map((srv) => (
                <tr key={srv.id}>
                  <td className="font-mono-code small text-primary fw-semibold">{srv.code}</td>
                  <td>
                    <div className="fw-semibold">{srv.name}</div>
                    <div className="small text-muted">{srv.category}</div>
                  </td>
                  <td className="small">{srv.department}</td>
                  <td className="small">{srv.processingDays} days</td>
                  <td className="small">{formatCurrencyInr(srv.feeInr)}</td>
                  <td>
                    <span
                      className={`badge ${
                        srv.isActive
                          ? 'bg-success-subtle text-success'
                          : 'bg-secondary-subtle text-secondary'
                      }`}
                    >
                      {srv.isActive ? 'Active' : 'Disabled'}
                    </span>
                  </td>
                  <td className="text-end">
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-secondary"
                      onClick={() => void handleToggleActive(srv)}
                    >
                      {srv.isActive ? 'Disable' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
