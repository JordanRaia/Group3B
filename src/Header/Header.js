import React, { useState } from "react";
import "./Header.css";
import { Link } from "react-router-dom";
import Logo from "../logo/3B-logos_white.png";
// react-bootstrap
import { Container, Navbar, Nav, NavDropdown } from "react-bootstrap";
//firebase
import { auth, db, storage } from "../firebase";
import { onValue, ref as dbRef } from "firebase/database";
import { onAuthStateChanged } from "firebase/auth";
import { getDownloadURL, ref as stoRef } from "firebase/storage";

function Header() {
    const defaultProfileUrl =
        "https://firebasestorage.googleapis.com/v0/b/group3b-38bd5.appspot.com/o/users%2Fdefault%2Fprofile.png?alt=media&token=ee6e94df-17f3-4ccc-b805-29aef7475798";

    //grab user
    const [user, setUser] = useState({});
    const [name, setName] = useState("");
    //Url to profile picture
    const [profileUrl, setProfileUrl] = useState(defaultProfileUrl);

    //set user to current user
    onAuthStateChanged(auth, (currentUser) => {
        setUser(currentUser);

        if (user) {
            //get ref to name from realtime database
            const nameRef = dbRef(db, `users/${currentUser.uid}/fullname`);
            //when value is changed in database
            onValue(nameRef, (snapshot) => {
                //set data to name
                const data = snapshot.val();
                //save name to useState name
                setName(data);
            });

            //get the URL for the profile picture
            getDownloadURL(
                stoRef(storage, `users/${currentUser.uid}/profile.jpg`)
            ).then((url) => {
                setProfileUrl(url);
            });
        }
    });

    //handle's if the user clicks on sign out
    const handleAuth = async () => {
        //if user is signed in
        if (user) {
            //sign's out the user
            await auth.signOut();
            await setProfileUrl(defaultProfileUrl);
        }
    };

    return (
        <Navbar sticky="top" bg="dark" expand="lg" variant="dark">
            <Container>
                {/* Logo or Title Here */}
                <Link to={"/"} style={{ textDecoration: "none" }}>
                    <img className="header__logo" src={Logo} alt="" />
                </Link>
                {/* adds hamburger menu for mobile */}
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                {/* Navbar Start */}
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="me-auto">
                        {/* Navbar Links */}
                        <Link to={"/"} style={{ textDecoration: "none" }}>
                            <Nav.Link className="header__navLink">Home</Nav.Link>
                        </Link>
                        <Link to={"/"} style={{ textDecoration: "none" }}>
                            <Nav.Link className="header__navLink">Link1</Nav.Link>
                        </Link>
                        <Link to={"/"} style={{ textDecoration: "none" }}>
                            <Nav.Link className="header__navLink">Link2</Nav.Link>
                        </Link>
                        <Link to={"/"} style={{ textDecoration: "none" }}>
                            <Nav.Link className="header__navLink">Link3</Nav.Link>
                        </Link>
                        {/* Dropdown Links */}
                        <NavDropdown className="header__navDropdown" title="Dropdown" id="basic-nav-dropdown">
                            <Link to={"/"} style={{ textDecoration: "none" }}>
                                <NavDropdown.Item className="header__navDropdownItem">Drop1</NavDropdown.Item>
                            </Link>
                            <Link to={"/"} style={{ textDecoration: "none" }}>
                                <NavDropdown.Item className="header__navDropdownItem">Drop2</NavDropdown.Item>
                            </Link>
                            <NavDropdown.Divider />
                            <Link to={"/"} style={{ textDecoration: "none" }}>
                                <NavDropdown.Item className="header__navDropdownItem">Drop3</NavDropdown.Item>
                            </Link>
                        </NavDropdown>
                    </Nav>
                    <div className="header__flex">
                        <img
                            className="header__profilePic"
                            id="profile"
                            src={profileUrl}
                            alt="profile"
                        />
                        <div className="header__flexDown">
                            <div className="header__helloText">
                                Hello {user ? name : "Guest"}
                            </div>
                            {/* If User is signed in it'll say Sign Out otherwise it's Sign In */}
                            <div className="header__linkFlex">
                                <Link
                                    className="header__link"
                                    to={!user && "/login"}
                                >
                                    <div
                                        onClick={handleAuth}
                                        className="header__signIn"
                                    >
                                        {user ? "Sign Out" : "Sign In"}
                                    </div>
                                </Link>
                            </div>
                        </div>
                        <img
                            className="header__profilePic"
                            id="profile1"
                            src={profileUrl}
                            alt="profile"
                        />
                    </div>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
}

export default Header;
