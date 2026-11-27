import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { applicationService } from '../../services/applicationService';
import type { GovernmentService, ServiceCategory } from '../../types/service';
import { formatCurrencyInr } from '../../utils/helpers';

const CATEGORIES: Array<'All' | ServiceCategory> = [
  'All',
  'Income & Revenue',
  'Social Welfare',
  'Education & Scholarship',
  'Identity & Civil',
  'Business & Licensing',
];

export function CitizenServices() {
  const [services, setServices] = useState<GovernmentService[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'All' | ServiceCategory>('All');

  useEffect(() => {
    let active = true;
    applicationService
      .getServices(true)
      .then((data) => {
        if (active) setServices(data);
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
  }, []);

  if (loading) return <LoadingSpinner message="Loading government service directory..." />;

  const filtered = services.filter((srv) => {
    const matchesCat = selectedCategory === 'All' || srv.category === selectedCategory;
    const q = query.trim().toLowerCase();
    const matchesQuery =
      !q ||
      srv.name.toLowerCase().includes(q) ||
      srv.department.toLowerCase().includes(q) ||
      srv.shortDescription.toLowerCase().includes(q) ||
      srv.code.toLowerCase().includes(q);
    return matchesCat && matchesQuery;
  });

  return (
    <div>
      <div className="mb-4">
        <h1 className="h3 fw-bold mb-1">Government Services Directory</h1>
        <p className="text-muted mb-0">
          Select a civic service or welfare scheme to review eligibility criteria, required documents, and apply online.
        </p>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="js-card p-3 mb-4">
        <div className="row g-3 align-items-center">
          <div className="col-lg-5">
            <div className="input-group">
              <span className="input-group-text bg-white">
                <i className="bi bi-search text-muted" />
              </span>
              <input
                type="text"
                className="form-control"
                placeholder="Search by service name, department, or code..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
          </div>
          <div className="col-lg-7">
            <div className="d-flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`btn btn-sm rounded-pill ${
                    selectedCategory === cat ? 'btn-gov-primary' : 'btn-outline-secondary'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="js-card p-5 text-center">
          <i className="bi bi-search fs-1 text-muted d-block mb-2" />
          <h6 className="fw-bold">No Matching Services Found</h6>
          <p className="text-muted small mb-3">
            Try clearing your search filter or selecting another service category.
          </p>
          <button
            type="button"
            className="btn btn-sm btn-outline-primary"
            onClick={() => {
              setQuery('');
              setSelectedCategory('All');
            }}
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="row g-3">
          {filtered.map((srv) => (
            <div key={srv.id} className="col-md-6 col-xl-4">
              <div className="js-card js-card-hover p-4 h-100 d-flex flex-column justify-content-between">
                <div>
                  <div className="d-flex align-items-center justify-content-between gap-2 mb-2">
                    <span className="badge bg-primary-subtle text-primary">{srv.category}</span>
                    <span className="font-mono-code small text-muted">{srv.code}</span>
                  </div>
                  <h5 className="fw-bold mb-1">{srv.name}</h5>
                  <div className="small text-secondary mb-2">
                    <i className="bi bi-building me-1" />
                    {srv.department}
                  </div>
                  <p className="small text-muted mb-3">{srv.shortDescription}</p>
                </div>

                <div>
                  <div className="d-flex justify-content-between small bg-light rounded-2 p-2 mb-3">
                    <span>
                      <i className="bi bi-clock me-1 text-primary" />
                      SLA: <strong>{srv.processingDays} days</strong>
                    </span>
                    <span>
                      <i className="bi bi-cash-coin me-1 text-success" />
                      <strong>{formatCurrencyInr(srv.feeInr)}</strong>
                    </span>
                  </div>

                  <div className="d-flex gap-2">
                    <Link
                      to={`/citizen/services/${srv.id}`}
                      className="btn btn-sm btn-outline-secondary flex-grow-1"
                    >
                      View Details
                    </Link>
                    <Link
                      to={`/citizen/apply/${srv.id}`}
                      className="btn btn-sm btn-gov-primary flex-grow-1"
                    >
                      Apply Now
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
