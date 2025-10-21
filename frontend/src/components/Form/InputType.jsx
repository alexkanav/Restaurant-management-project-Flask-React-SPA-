export default function InputType({ title, label, value, onChange, buttonFunc, buttonLabel }) {

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
      <button type="button" onClick={() => buttonFunc(value)}>
         {buttonLabel || 'Оновити'}
      </button>
   </div>
  );
};
