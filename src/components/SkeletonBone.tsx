export default function SkeletonBone({
  className = '',
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  return <div className={`skeleton-bone ${className}`} style={style} aria-hidden />;
}
