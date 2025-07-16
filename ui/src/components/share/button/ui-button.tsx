import "./ui-button.css";

interface ButtonProps {
  text: string;
  full?: boolean;
  submit?: boolean;
  loading?: boolean;
  onClick$?: (event: MouseEvent) => void;
}

export const UiButton = (props: ButtonProps) => {
  const { submit, full, loading, text, ...rest } = props;
  return (
    <button
      type={submit ? "submit" : "button"}
      onClick$={props.onClick$}
      className={`ui-button${full ? " full" : ""}`}
      {...rest}
    >
      {loading ? <em className="loading" /> : <i />}
      <span>{text}</span>
    </button>
  );
};
