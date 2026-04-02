/**
 * SeverityBadge — Color-coded severity indicator.
 */
export default function SeverityBadge({ severity = 'unknown' }) {
  const config = {
    minor: { label: 'Minor', color: 'green', emoji: '🟢' },
    moderate: { label: 'Moderate', color: 'yellow', emoji: '🟡' },
    critical: { label: 'Critical', color: 'red', emoji: '🔴' },
    unknown: { label: 'Assessing...', color: 'blue', emoji: '⚪' },
  };

  const { label, color, emoji } = config[severity] || config.unknown;

  return (
    <span className={`badge badge-${color}`}>
      {emoji} {label}
    </span>
  );
}
