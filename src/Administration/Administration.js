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
    // const [newPassword, setNewPassword] = useState("");
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [popup, setPopup] = useState(false);
    useEffect(() => {authState();}, []);

    const authState = () => {
        onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            if (user) {
                const usersRef = query(dbRef(db, `users`), orderByChild("rank"), equalTo("salesAssociate"))
                onValue(usersRef, (snapshot) => {
                    const data = snapshot.val();
                    console.log(data);
                    const cleanedData = Object.values(data)
                    setUsers(cleanedData);
                });
            }
        });
    }
    function writeUserData(userId, name, email, imageUrl, rank) {
        set(dbRef(db, "users/" + userId), {
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
                    "salesAssociate"
                );
                resetFields();
                navigate("/Administration");
            }
        })
        // creating an account was unsuccessful and alerting user with error message
        .catch((error) => alert(error.message));
    }
    const editData = (uid) => {     
        update(dbRef(db, 'users/'+uid), {
            fullname: name,
            email: email,
        })
    }
    const resetFields = () => {
        setNewName("");
        setNewEmail("");
        setPassword("");
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
        setPopup(false);
    }

    // const changePass = (uid) => {
    //     updatePassword(uid, password)
    // }

    return (
        <div className="admin">

            <div className="adminTitle">Administrator</div>
            <div className="divider"/>
            {
                users ? (
                    <div className="associateList">
                        {
                            users.map((item) => {
                                console.log(item.fullname);
                                return (
                                <div className="associateNode">
                                    
                                    <div className="salesAssociates">{item.fullname}</div>
                                    <div className="commission">Commission: </div>
                                    <div className="commissionAmt">$500.50</div>
                                    <div className="userRank">Associate</div>
                                    <button className="editButton" onClick={() => {setPopup(true)}}>Edit</button>
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
                                        {/* </div> */}
                                        {/* <div className="newAssocEmail"> */}
                                            <TextField
                                                label="Email"
                                                variant="standard"
                                                sx={{ mb: "30px" }}
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                            />
                                        {/* </div>
                                            <TextField
                                                label="Password"
                                                variant="standard"
                                                sx={{ mb: "30px" }}
                                                value={password}
                                                onChange={(e) => updatePassword(e.target.value)}
                                            /> */ }
                                        {/* <div className="newAssocComm"> */}
                                            <TextField
                                                label="Commission"
                                                variant="standard"
                                                sx={{ mb: "30px" }}
                                                value=""
                                            />
                                        {/* </div> */}
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
                        onChange={(e) =>
                            setPassword(e.target.value)
                        }
                    />
                </div>
                <button
                    className="createButton"
                    onClick={register}
                    >
                    {/* <div className="createAssocButton">
                        <div className="createAssocText">
                        </div>
                    </div> */}
                    <div className="createButtonText">
                        Create
                    </div>
                </button>
            </div>  
        </div>
    )
}

export default Administration;
