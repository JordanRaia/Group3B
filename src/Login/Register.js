import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Login.css";
import "./Register.css";
// import Logo from "../logo/3B-logos_black.png";
//firebase
import { db, storage, auth } from "../firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { set, ref as dbRef } from "firebase/database";
import { ref as storageRef, uploadBytes } from "firebase/storage";
//material-ui
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import FormControl from "@mui/material/FormControl";
import Button from "@mui/material/Button";
import FileUploadIcon from "@mui/icons-material/FileUpload";

function Login() {
    const navigate = useNavigate();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [password2, setPassword2] = useState("");
    //url
    const [profileImage, setProfileImage] = useState("");
    //blob
    const [profileImageBlob, setProfileImageBlob] = useState();
    //if profile image was uploaded
    const [profileBool, setProfileBool] = useState(false);

    const defaultProfileUrl =
        "https://firebasestorage.googleapis.com/v0/b/group3b-38bd5.appspot.com/o/users%2Fdefault%2Fprofile.png?alt=media&token=ee6e94df-17f3-4ccc-b805-29aef7475798";

    function writeUserData(userId, name, email, imageUrl, rank) {
        set(dbRef(db, "users/" + userId), {
            fullname: name,
            email: email,
            profile_picture: imageUrl,
            rank: rank,
        });
    }

    const changeHandler = (e) => {
        setProfileImage(URL.createObjectURL(e.target.files[0]));
        setProfileImageBlob(e.target.files[0]);
        setProfileBool(true);
    };

    const handleUpload = () => {
        const upBut = document.getElementById("upload");
        upBut.click();
    };

    const register = async (e) => {
        e.preventDefault(); //prevent page from refreshing

        //check if passwords match
        if (password === password2 && password !== "" && password2 !== "") {
            //send email and password to firebase for register
            await createUserWithEmailAndPassword(auth, email, password)
                .then((userCredential) => {
                    if (auth) {
                        //creating account was successful

                        let profileUrl = "users/default/profile_pic.png";

                        //if a profile picture was uploaded, store it in firebase storage
                        if (profileBool) {
                            const storRef = storageRef(
                                storage,
                                `users/${userCredential.user.uid}/profile.jpg`
                            );
                            uploadBytes(storRef, profileImageBlob);

                            //set profileUrl to url of newly uploaded profile picture
                            profileUrl = `users/${userCredential.user.uid}/profile.jpg`;
                        }

                        //add userdata to database
                        writeUserData(
                            userCredential.user.uid,
                            name,
                            email,
                            profileUrl,
                            "user"
                        );

                        //redirect to homepage
                        navigate("/");
                    }
                })
                //creating an account was unsuccessful and alerting user with error message
                .catch((error) => alert(error.message));
        } else {
            if(password !== "" && password2 !== "")
            {
                alert("Passwords do not match");
            }
        }

        if(name === "" || password2 === "" || password === "" || email === "")
        {
            alert("error: missing fields")
        }
    };

    return (
        <div className="login">
            <div className="login__width">
                <div className="login__center">
                    <div className="login__container">
                        <div className="login__headers">
                            <h1 className="login__headerText">Sign Up</h1>
                            <div className="register__centerLogo">
                                <div className="register__logoContainer">
                                    <img
                                        className="login__logo"
                                        id="profile"
                                        src={
                                            profileBool
                                                ? profileImage
                                                : defaultProfileUrl
                                        }
                                        alt="profile"
                                    />
                                </div>
                            </div>
                        </div>
                        <Box component="form" noValidate autoComplete="off">
                            <FormControl fullWidth>
                                <div className="register__uploadButtonFlex">
                                    <Button
                                        onClick={() => handleUpload()}
                                        className="register__uploadButton"
                                    >
                                        Upload Picture{" "}
                                        <FileUploadIcon className="register__icon" />
                                    </Button>
                                    <input
                                        hidden
                                        id="upload"
                                        accept="image/*"
                                        type="file"
                                        onChange={changeHandler}
                                    />
                                </div>
                                <TextField
                                    label="Full Name"
                                    variant="standard"
                                    sx={{ mb: "30px" }}
                                    className="register__textfield"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                />
                                <TextField
                                    label="Email"
                                    className="register__textfield"
                                    variant="standard"
                                    sx={{ mb: "30px" }}
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                                <TextField
                                    label="Password"
                                    className="register__textfield"
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
                                    className="register__textfield"
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
                                <div>
                                    <div className="register__register">
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
                                    <div className="login__register">
                                        <span className="login__registerText">
                                            • Return to homepage?{" "}
                                        </span>
                                        <Link to={"/"} className="login__link">
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
