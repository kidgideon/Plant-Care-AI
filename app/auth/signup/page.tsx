import styles from "./page.module.css";
import SignupForm from "../components/signup";
import PlantArea from "../components/plantArea";

const Page = () => {
  return (
    <div className={styles.splitScreen}>
      <div className={styles.leftSide}>
        <PlantArea />
      </div>
      <div className={styles.rightSide}>
        <SignupForm />
      </div>
    </div>
  );
};

export default Page;
