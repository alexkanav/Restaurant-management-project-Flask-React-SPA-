export default function InputType({ title, label, value, onChange, buttonFunc, buttonLabel, disabled }) {

  return (
    <div className="form-blc">
      <label className="form-label" htmlFor={label}>{title}</label>
      <input
        id={label}
        name={label}
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
      <button className="apply-btn" type="button" disabled={disabled} onClick={() => buttonFunc(value)}>
         {buttonLabel || 'Оновити'}
      </button>
   </div>
  );
};
