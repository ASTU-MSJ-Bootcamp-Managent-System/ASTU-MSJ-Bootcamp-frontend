const successStatuses = ['Present', 'Published', 'Active'];
const warningStatuses = ['Suspended'];

function getStatusClass(value) {
  if (value.includes('Completed') || successStatuses.includes(value)) {
    return 'bg-moss/10 text-moss';
  }

  if (value.includes('Late') || value.includes('Improvement') || warningStatuses.includes(value)) {
    return 'bg-amber-50 text-amber-800';
  }

  if (value === 'Banned') {
    return 'bg-rose-50 text-rose-700';
  }

  return 'bg-brand/10 text-brand';
}

export default function StatusBadge({ value }) {
  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusClass(value)}`}>
      {value}
    </span>
  );
}
