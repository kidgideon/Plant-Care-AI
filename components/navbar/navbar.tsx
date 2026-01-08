import styles from "./navbar.module.css";
import { FaUserCircle, FaBell } from "react-icons/fa";
import Logo from "../../images/logo.png"
import Image from "next/image";

const Navbar = () => {
    return(
        <div className={styles.navBarInterface}>
<div className={styles.logoArea}>
   <Image src={Logo} alt="logo" width={30} height={30}/>
   <p>Plant Care AI</p>
</div>

<div className={styles.ProfileArea}>
    <div>  <FaUserCircle width={40}/></div>
    <div className={styles.notificationBell}> 
        <FaBell width={40}/>
        </div>
</div>
        </div>
    )
}

export default Navbar;