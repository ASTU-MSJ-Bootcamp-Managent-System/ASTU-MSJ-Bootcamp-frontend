import StatusBadge from '../common/StatusBadge';

export default function RecordsTable({ heads, rows }) {
  return (
    <div className="card overflow-x-auto">
      <table className="w-full min-w-[560px] text-left text-sm">
        <thead className="border-b border-sand/70 bg-mist/80 text-slate-500">
          <tr>
            {heads.map((head) => (
              <th className="px-5 py-3 font-semibold" key={head}>
                {head}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.join('-')} className="border-b last:border-0">
              {row.map((cell, index) => (
                <td className="px-5 py-4" key={`${heads[index]}-${cell}`}>
                  {heads[index] === 'Status' ? <StatusBadge value={cell} /> : cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
