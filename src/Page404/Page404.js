import React from "react";
import "./Page404.css";
import Logo from "../logo/3B-logos_black.png";

function Page404() {
    return (
        <div className="page404">
            <div className="page404__flex">
                <div className="page404__logoContainer">
                    <img className="page404__logo" src={Logo} alt="logo" />
                </div>
                <h1 className="page404__header">ERROR: 404</h1>
                <h2 className="page404__subHeader">Page not found</h2>
            </div>
        </div>
    );
}

export default Page404;
