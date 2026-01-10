"use client";

import { useState, useEffect } from "react";
import styles from "./navbar.module.css";
import { FaUserCircle } from "react-icons/fa";
import Logo from "../../images/logo.png"
import Image from "next/image";
import ProfilePanel from "../profilePanel/profilePanel";

const Navbar = () => {
    const [profileOpen, setProfileOpen] = useState(false);

    // Push history state when profile opens
    useEffect(() => {
        if (profileOpen) {
            window.history.pushState({ profilePanel: true }, "");
        }
    }, [profileOpen]);

    // Handle back button
    useEffect(() => {
        const handlePopState = (e: PopStateEvent) => {
            if (e.state?.profilePanel) {
                setProfileOpen(false);
            }
        };

        window.addEventListener("popstate", handlePopState);
        return () => window.removeEventListener("popstate", handlePopState);
    }, []);

    const handleProfileClick = () => {
        setProfileOpen(true);
    };

    const handleCloseProfile = () => {
        setProfileOpen(false);
        window.history.back();
    };

    return(
        <>
            <div className={styles.navBarInterface}>
                <div className={styles.logoArea}>
                   <Image src={Logo} alt="logo" width={30} height={30}/>
                   <p>Plant Care AI</p>
                </div>

                <div className={styles.ProfileArea}>
                    <div className={styles.userArea} onClick={handleProfileClick}>
                        <FaUserCircle width={40}/>
                    </div>
                </div>
            </div>
            <ProfilePanel isOpen={profileOpen} onClose={handleCloseProfile} />
        </>
    )
}

export default Navbar;
