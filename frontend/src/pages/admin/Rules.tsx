import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { adminService } from '../../services/adminService';
import { applicationService } from '../../services/applicationService';
import type { EligibilityRule, GovernmentService } from '../../types/service';

export function AdminRules() {
  const [services, setServices] = useState<GovernmentService[]>([]);
  const [rules, setRules] = useState<EligibilityRule[]>([]);
  const [loading, setLoading] = useState(true);

  const [serviceId, setServiceId] = useState('');
  const [ruleName, setRuleName] = useState('');
  const [field, setField] = useState('annualIncome');
  const [operator, setOperator] = useState<EligibilityRule['operator']>('<=');
  const [value, setValue] = useState('');
  const [severity, setSeverity] = useState<EligibilityRule['severity']>('blocking');
  const [failureMessage, setFailureMessage] = useState('');

  useEffect(() => {
    Promise.all([applicationService.getServices(false), adminService.getRules()])
      .then(([srvs, rls]) => {
        setServices(srvs);
        setRules(rls);
        if (srvs[0]) setServiceId(srvs[0].id);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleAddRule = async (e: FormEvent) => {
    e.preventDefault();
    const saved = await adminService.saveRule({
      id: `rule-${Date.now()}`,
      serviceId,
      ruleName: ruleName.trim(),
      field: field.trim(),
      operator,
      value: value.trim(),
      failureMessage: failureMessage.trim(),
      severity,
      isActive: true,
    });
    setRules((prev) => [...prev, saved]);
    setRuleName('');
    setValue('');
    setFailureMessage('');
  };

  const handleToggleRule = async (rule: EligibilityRule) => {
    const updated = await adminService.saveRule({
      ...rule,
      isActive: !rule.isActive,
    });
    setRules((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
  };

  const handleDelete = async (ruleId: string) => {
    await adminService.deleteRule(ruleId);
    setRules((prev) => prev.filter((r) => r.id !== ruleId));
  };

  if (loading) return <LoadingSpinner message="Loading AI eligibility rules..." />;

  const serviceNameMap = new Map(services.map((s) => [s.id, s.name]));

  return (
    <div>
      <div className="mb-4">
        <h1 className="h3 fw-bold mb-1">Eligibility Rule Configuration</h1>
        <p className="text-muted mb-0">
          Configure automated statutory thresholds evaluated by JanSahayak AI during pre-screening.
        </p>
      </div>

      <div className="js-card p-4 mb-4">
        <h2 className="h6 fw-bold mb-3">Create Eligibility Rule</h2>
        <form onSubmit={handleAddRule} className="row g-3">
          <div className="col-md-4">
            <label className="form-label small fw-medium">Service</label>
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
            <label className="form-label small fw-medium">Rule Name</label>
            <input
              type="text"
              className="form-control form-control-sm"
              placeholder="e.g. Max Family Income Limit"
              value={ruleName}
              onChange={(e) => setRuleName(e.target.value)}
              required
            />
          </div>
          <div className="col-md-4">
            <label className="form-label small fw-medium">Form Field Key</label>
            <input
              type="text"
              className="form-control form-control-sm"
              placeholder="e.g. annualIncome, age, previousPercentage"
              value={field}
              onChange={(e) => setField(e.target.value)}
              required
            />
          </div>
          <div className="col-md-2">
            <label className="form-label small fw-medium">Operator</label>
            <select
              className="form-select form-select-sm"
              value={operator}
              onChange={(e) => setOperator(e.target.value as EligibilityRule['operator'])}
            >
              <option value="<=">&lt;=</option>
              <option value=">=">&gt;=</option>
              <option value="==">==</option>
              <option value="!=">!=</option>
              <option value="contains">contains</option>
              <option value="in">in</option>
            </select>
          </div>
          <div className="col-md-2">
            <label className="form-label small fw-medium">Threshold Value</label>
            <input
              type="text"
              className="form-control form-control-sm"
              placeholder="e.g. 250000"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              required
            />
          </div>
          <div className="col-md-2">
            <label className="form-label small fw-medium">Severity</label>
            <select
              className="form-select form-select-sm"
              value={severity}
              onChange={(e) => setSeverity(e.target.value as EligibilityRule['severity'])}
            >
              <option value="blocking">Blocking</option>
              <option value="warning">Warning</option>
            </select>
          </div>
          <div className="col-md-4">
            <label className="form-label small fw-medium">Failure Explanation</label>
            <input
              type="text"
              className="form-control form-control-sm"
              placeholder="Message shown when rule fails"
              value={failureMessage}
              onChange={(e) => setFailureMessage(e.target.value)}
              required
            />
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
                <th>Rule</th>
                <th>Expression</th>
                <th>Severity</th>
                <th>Status</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rules.map((rule) => (
                <tr key={rule.id}>
                  <td className="small fw-medium">
                    {serviceNameMap.get(rule.serviceId) || rule.serviceId}
                  </td>
                  <td>
                    <div className="fw-semibold small">{rule.ruleName}</div>
                    <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                      {rule.failureMessage}
                    </div>
                  </td>
                  <td className="font-mono-code small text-primary">
                    {rule.field} {rule.operator} {rule.value}
                  </td>
                  <td>
                    <span
                      className={`badge ${
                        rule.severity === 'blocking'
                          ? 'bg-danger-subtle text-danger'
                          : 'bg-warning-subtle text-warning-emphasis'
                      }`}
                    >
                      {rule.severity}
                    </span>
                  </td>
                  <td>
                    <span
                      className={`badge ${
                        rule.isActive
                          ? 'bg-success-subtle text-success'
                          : 'bg-secondary-subtle text-secondary'
                      }`}
                    >
                      {rule.isActive ? 'Enabled' : 'Paused'}
                    </span>
                  </td>
                  <td className="text-end text-nowrap">
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-secondary me-2"
                      onClick={() => void handleToggleRule(rule)}
                    >
                      {rule.isActive ? 'Pause' : 'Enable'}
                    </button>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => void handleDelete(rule.id)}
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
