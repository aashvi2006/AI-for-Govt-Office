import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { adminService } from '../../services/adminService';
import { applicationService } from '../../services/applicationService';
import type { DocumentRequirement, GovernmentService } from '../../types/service';

export function DocumentRequirementsPage() {
  const [services, setServices] = useState<GovernmentService[]>([]);
  const [requirements, setRequirements] = useState<DocumentRequirement[]>([]);
  const [filterServiceId, setFilterServiceId] = useState('all');
  const [loading, setLoading] = useState(true);

  const [serviceId, setServiceId] = useState('');
  const [title, setTitle] = useState('');
  const [documentType, setDocumentType] = useState('');
  const [description, setDescription] = useState('');
  const [mandatory, setMandatory] = useState(true);
  const [aiCheckpoint, setAiCheckpoint] = useState('');

  useEffect(() => {
    Promise.all([applicationService.getServices(false), adminService.getDocumentRequirements()])
      .then(([srvs, reqs]) => {
        setServices(srvs);
        setRequirements(reqs);
        if (srvs[0]) setServiceId(srvs[0].id);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleAdd = async (e: FormEvent) => {
    e.preventDefault();
    const newReq: DocumentRequirement = {
      id: `req-${Date.now()}`,
      serviceId,
      documentType: documentType.trim().toLowerCase().replace(/\s+/g, '_') || 'supporting_doc',
      title: title.trim(),
      description: description.trim(),
      mandatory,
      acceptedFormats: ['PDF', 'JPG', 'PNG'],
      maxSizeMb: 5,
      aiCheckPoints: aiCheckpoint
        ? aiCheckpoint.split(',').map((s) => s.trim())
        : ['Name & authenticity check'],
    };
    const saved = await adminService.saveDocumentRequirement(newReq);
    setRequirements((prev) => [...prev, saved]);
    setTitle('');
    setDocumentType('');
    setDescription('');
    setAiCheckpoint('');
  };

  const handleDelete = async (id: string) => {
    await adminService.deleteDocumentRequirement(id);
    setRequirements((prev) => prev.filter((r) => r.id !== id));
  };

  if (loading) return <LoadingSpinner message="Loading document requirement schemas..." />;

  const serviceNameMap = new Map(services.map((s) => [s.id, s.name]));
  const visible = requirements.filter(
    (r) => filterServiceId === 'all' || r.serviceId === filterServiceId,
  );

  return (
    <div>
      <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 mb-4">
        <div>
          <h1 className="h3 fw-bold mb-1">Document Requirements Configuration</h1>
          <p className="text-muted mb-0">
            Define mandatory documents and AI OCR verification checkpoints per service.
          </p>
        </div>

        <select
          className="form-select form-select-sm"
          style={{ width: 260 }}
          value={filterServiceId}
          onChange={(e) => setFilterServiceId(e.target.value)}
        >
          <option value="all">All Services ({requirements.length})</option>
          {services.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      <div className="js-card p-4 mb-4">
        <h2 className="h6 fw-bold mb-3">Add Document Requirement</h2>
        <form onSubmit={handleAdd} className="row g-3">
          <div className="col-md-4">
            <label className="form-label small fw-medium">Government Service</label>
            <select
              className="form-select form-select-sm"
              value={serviceId}
              onChange={(e) => setServiceId(e.target.value)}
            >
              {services.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
          <div className="col-md-4">
            <label className="form-label small fw-medium">Document Title</label>
            <input
              type="text"
              className="form-control form-control-sm"
              placeholder="e.g. Ration Card Copy"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div className="col-md-4">
            <label className="form-label small fw-medium">Document Type Key</label>
            <input
              type="text"
              className="form-control form-control-sm"
              placeholder="e.g. ration_card"
              value={documentType}
              onChange={(e) => setDocumentType(e.target.value)}
              required
            />
          </div>
          <div className="col-md-5">
            <label className="form-label small fw-medium">Citizen Instructions</label>
            <input
              type="text"
              className="form-control form-control-sm"
              placeholder="Clear scan of first and last pages"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>
          <div className="col-md-4">
            <label className="form-label small fw-medium">AI Checkpoints (comma-separated)</label>
            <input
              type="text"
              className="form-control form-control-sm"
              placeholder="Head of family match, Address match"
              value={aiCheckpoint}
              onChange={(e) => setAiCheckpoint(e.target.value)}
            />
          </div>
          <div className="col-md-1 d-flex align-items-center pt-3">
            <div className="form-check">
              <input
                id="mandatoryCheck"
                type="checkbox"
                className="form-check-input"
                checked={mandatory}
                onChange={(e) => setMandatory(e.target.checked)}
              />
              <label htmlFor="mandatoryCheck" className="form-check-label small">
                Req.
              </label>
            </div>
          </div>
          <div className="col-md-2 d-flex align-items-end">
            <button type="submit" className="btn btn-sm btn-gov-primary w-100">
              Add Rule
            </button>
          </div>
        </form>
      </div>

      <div className="js-card overflow-hidden">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead>
              <tr>
                <th>Service</th>
                <th>Document</th>
                <th>Requirement</th>
                <th>AI Checkpoints</th>
                <th className="text-end">Action</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((req) => (
                <tr key={req.id}>
                  <td className="small fw-medium">
                    {serviceNameMap.get(req.serviceId) || req.serviceId}
                  </td>
                  <td>
                    <div className="fw-semibold small">{req.title}</div>
                    <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                      {req.description}
                    </div>
                  </td>
                  <td>
                    {req.mandatory ? (
                      <span className="badge bg-danger-subtle text-danger">Mandatory</span>
                    ) : (
                      <span className="badge bg-secondary-subtle text-secondary">Optional</span>
                    )}
                  </td>
                  <td>
                    <div className="d-flex flex-wrap gap-1">
                      {req.aiCheckPoints.map((cp) => (
                        <span key={cp} className="badge bg-info-subtle text-info-emphasis fw-normal">
                          {cp}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="text-end">
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => void handleDelete(req.id)}
                    >
                      <i className="bi bi-trash" />
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
