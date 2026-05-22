export default function EnvStatusPage() {
  return (
    <div className="page-wrapper flex items-center justify-center p-6">
      <div className="card p-8 max-w-sm text-center">
        <div className="w-12 h-12 rounded-full mx-auto mb-4 flex items-center justify-center"
          style={{ background: 'var(--accent-50)' }}>
          <span className="text-2xl">✅</span>
        </div>
        <h1 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
          Environment Status
        </h1>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          Environment configuration is working correctly.
        </p>
      </div>
    </div>
  );
}
