import React, { useState, useEffect } from "react";
import "./Administration.css";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../firebase";
import {
    orderByChild,
    onValue,
    ref as dbRef,
    query,
    equalTo,
    set,
} from "firebase/database";
import TextField from "@mui/material/TextField";
// import Button from "@mui/material/Button";
import { createUserWithEmailAndPassword } from "firebase/auth";

// page for administrator to view all users of the site and be able to change their permissions,
// ie. user, sales associate, in house employee, in house employee 2, and administrator
const Administration = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState({}); // Checking if user is logged in.
    const [users, setUsers] = useState([]); // List of all users.
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    useEffect(() => {
        authState();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    const authState = () => {
        onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            if (user) {
                const usersRef = query(
                    dbRef(db, `users`),
                    orderByChild("rank"),
                    equalTo("salesAssociate")
                );
                onValue(usersRef, (snapshot) => {
                    const data = snapshot.val();
                    const cleanedData = Object.values(data);
                    setUsers(cleanedData);
                });
            }
        });
    };
    const writeUserData = (userId, name, email, imageUrl, rank) => {
        set(dbRef(db, "users/" + userId), {
            fullname: name,
            email: email,
            profile_picture: imageUrl,
            rank: rank,
        });
    };
    const register = async (e) => {
        e.preventDefault(); //prevent page from refreshing

        await createUserWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                if (auth) {
                    //creating account was successful

                    let profileUrl = "users/default/profile_pic.png";

                    //add userdata to database
                    writeUserData(
                        userCredential.user.uid,
                        name,
                        email,
                        profileUrl,
                        "salesAssociate"
                    );
                    resetFields();
                    navigate("/Administration");
                }
            })
            //creating an account was unsuccessful and alerting user with error message
            .catch((error) => alert(error.message));
    };
    const resetFields = () => {
        setName("");
        setEmail("");
        setPassword("");
    };
    return (
        <div className="admin">
            <div className="adminTitle">Administrator</div>
            <div className="divider" />
            {users ? (
                <div className="associateList">
                    {users.map((item) => {
                        console.log(item.fullname);
                        return (
                            <div className="associateNode">
                                <div className="salesAssociates">
                                    {item.fullname}
                                </div>
                                <div className="commission">Commission: </div>
                                <div className="commissionAmt">$500.50</div>
                                <div className="userRank">Associate</div>
                                <button className="editButton">Edit</button>
                                <button className="deleteButton">Delete</button>
                            </div>
                        );
                    })}
                    {/* <div className="associateNode">
                        <div className="salesAssociates">Gerald Ellsworth</div>
                        <div className="commission">Commission: </div>
                        <div className="commissionAmt">$500.50</div>
                        <div className="userRank">Associate</div>
                        <button className="editButton">Edit</button>
                        <button className="deleteButton">Delete</button>
                    </div> */}
                </div>
            ) : (
                <div> Loading... </div>
            )}
            <div className="divider" />
            <div className="newUser">
                <div className="name field">
                    <TextField
                        label="Name"
                        variant="standard"
                        sx={{ mb: "30px" }}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                </div>
                <div className="eMail field">
                    {/* <div className="inputTitle">email:</div> */}
                    <TextField
                        label="Email"
                        variant="standard"
                        sx={{ mb: "30px" }}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>
                <div className="password field">
                    <TextField
                        label="Password"
                        variant="standard"
                        type="password"
                        sx={{ mb: "30px" }}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>
                <button className="login__button" onClick={register}>
                    <div className="login__buttonContainer">
                        <div className="login__buttonText">
                            Create Sales Associate
                        </div>
                    </div>
                </button>
            </div>
        </div>
    );
};

export default Administration;
