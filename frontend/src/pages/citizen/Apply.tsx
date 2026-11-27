import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { useAuth } from '../../context/AuthContext';
import { applicationService } from '../../services/applicationService';
import type { GovernmentService } from '../../types/service';
import { formatCurrencyInr } from '../../utils/helpers';

function buildDefaultFormData(
  service: GovernmentService | null,
  applicantName?: string,
): Record<string, string | number> {
  if (!service) return {};
  const defaults: Record<string, string | number> = {};
  for (const field of service.formFields) {
    defaults[field.name] = field.name === 'applicantName' && applicantName ? applicantName : '';
  }
  return defaults;
}

export function ApplyPage() {
  const { serviceId } = useParams<{ serviceId?: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [services, setServices] = useState<GovernmentService[]>([]);
  const [selectedServiceId, setSelectedServiceId] = useState(serviceId || '');
  const [formData, setFormData] = useState<Record<string, string | number>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedService = services.find((s) => s.id === selectedServiceId) || null;

  useEffect(() => {
    let active = true;
    applicationService
      .getServices(true)
      .then((list) => {
        if (!active) return;
        setServices(list);
        const initialId = serviceId || list[0]?.id || '';
        setSelectedServiceId(initialId);
        const initialService = list.find((s) => s.id === initialId) || null;
        setFormData(buildDefaultFormData(initialService, user?.fullName));
      })
      .catch((err) => {
        if (active) setError(err instanceof Error ? err.message : 'Unable to load services.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [serviceId, user?.fullName]);

  const handleServiceChange = (newId: string) => {
    setSelectedServiceId(newId);
    const nextService = services.find((s) => s.id === newId) || null;
    setFormData(buildDefaultFormData(nextService, user?.fullName));
  };

  const handleFieldChange = (name: string, value: string, isNumber: boolean) => {
    setFormData((prev) => ({
      ...prev,
      [name]: isNumber && value !== '' ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedService) return;
    setError(null);
    setSubmitting(true);
    try {
      const created = await applicationService.createApplication({
        serviceId: selectedService.id,
        formData,
      });
      navigate(`/citizen/applications/${created.id}/documents`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create application.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner message="Preparing application form..." />;

  return (
    <div style={{ maxWidth: 880 }} className="mx-auto">
      <div className="mb-3">
        <Link to="/citizen/services" className="text-decoration-none small fw-medium">
          <i className="bi bi-arrow-left me-1" />
          Back to Services
        </Link>
      </div>

      <div className="js-card p-4">
        <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-2 pb-3 mb-4 border-bottom">
          <div>
            <h1 className="h4 fw-bold mb-1">Government Service Application Form</h1>
            <p className="text-muted small mb-0">
              Step 1 of 3: Fill applicant details accurately to match your supporting documents.
            </p>
          </div>
          <span className="badge bg-primary-subtle text-primary px-3 py-2">
            Step 1 · Form Submission
          </span>
        </div>

        {error && <div className="alert alert-danger small">{error}</div>}

        <div className="mb-4">
          <label htmlFor="serviceSelect" className="form-label fw-semibold small">
            Select Government Service
          </label>
          <select
            id="serviceSelect"
            className="form-select"
            value={selectedServiceId}
            onChange={(e) => handleServiceChange(e.target.value)}
          >
            {services.map((srv) => (
              <option key={srv.id} value={srv.id}>
                {srv.name} ({srv.department}) — {formatCurrencyInr(srv.feeInr)}
              </option>
            ))}
          </select>
        </div>

        {selectedService && (
          <form onSubmit={handleSubmit}>
            <div className="alert alert-light border small mb-4">
              <div className="fw-semibold text-dark mb-1">
                <i className="bi bi-info-circle text-primary me-1" />
                {selectedService.name} — Key Requirements
              </div>
              <ul className="mb-0 ps-3 text-secondary">
                {selectedService.eligibilitySummary.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>

            <div className="row g-3">
              {selectedService.formFields.map((field) => (
                <div
                  key={field.name}
                  className={field.type === 'textarea' ? 'col-12' : 'col-md-6'}
                >
                  <label htmlFor={`field-${field.name}`} className="form-label fw-medium small">
                    {field.label}
                    {field.required && <span className="text-danger ms-1">*</span>}
                  </label>

                  {field.type === 'select' ? (
                    <select
                      id={`field-${field.name}`}
                      className="form-select"
                      required={field.required}
                      value={String(formData[field.name] ?? '')}
                      onChange={(e) => handleFieldChange(field.name, e.target.value, false)}
                    >
                      <option value="">Choose option...</option>
                      {field.options?.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  ) : field.type === 'textarea' ? (
                    <textarea
                      id={`field-${field.name}`}
                      className="form-control"
                      rows={3}
                      required={field.required}
                      placeholder={field.placeholder}
                      value={String(formData[field.name] ?? '')}
                      onChange={(e) => handleFieldChange(field.name, e.target.value, false)}
                    />
                  ) : (
                    <input
                      id={`field-${field.name}`}
                      type={field.type}
                      className="form-control"
                      required={field.required}
                      placeholder={field.placeholder}
                      value={String(formData[field.name] ?? '')}
                      onChange={(e) =>
                        handleFieldChange(field.name, e.target.value, field.type === 'number')
                      }
                    />
                  )}
                </div>
              ))}
            </div>

            <div className="d-flex justify-content-end gap-2 mt-4 pt-3 border-top">
              <Link to="/citizen/services" className="btn btn-outline-secondary">
                Cancel
              </Link>
              <button type="submit" className="btn btn-gov-primary px-4" disabled={submitting}>
                {submitting ? (
                  <LoadingSpinner compact message="Saving Application..." />
                ) : (
                  <>
                    Save & Proceed to Document Upload <i className="bi bi-arrow-right ms-1" />
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
