import React from 'react'

const FormInput = ({ label, FormElement, Icon, type, id, placeholder, value, step, rows, options, onChange }) => {

  const className = `block w-full px-3 py-2 ${Icon ? 'pl-10' : ''} bg-gray-700 border border-gray-600 rounded-md shadow-sm 
  placeholder-gray-400 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm`;

  return (
    <div>
      {/* Label */}
      <label 
        htmlFor={id}
        className="block text-sm font-medium text-gray-300"
      >
        {label}
      </label>

      {/* Input container */}
      <div className="mt-1 relative rounded-md shadow-sm">

        {/* Icon container */}
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon className="h-5 w-5 text-gray-400" aria-hidden="true" />
          </div>
        )}

        {/* Input field */}
        {FormElement === 'input' && (
          <input 
            className={className}
            type={type}
            id={id}
            name={id}
            placeholder={placeholder}
            step={step ? step : ''}
            value={value}
            onChange={onChange}
            required
          />
        )}

        {/* Select field */}
        {FormElement === 'select' && (
          <select
            className={className}
            id={id}
            name={id}
            value={value}
            onChange={onChange}
            required
          >
            <option value="">Select an option</option>
            {options.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        )}

        {/* Textarea field */}
        {FormElement === 'textarea' && (
          <textarea
            className={className}
            id={id}
            name={id}
            rows={rows ? rows : '3'}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            required
          />
        )}

      </div>
    </div>
  )
};

export default FormInput