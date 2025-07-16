import "./ui-input.css?";

interface InputProps {
  name: string;
  placeholder?: string;
  label: string;
  type: "text" | "password";
  error?: string | undefined | boolean;
  value?: string;
}

export const UiInput = (props: InputProps) => {
  const { name, type, value, label, placeholder, error, ...rest } = props;
  return (
    <div className={`ui-input ${props.error ? " error" : ""}`} {...props}>
      <label htmlFor={name}>{label}</label>
      <input
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        value={value}
        {...rest}
      />
      <span>{error}</span>
    </div>
  );
};
