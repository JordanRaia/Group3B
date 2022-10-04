import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Login.css";
import { defaultLink } from "../constants";
// react-bootstrap
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
//firebase
import { auth } from "../firebase";
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
} from "firebase/auth";

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
                navigate(defaultLink + "/");
            })
            //signing in was unsuccessful and alerting user with error message
            .catch((error) => alert(error.message));
    };

    const register = async (e) => {
        e.preventDefault(); //prevent page from refreshing

        //send email and password to firebase for register
        await createUserWithEmailAndPassword(auth, email, password)
            .then(() => {
                if (auth) {
                    //creating account was successful and redirecting to homepage
                    navigate(defaultLink + "/");
                }
            })
            //creating an account was unsuccessful and alerting user with error message
            .catch((error) => alert(error.message));
    };

    return (
        <div className="login">
            <Link to={defaultLink + "/"} style={{ textDecoration: "none" }}>
                <h1 className="login__logo">Logo</h1>
            </Link>
            <div className="login__border">
                <Form className="login__form">
                    {/* Email input */}
                    <Form.Group className="mb-3" controlId="formBasicEmail">
                        <Form.Label>Email Address</Form.Label>
                        <Form.Control
                            type="email"
                            placeholder="Enter email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </Form.Group>
                    {/* Password input */}
                    <Form.Group className="mb-3" controlId="formBasicPassword">
                        <Form.Label>Password</Form.Label>
                        <Form.Control
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </Form.Group>
                    {/* Save Login Details Checkbox */}
                    <Form.Group className="mb-3" controlId="formBasicCheckbox">
                        <Form.Check type="checkbox" label="Save Credentials" />
                    </Form.Group>
                    <div className="login__signInButtons">
                        <div className="login__button">
                            <Button
                                variant="primary"
                                type="submit"
                                onClick={signIn}
                            >
                                Sign In
                            </Button>
                        </div>
                        <div className="login__button">
                            <Button
                                variant="primary"
                                type="submit"
                                onClick={register}
                            >
                                Create Account
                            </Button>
                        </div>
                    </div>
                </Form>
            </div>
        </div>
    );
}
export default Login;
