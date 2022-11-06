import React, { useState } from "react";
import "./Header.css";
import { Link } from "react-router-dom";
import Logo from "../logo/3B-logos_white.png";
// react-bootstrap
import { Container, Navbar, Nav, NavDropdown } from "react-bootstrap";
//firebase
import { auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";

function Header() {
    //grab user
    const [user, setUser] = useState({});

    //set user to current user
    onAuthStateChanged(auth, (currentUser) => {
        setUser(currentUser);
    });

    //handle's if the user clicks on sign out
    const handleAuth = () => {
        //if user is signed in
        if (user) {
            //sign's out the user
            auth.signOut();
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
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="me-auto">
                        {/* Navbar Links */}
                        <Link to={"/"} style={{ textDecoration: "none" }}>
                            <Nav.Link>Home</Nav.Link>
                        </Link>
                        <Link to={"/"} style={{ textDecoration: "none" }}>
                            <Nav.Link>Link1</Nav.Link>
                        </Link>
                        <Link to={"/"} style={{ textDecoration: "none" }}>
                            <Nav.Link>Link2</Nav.Link>
                        </Link>
                        <Link to={"/"} style={{ textDecoration: "none" }}>
                            <Nav.Link>Link3</Nav.Link>
                        </Link>
                        {/* Dropdown Links */}
                        <NavDropdown title="Dropdown" id="basic-nav-dropdown">
                            <Link to={"/"} style={{ textDecoration: "none" }}>
                                <NavDropdown.Item>Drop1</NavDropdown.Item>
                            </Link>
                            <Link to={"/"} style={{ textDecoration: "none" }}>
                                <NavDropdown.Item>Drop2</NavDropdown.Item>
                            </Link>
                            <NavDropdown.Divider />
                            <Link to={"/"} style={{ textDecoration: "none" }}>
                                <NavDropdown.Item>Drop3</NavDropdown.Item>
                            </Link>
                        </NavDropdown>
                    </Nav>
                    <div onClick={handleAuth} className="Header__flexDown">
                        <div className="Header__helloText">
                            Hello {user ? user?.email : "Guest"}
                        </div>
                        {/* If User is signed in it'll say Sign Out otherwise it's Sign In */}
                        <Link className="Header__link" to={!user && "/login"}>
                            <div className="Header__SignIn">
                                {user ? "Sign Out" : "Sign In"}
                            </div>
                        </Link>
                    </div>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
}

export default Header;
