export default function SelectType({ title, label, value, onChange, items, formatValue }) {

  return (
    <div className="form-blc">
      <label className="form-label" htmlFor={label}>{title}</label>
      <select
        id={label}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        <option value="">-- Оберіть необхідне --</option>
        {items.map((name, index) => (
          <option key={name} value={formatValue ? formatValue(name, index) : name}>
            {name}
          </option>
        ))}
      </select>
    </div>
  );
};
