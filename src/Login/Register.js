import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Login.css";
import Logo from "../logo/3B-logos_black.png";
//firebase
import { auth } from "../firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
//material-ui
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import FormControl from "@mui/material/FormControl";

function Login() {
    const navigate = useNavigate();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [password2, setPassword2] = useState("");

    const register = async (e) => {
        e.preventDefault(); //prevent page from refreshing

        //check if passwords match
        if (password === password2) {
            //send email and password to firebase for register
            await createUserWithEmailAndPassword(auth, email, password)
                .then(() => {
                    if (auth) {
                        //creating account was successful and redirecting to homepage
                        navigate("/");
                    }
                })
                //creating an account was unsuccessful and alerting user with error message
                .catch((error) => alert(error.message));
        } else {
            alert("Passwords do not match");
        }
    };

    return (
        <div className="login">
            <div className="login__width">
                <div className="login__center">
                    <div className="login__container">
                        <div className="login__headers">
                            <h1 className="login__headerText">Sign Up</h1>
                            <div className="login__centerLogo">
                                <div className="login__logoContainer">
                                    <Link
                                        to={"/"}
                                        style={{ textDecoration: "none" }}
                                    >
                                        <img
                                            className="login__logo"
                                            src={Logo}
                                            alt="logo"
                                        />
                                    </Link>
                                </div>
                            </div>
                        </div>
                        <Box component="form" noValidate autoComplete="off">
                            <FormControl fullWidth>
                                <TextField
                                    label="Full Name"
                                    variant="standard"
                                    sx={{ mb: "30px" }}
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                />
                                <TextField
                                    label="Email"
                                    variant="standard"
                                    sx={{ mb: "30px" }}
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                                <TextField
                                    label="Password"
                                    variant="standard"
                                    type="password"
                                    sx={{ mb: "30px" }}
                                    value={password}
                                    onChange={(e) =>
                                        setPassword(e.target.value)
                                    }
                                />
                                <TextField
                                    label="Confirm Password"
                                    variant="standard"
                                    type="password"
                                    sx={{ mb: "50px" }}
                                    value={password2}
                                    onChange={(e) =>
                                        setPassword2(e.target.value)
                                    }
                                />
                                <button
                                    className="login__button"
                                    onClick={register}
                                >
                                    <div className="login__buttonContainer">
                                        <div className="login__buttonText">
                                            Sign Up
                                        </div>
                                    </div>
                                </button>
                                <div className="login__register">
                                    <span className="login__registerText">
                                        • Already have an account?{" "}
                                    </span>
                                    <Link
                                        to={"/login"}
                                        className="login__link"
                                    >
                                        <div className="login__registerLink">
                                            Sign in
                                        </div>
                                    </Link>
                                </div>
                            </FormControl>
                        </Box>
                    </div>
                </div>
            </div>
        </div>
    );
}
export default Login;
