import { useForm } from 'react-hook-form';
import './Form.css'


export default function Form({ fieldErrors, name, fields, onSubmit, buttonText }) {
  const { register, handleSubmit, formState: { errors }} = useForm();

  return (
     <div className="container">
      <form className="form" onSubmit={handleSubmit(onSubmit)}>
        <div>
          <h2>{name}</h2>

          {fields.map(({ name, label, type, placeholder }) => (
            <div key={name}>
              <label>{label}</label>
              <input
                {...register(name, { required: true })}
                type={type}
                placeholder={placeholder}
              />
              {fieldErrors[name] && <p className="error">{fieldErrors[name]}</p>}
            </div>
          ))}

          <button type="submit">{buttonText}</button>

        </div>
      </form>
    </div>
  )
}

