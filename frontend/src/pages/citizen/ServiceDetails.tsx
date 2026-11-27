import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { applicationService } from '../../services/applicationService';
import type {
  DocumentRequirement,
  EligibilityRule,
  GovernmentService,
} from '../../types/service';
import { formatCurrencyInr } from '../../utils/helpers';

export function ServiceDetails() {
  const { serviceId } = useParams<{ serviceId: string }>();
  const [service, setService] = useState<GovernmentService | null>(null);
  const [requirements, setRequirements] = useState<DocumentRequirement[]>([]);
  const [rules, setRules] = useState<EligibilityRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!serviceId) return;
    let active = true;
    applicationService
      .getServiceById(serviceId)
      .then((res) => {
        if (!active) return;
        setService(res.service);
        setRequirements(res.requirements);
        setRules(res.rules);
      })
      .catch((err) => {
        if (active) setError(err instanceof Error ? err.message : 'Service not found.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [serviceId]);

  if (loading) return <LoadingSpinner message="Loading service details..." />;
  if (error || !service) {
    return (
      <div className="alert alert-danger">
        {error || 'Service could not be loaded.'}{' '}
        <Link to="/citizen/services" className="alert-link">
          Back to Services
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-3">
        <Link to="/citizen/services" className="text-decoration-none small fw-medium">
          <i className="bi bi-arrow-left me-1" />
          Back to Services Directory
        </Link>
      </div>

      <div className="js-card p-4 mb-4">
        <div className="d-flex flex-column flex-lg-row align-items-lg-center justify-content-between gap-3">
          <div>
            <div className="d-flex align-items-center gap-2 mb-2">
              <span className="badge bg-primary-subtle text-primary">{service.category}</span>
              <span className="font-mono-code small text-muted">{service.code}</span>
            </div>
            <h1 className="h3 fw-bold mb-1">{service.name}</h1>
            <div className="text-secondary small mb-2">
              <i className="bi bi-building me-1" />
              Issued by: <strong>{service.department}</strong>
            </div>
            <p className="text-muted mb-0">{service.fullDescription}</p>
          </div>

          <div className="d-flex flex-column gap-2 flex-shrink-0">
            <Link to={`/citizen/apply/${service.id}`} className="btn btn-gov-primary px-4 py-2">
              <i className="bi bi-file-earmark-plus me-2" />
              Start Application
            </Link>
            <div className="small text-muted text-center">
              SLA: <strong>{service.processingDays} working days</strong> ·{' '}
              <strong>{formatCurrencyInr(service.feeInr)}</strong>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4">
        <div className="col-lg-7">
          <div className="js-card p-4 h-100">
            <h2 className="h5 fw-bold mb-3">
              <i className="bi bi-file-earmark-check text-primary me-2" />
              Required Documents ({requirements.length})
            </h2>
            <div className="d-flex flex-column gap-3">
              {requirements.map((req) => (
                <div key={req.id} className="border rounded-3 p-3 bg-light">
                  <div className="d-flex align-items-center justify-content-between gap-2 mb-1">
                    <span className="fw-bold text-dark">{req.title}</span>
                    {req.mandatory ? (
                      <span className="badge bg-danger-subtle text-danger">Mandatory</span>
                    ) : (
                      <span className="badge bg-secondary-subtle text-secondary">Optional</span>
                    )}
                  </div>
                  <p className="small text-muted mb-2">{req.description}</p>
                  <div className="small text-secondary mb-1">
                    Formats: <strong>{req.acceptedFormats.join(', ')}</strong> · Max {req.maxSizeMb} MB
                  </div>
                  <div className="d-flex flex-wrap gap-1 mt-2">
                    {req.aiCheckPoints.map((cp) => (
                      <span key={cp} className="badge bg-info-subtle text-info-emphasis fw-normal">
                        <i className="bi bi-cpu me-1" />
                        {cp}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="col-lg-5">
          <div className="js-card p-4 mb-4">
            <h2 className="h5 fw-bold mb-3">
              <i className="bi bi-check2-square text-success me-2" />
              Eligibility Criteria
            </h2>
            <ul className="list-unstyled d-flex flex-column gap-2 mb-0">
              {service.eligibilitySummary.map((item) => (
                <li key={item} className="d-flex align-items-start gap-2 small">
                  <i className="bi bi-check-circle-fill text-success mt-1" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="js-card p-4">
            <h2 className="h6 fw-bold mb-3">
              <i className="bi bi-diagram-3 text-primary me-2" />
              Automated AI Policy Checks ({rules.length})
            </h2>
            {rules.length === 0 ? (
              <div className="small text-muted">Standard document completeness verification applies.</div>
            ) : (
              <div className="d-flex flex-column gap-2">
                {rules.map((rule) => (
                  <div key={rule.id} className="p-2 rounded border bg-light small">
                    <div className="fw-semibold text-dark">{rule.ruleName}</div>
                    <div className="font-mono-code text-primary" style={{ fontSize: '0.78rem' }}>
                      {rule.field} {rule.operator} {rule.value}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
