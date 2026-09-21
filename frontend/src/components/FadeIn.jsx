export default function FadeIn({ children, className = "", delay = 0, as = "div" }) {
  const Tag = as;
  return (
    <Tag
      className={`fade-in ${className}`.trim()}
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </Tag>
  );
}
