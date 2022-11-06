import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Login.css";
import Logo from "../logo/3B-logos_black.png";
//firebase
import { auth } from "../firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
//material-ui
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import FormControl from "@mui/material/FormControl";

function Login() {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const signIn = async (e) => {
        e.preventDefault(); //prevent page from refreshing

        //send email and password to firebase for sign in authentication
        await signInWithEmailAndPassword(auth, email, password)
            .then(() => {
                //sign in was successful and redirecting to homepage
                navigate("/");
            })
            //signing in was unsuccessful and alerting user with error message
            .catch((error) => alert(error.message));
    };

    return (
        <div className="login">
            <div className="login__width">
                <div className="login__center">
                    <div className="login__container">
                        <div className="login__headers">
                            <h1 className="login__headerText">Welcome</h1>
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
                                    sx={{ mb: "50px" }}
                                    value={password}
                                    onChange={(e) =>
                                        setPassword(e.target.value)
                                    }
                                />
                                <button
                                    className="login__button"
                                    onClick={signIn}
                                >
                                    <div className="login__buttonContainer">
                                        <div className="login__buttonText">
                                            Login
                                        </div>
                                    </div>
                                </button>
                                <div>
                                    <div className="login__register">
                                        <span className="login__registerText">
                                            • Don't have an account?{" "}
                                        </span>
                                        <Link
                                            to={"/register"}
                                            className="login__link"
                                        >
                                            <div className="login__registerLink">
                                                Sign up
                                            </div>
                                        </Link>
                                    </div>
                                    <div className="login__register">
                                        <span className="login__registerText">
                                            • Return to homepage?{" "}
                                        </span>
                                        <Link
                                            to={"/"}
                                            className="login__link"
                                        >
                                            <div className="login__registerLink">
                                                Home
                                            </div>
                                        </Link>
                                    </div>
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
