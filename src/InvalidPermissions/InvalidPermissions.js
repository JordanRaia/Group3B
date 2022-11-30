import React from "react";
import Logo from "../logo/3B-logos_black.png";
import "./InvalidPermissions.css";

function InvalidPermissions() {
    return (
        <div className="permission">
            <div className="permission__flex">
                <div className="permission__logoContainer">
                    <img className="permission__logo" src={Logo} alt="logo" />
                </div>
                <h1 className="permission__header">Sorry,</h1>
                <h2 className="permission__subHeader">
                    You do not have permissions to access this page.
                </h2>
            </div>
        </div>
    );
}

export default InvalidPermissions;
