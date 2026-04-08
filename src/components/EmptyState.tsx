type EmptyStateProps = {
  title: string;
  description: string;
};

export const EmptyState = ({ title, description }: EmptyStateProps) => (
  <div className="theme-surface rounded-2xl border border-dashed px-4 py-6 text-center">
    <h3 className="theme-text text-sm font-semibold">{title}</h3>
    <p className="theme-text-muted mt-2 text-xs leading-5">{description}</p>
  </div>
);
