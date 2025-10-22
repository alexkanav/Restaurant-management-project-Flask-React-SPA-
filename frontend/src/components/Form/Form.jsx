import { useForm } from 'react-hook-form';
import React, { useRef, useEffect } from 'react';
import './Form.css';


export default function Form({
  fieldErrors,
  title,
  fields,
  onSubmit,
  buttonText,
  note,
  loading,
}) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const textareaRefs = useRef({});

  // Watch all field values
  const watchedValues = watch();

  // Auto-resize textareas when their values change
  useEffect(() => {
    fields.forEach((field) => {
      if (field.type === 'textarea') {
        const el = textareaRefs.current[field.name];
        if (el) {
          el.style.height = 'auto';
          el.style.height = el.scrollHeight + 'px';
        }
      }
    });
  }, [watchedValues, fields]);

  return (
    <div className="form-container">
      <form className="form" onSubmit={handleSubmit(onSubmit)}>
        <p className="f-title">{title}</p>

        {fields.map(({ name, type, placeholder, label, required, maxLength = 300 }) => {
          const { ref, ...fieldProps } = register(name, {
            required,
            maxLength,
            validate: (value) => {
              if (type === 'number') {
                if (!Number.isInteger(Number(value))) {
                  return 'Будь ласка, введіть ціле число';
                }
              }
              return true;
            }
          });

          return (
            <div key={name}>
              {label && <label htmlFor={name}>{label}</label>}

              {type === 'textarea' ? (
                <div style={{ position: 'relative' }}>
                  <textarea
                    id={name}
                    className="f-textarea"
                    placeholder={placeholder}
                    disabled={loading}
                    {...fieldProps}
                    rows={1}
                    maxLength={maxLength}
                    style={{
                      overflow: 'hidden',
                      resize: 'none',
                    }}
                    ref={(el) => {
                      textareaRefs.current[name] = el;
                      ref(el); // Connect to react-hook-form
                    }}
                  />

                  {/* Character counter */}
                  <div className="char-counter">
                    Залишилось {maxLength - (watchedValues[name]?.length || 0)} символів
                  </div>
                </div>
              ) : (
                <input
                  id={name}
                  className="f-input"
                  type={type}
                  placeholder={placeholder}
                  maxLength={maxLength}
                  disabled={loading}
                  {...fieldProps}
                  ref={ref}
                />
              )}

              {/* Client-side error */}
              {errors[name] && (
                <p className="error">Це поле є обов'язковим</p>
              )}

              {/* Server-side / backend error */}
              {fieldErrors?.[name] && (
                <p className="error">{fieldErrors[name]}</p>
              )}
            </div>
          );
        })}

        <button className="f-btn" type="submit" disabled={loading}>
          {loading ? 'Відправка...' : buttonText}
        </button>

        {note && <div className="note-container">{note}</div>}
      </form>
    </div>
  );
}
