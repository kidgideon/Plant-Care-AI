import styles from "./spinner.module.css";

type SpinnerProps = {
  show?: boolean;
};

const Spinner = ({ show = true }: SpinnerProps) => {
  if (!show) return null;

  return (
    <div className={styles.overlay} role="status" aria-live="polite">
      <div className={styles.spinner} />
    </div>
  );
};

export default Spinner;
