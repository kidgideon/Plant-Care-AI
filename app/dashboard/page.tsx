import styles from "./page.module.css"
import Navbar from "../../components/navbar/navbar";
import SummaryCard from "../../components/summary/summaryCards";
import HealthStatusChart from "../../components/dashboardCharts/healthstatuschart";
import HealthScoreTrend from "../../components/dashboardCharts/healthscoretrend";
import PlantArea from "../../components/plantsArea/plantsArea";
import Blob from "../../components/aiBlob/blob";
import WelcomeTag from "../../components/welcome/welcome";
const Dashboard = () => {
    return(
        <div className={styles.interface}>
            <Navbar/>
            <WelcomeTag/>
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