export function Footer() {
  return (
    <footer className="bg-white border-top py-3 px-4 mt-auto">
      <div className="d-flex flex-column flex-md-row align-items-center justify-content-between gap-2 small text-muted">
        <div>
          <strong className="text-dark">JanSahayak AI</strong> · Digital Public Service & Automated Verification Platform
        </div>
        <div className="d-flex align-items-center gap-3">
          <span>
            <i className="bi bi-lock-fill text-success me-1" />
            Role-Protected Portal
          </span>
          <span>Helpdesk: 1800-11-4500</span>
        </div>
      </div>
    </footer>
  );
}
