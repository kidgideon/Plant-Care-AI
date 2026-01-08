import styles from "./page.module.css"
import Navbar from "../../components/navbar/navbar";
import SummaryCard from "../../components/summary/summaryCards";
import HealthStatusChart from "../../components/dashboardCharts/healthstatuschart";
import HealthScoreTrend from "../../components/dashboardCharts/healthscoretrend";
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
            <HealthStatusChart/>
            <HealthScoreTrend/>
            </div>
        </div>
    )
}

export default Dashboard;