import styles from "./page.module.css"
import LoginForm from "../components/login";
import PlantArea from "../components/plantArea";

const Page = () => {
    return(
<div className={styles.splitScreen}>
      <div className={styles.leftSide}>
        <PlantArea />
      </div>
      <div className={styles.rightSide}>
        <LoginForm />
      </div>
    </div>
        
    )
}

export default Page;