import styles from "./summary.module.css";
import { FaLeaf, FaCheckCircle, FaExclamationTriangle, FaTimesCircle } from "react-icons/fa";

const summaryItems = [
  { title: "Total Plants", value: 12, icon: <FaLeaf />, color: "var(--color-primary)" },
  { title: "Healthy", value: 7, icon: <FaCheckCircle />, color: "var(--color-success)" },
  { title: "At-Risk", value: 2, icon: <FaExclamationTriangle />, color: "var(--color-warning)" },
  { title: "Declining", value: 3, icon: <FaTimesCircle />, color: "var(--color-error)" },
];

const SummaryCard = () => {
  return (
    <div className={styles.interface}>
      {summaryItems.map((item, index) => (
        <div key={index} className={styles.card}>
          <div className={styles.icon} style={{ color: item.color }}>
            {item.icon}
          </div>
          <div className={styles.details}>
            <p className={styles.title}>{item.title}</p>
            <p className={styles.value}>{item.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SummaryCard;
