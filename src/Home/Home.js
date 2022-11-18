import React from "react";
import "./Home.css";
import Logo from "../logo/3B-logos_black.png";

function Home() {
    return (
        <div className="home_background">
            <div className="home">
                <div className="home__flex">
                    <div className="home__flexColumn">
                        <h1 className="home__Header"><meta http-equiv="Content-Security-Policy" content="upgrade-insecure-requests"/>Hello There,</h1>
                        <h2 className="home__subHeader">We're 3B Plant Repair</h2>
                    </div>
                    <img className="home__logo" src={Logo} alt="" />
                </div>
            </div>
        </div>
    );
}

export default Home;
