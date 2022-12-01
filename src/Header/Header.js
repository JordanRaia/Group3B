import React, { useState } from "react";
import "./Header.css";
import { Link, Outlet } from "react-router-dom";
import Logo from "../logo/3B-logos_black.png";
// react-bootstrap
import { Container, Navbar, Nav } from "react-bootstrap";
//firebase
import { auth, db, storage } from "../firebase";
import { onValue, ref as dbRef } from "firebase/database";
import { onAuthStateChanged } from "firebase/auth";
import { getDownloadURL, ref as stoRef } from "firebase/storage";

function Header() {
    const defaultProfileUrl =
        "https://firebasestorage.googleapis.com/v0/b/group3b-38bd5.appspot.com/o/users%2Fdefault%2Fprofile.jpg?alt=media&token=6d49f5cd-3830-48ea-8cb4-363af2ddf703";

    //grab user
    const [user, setUser] = useState({});
    const [rank, setRank] = useState("");
    const [name, setName] = useState("");
    //Url to profile picture
    const [profile, setProfile] = useState("");
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

            const profileRef = dbRef(
                db,
                `users/${currentUser.uid}/profile_picture`
            );

            onValue(profileRef, (snapshot) => {
                const data = snapshot.val();

                setProfile(data);
            });

            // get the user's rank
            const rankRef = dbRef(db, `users/${currentUser.uid}/rank`);
            onValue(rankRef, (snapshot) => {
                //set data to name
                const data = snapshot.val();
                //save name to useState name
                setRank(data);
            });

            if (profile !== "users/default/profile.jpg" && profile !== "") {
                //get the URL for the profile picture
                getDownloadURL(stoRef(storage, profile))
                    .then((url) => {
                        setProfileUrl(url);
                    })
                    .catch((error) => {
                        console.log(error);
                    });
            } else {
                setProfileUrl(defaultProfileUrl);
            }
        } else {
            //set profile picture to deafult
            setProfileUrl(defaultProfileUrl);
            setRank("");
        }
    });

    //handle's if the user clicks on sign out
    const handleAuth = async () => {
        //if user is signed in
        if (user) {
            //sign's out the user
            await auth.signOut();
        }
    };

    return (
        <>
            <header class="header__bar">
                <Navbar sticky="top" expand="lg">
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
                                {/* Home */}
                                <Nav.Link
                                    as={Link}
                                    to={"/"}
                                    className="header__navLink"
                                >
                                    Home
                                </Nav.Link>
                                {/* New Quote */}
                                {(rank === "sales" || rank === "dev") && (
                                    <Nav.Link
                                        as={Link}
                                        to={"/NewQuote"}
                                        className="header__navLink"
                                    >
                                        New Quote
                                    </Nav.Link>
                                )}
                                {/* Finalize Quote */}
                                {(rank === "inhouse1" || rank === "dev") && (
                                    <Nav.Link
                                        as={Link}
                                        to={"/FinalizeQuote"}
                                        className="header__navLink"
                                    >
                                        Finalize Quote
                                    </Nav.Link>
                                )}
                                {/* Sanction Quote */}
                                {(rank === "inhouse2" || rank === "dev") && (
                                    <Nav.Link
                                        as={Link}
                                        to={"/SanctionQuote"}
                                        className="header__navLink"
                                    >
                                        Sanction Quote
                                    </Nav.Link>
                                )}
                                {/* Administration */}
                                {(rank === "admin" || rank === "dev") && (
                                    <div className="header__divider" />
                                )}
                                {(rank === "admin" || rank === "dev") && (
                                    <Nav.Link
                                        as={Link}
                                        to={"/Administration"}
                                        className="header__navLink"
                                    >
                                        Administration
                                    </Nav.Link>
                                )}
                                {/* Quotes */}
                                {(rank === "admin" || rank === "dev") && (
                                    <Nav.Link
                                        as={Link}
                                        to={"/Quotes"}
                                        className="header__navLink"
                                    >
                                        Quotes
                                    </Nav.Link>
                                )}
                            </Nav>
                            <div className="header__flex">
                                <img
                                    className="header__profilePic"
                                    id="profile"
                                    src={profileUrl}
                                    alt="profile"
                                />

                                {/* <div className="divider" /> */}

                                {/* If User is signed in it'll say Sign Out otherwise it's Sign In */}
                                <div className="header__linkFlex">
                                    <div className="header__helloText">
                                        {user ? name : "Guest"}
                                    </div>
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
                {/* Allows for elemnts underneath in react-router-dom (in App.js) */}
                    <Outlet />

            </header>
        </>
    );
}

export default Header;
