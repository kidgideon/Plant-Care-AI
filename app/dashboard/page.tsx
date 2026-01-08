import styles from "./page.module.css"
import Navbar from "../../components/navbar/navbar";
import SummaryCard from "../../components/summary/summaryCards";
import HealthStatusChart from "../../components/dashboardCharts/healthstatuschart";
import HealthScoreTrend from "../../components/dashboardCharts/healthscoretrend";
import PlantArea from "../../components/plantsArea/plantsArea";
import Blob from "../../components/aiBlob/blob";
const Dashboard = () => {
    return(
        <div className={styles.interface}>
            <Navbar/>
            <div className={styles.welcome_date}>
       <p className={styles.welcomeTag}>
            Hello, Gilbert Marguire
        </p>
        <p className={styles.dateTag}>january 6 Monday 2025</p>
            </div>
            <SummaryCard/>
            <div className={styles.chartArea}>
                <div className={styles.ChartOne}>
                  <HealthScoreTrend/>
                </div>
                <div className={styles.chartTwo}>
                      <HealthStatusChart/>
                </div>
            </div>
            <PlantArea/>
            <Blob/>
        </div>
    )
}

export default Dashboard;