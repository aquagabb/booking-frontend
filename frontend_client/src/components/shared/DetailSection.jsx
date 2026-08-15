const DetailSection = ({ title, children, className = "" }) => (
  <div className={`border-b border-gray-200 pb-6 ${className}`}>
    <h2 className="text-2xl font-semibold text-gray-900 mb-4">{title}</h2>
    {children}
  </div>
);

export default DetailSection;
