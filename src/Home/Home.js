import React from "react";
import "./Home.css";
import Logo from "../logo/3B-logos_black.png";
import { Link } from "react-router-dom";

function Home() {
    return (
        <div className="home_background">
            <div className="home">
                <div className="home__flex">
                    <div className="home__logoContainer">
                        <img src={Logo} alt="Logo" className="home__logo" />
                    </div>
                    <div className="home__flexColumn">
                        <h1 className="home__header">Welcome Back!</h1>
                        <h3>We're 3B Plant Repair</h3>
                    </div>
                </div>
                <div className="cardContainer">
                    <Link
                        className="card"
                        to={"/NewQuote"}
                        style={{ textDecoration: "none" }}
                    >
                        <img
                            className="cardImage"
                            src={require("../Assets/image1.png")}
                            alt=""
                        />
                        <div className="cardContent">
                            <div className="cardHeader">New Quote</div>
                            <p className="cardDesc">Create itemized quotes</p>
                        </div>
                    </Link>
                    <Link
                        className="card"
                        to={"/FinalizeQuote"}
                        style={{ textDecoration: "none" }}
                    >
                        <img
                            className="cardImage"
                            src={require("../Assets/image3.png")}
                            alt=""
                        />
                        <div className="cardContent">
                            <div className="cardHeader">Finalize Quote</div>
                            <p className="cardDesc">Edit and finalize quotes</p>
                        </div>
                    </Link>
                    <Link
                        className="card"
                        to={"/SanctionQuote"}
                        style={{ textDecoration: "none" }}
                    >
                        <img
                            className="cardImage"
                            src={require("../Assets/image2.png")}
                            alt=""
                        />
                        <div className="cardContent">
                            <div className="cardHeader">Sanction Quote</div>
                            <p className="cardDesc">Process finalized quotes</p>
                        </div>
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default Home;
