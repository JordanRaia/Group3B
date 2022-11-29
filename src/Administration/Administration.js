import React, {useState, useEffect} from "react";
import "./Administration.css";
import EditUser from "./EditUser.js";
import { useNavigate } from "react-router-dom";
import { 
    onAuthStateChanged,
    createUserWithEmailAndPassword,
    // getAuth
} from "firebase/auth";
import { auth, db } from "../firebase";
import {
    orderByChild,
    onValue,
    ref as dbRef,
    query,
    equalTo,
    set,
    update,
    remove
} from "firebase/database";
import TextField from "@mui/material/TextField";
// import Button from "@mui/material/Button";

// page for administrator to view all users of the site and be able to change their permissions,
// ie. user, sales associate, in house employee, in house employee 2, and administrator
const Administration = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState({}); // Checking if user is logged in.
    const [users, setUsers] = useState([]); // List of all users.
    const [newName, setNewName] = useState("");
    const [newEmail, setNewEmail] = useState("");
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [commission, setCommission] = useState("");
    const [popup, setPopup] = useState(false);
    useEffect(() => {authState();}, []);

    const authState = () => {
        onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            if (user) {
                const usersRef = query(dbRef(db, `users`), orderByChild("rank"), equalTo("salesAssociate"))
                onValue(usersRef, (snapshot) => {
                    const data = snapshot.val();
                    const cleanedData = Object.values(data)
                    setUsers(cleanedData);
                    console.log(cleanedData);
                });
            }
            
        });
    }
    function writeUserData(userId, name, email, imageUrl, rank, commission) {
        set(dbRef(db, "users/" + userId), {
            commission: commission,
            userIdNo: userId,
            fullname: name,
            email: email,
            profile_picture: imageUrl,
            rank: rank,
        });
    }
    const register = async (e) => {
        e.preventDefault(); //prevent page from refreshing

        await createUserWithEmailAndPassword(auth, newEmail, password)
        .then((userCredential) => {
            if (auth) {
                //creating account was successful

                let profileUrl = "users/default/profile_pic.png";

                //add userdata to database
                writeUserData(
                    userCredential.user.uid,
                    newName,
                    newEmail,
                    profileUrl,
                    "salesAssociate",
                    0
                );
                resetFields();
                navigate("/Administration");
            }
        })
        // creating an account was unsuccessful and alerting user with error message
        .catch((error) => alert(error.message));
    }
    const editData = (id) => {
        const userRef = query(dbRef(db, `users`), orderByChild("userIdNo"), equalTo(id));
        onValue(userRef, (snapshot) => {
            const data = snapshot.val();
            update(dbRef(db, 'users/'+data[Object.keys(data)[0]].userIdNo), {
                fullname: name,
                email: email,
                commission: commission
            }).then(() => {
                console.log("Successfully updated.");
            }).catch((error) => {
                console.log(error);
            })
        });     
        // update(dbRef(db, 'users/'+uid), {
        //     fullname: name,
        //     email: email,
        //     commission: commission
        // })
    }
    const checkUserData = (name, email, commission) => {
        setName(name);
        setEmail(email);
        setCommission(commission);
    }
    const resetFields = () => {
        setNewName("");
        setNewEmail("");
        setPassword("");
        setCommission("");
    }
    const resetPopup = () => {
        setName("");
        setEmail("");
        setCommission("");
    }
    const checkUser = (id) => {
        const userRef = query(dbRef(db, `users`), orderByChild("userIdNo"), equalTo(id));
        onValue(userRef, (snapshot) => {
            const data = snapshot.val();
            remove(dbRef(db, 'users/'+data[Object.keys(data)[0]].userIdNo)).then(() => {
                console.log("Successfully deleted.");
            }).catch((error) => {
                console.log(error);
            })
        });
    }
    const closePopup = () => {
        resetPopup();
        setPopup(false);
    }


    return user ? (
        <div className="admin">
            <div className="adminTitle">Administrator</div>
            <div className="divider"/>
            {
                users ? (
                    <div className="associateList">
                        {
                            users.map((item) => {
                                console.log(item.userIdNo);
                                return (
                                <div className="associateNode">                                   
                                    <div className="salesAssociates">{item.fullname}</div>
                                    <div className="commission">Commission:</div>
                                    <div className="commissionAmt">{item.commission}</div>
                                    <div className="userRank">Associate</div>
                                    <button className="editButton" onClick={() => {setPopup(true); checkUserData(item.fullname, item.email, item.commission)}}>Edit</button>
                                    <button className="deleteButton" onClick={() => {checkUser(item.userIdNo)}}>Delete</button>
                                    <EditUser trigger={popup} setTrigger={closePopup}>
                                    <form>
                                        <div className="newAssocPopup">
                                            <TextField
                                                label="Name"
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
                                                label="Commission"
                                                variant="standard"
                                                sx={{ mb: "30px" }}
                                                value={commission}
                                                onChange={(e) => setCommission(e.target.value)}
                                            />
                                        </div>
                                        <input onClick = {() => {editData(item.userIdNo)}} className="submitButton" type="submit" />
                                    </form>
                                    </EditUser>
                                </div>                                   
                                )
                            })
                        }
                    </div>
                ) : (
                    <div> Loading... </div>
                )
            }
            <div className="divider"/>
            <div className="newUser">
                <div className="name field">
                    <TextField
                        label="Name"
                        variant="standard"
                        sx={{ mb: "30px" }}
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                    />
                </div>
                <div className="eMail field">
                    <TextField
                        label="Email"
                        variant="standard"
                        sx={{ mb: "30px" }}
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                    />
                </div>
                <div className="password field">
                    <TextField
                        label="Password"
                        variant="standard"
                        type="password"
                        sx={{ mb: "30px" }}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)
                        }
                    />
                </div>
                <button
                    className="createButton"
                    onClick={register}
                    >
                    <div className="createButtonText">
                        Create
                    </div>
                </button>
            </div>  
        </div>
    ) : (
        // user is not logged in
        <div className="new">
            <h1>Please login to access this page.</h1>
        </div>
    );
}

export default Administration;