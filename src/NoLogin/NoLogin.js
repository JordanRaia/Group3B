import React from "react";
import Logo from "../logo/3B-logos_black.png";
import "../InvalidPermissions/InvalidPermissions.css";

function NoLogin() {
    return (
        <div className="permission">
            <div className="permission__flex">
                <div className="permission__logoContainer">
                    <img className="permission__logo" src={Logo} alt="logo" />
                </div>
                <h1 className="permission__header">Sorry,</h1>
                <h2 className="permission__subHeader">
                    Please login to view this page.
                </h2>
            </div>
        </div>
    );
}

export default NoLogin;
