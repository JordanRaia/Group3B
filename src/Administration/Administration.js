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
    const [newAddress, setNewAddress] = useState("");
    const [address, setAddress] = useState("");
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

    // Used to write user data to the DB
    function writeUserData(userId, name, email, imageUrl, rank, address) {
        set(dbRef(db, "users/" + userId), {
            commission: 0,
            userIdNo: userId,
            fullname: name,
            email: email,
            profile_picture: imageUrl,
            rank: rank,
            address: address
        });
    }

    // Registers a new sales associate to the DB
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
                    newAddress,
                    0,
                );
                resetFields();
                navigate("/Administration");
            }
        })
        // creating an account was unsuccessful and alerting user with error message
        .catch((error) => alert(error.message));
    }

    // Edits a user's data in the DB
    const editData = (id) => {
        const userRef = query(dbRef(db, `users`), orderByChild("userIdNo"), equalTo(id));
        onValue(userRef, (snapshot) => {
            const data = snapshot.val();
            update(dbRef(db, 'users/'+data[Object.keys(data)[0]].userIdNo), {
                fullname: name,
                email: email,
                commission: commission,
                address: address
            }).then(() => {
                console.log("Successfully updated.");
            }).catch((error) => {
                console.log(error);
            })
        });     
    }

    // Fills the popup box with data when it's opened.
    const checkUserData = (name, email, commission, address) => {
        setName(name);
        setEmail(email);
        setCommission(commission);
        setAddress(address);
    }

    // Resets the text box fields
    const resetFields = () => {
        setNewName("");
        setNewEmail("");
        setPassword("");
        setCommission("");
        setNewAddress("");
    }

    // Resets the values in the popup window
    const resetPopup = () => {
        setName("");
        setEmail("");
        setCommission("");
        setAddress("");
    }

    // Attempts to delete a user from the DB
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

    // Exit the popup window
    const closePopup = () => {
        resetPopup();
        setPopup(false);
    }

    return user ? (
        <div className="admin">
            <h2 className="adminTitle">Administration</h2>
            <div className="flexCont">
                <div className="flexLeft">
                    <div className="divider"/>
                    {
                        users ? (
                            <div className="associateList">
                                {
                                    users.map((item) => {
                                        console.log(item.userIdNo);
                                        return (
                                        <div className="associateNode">
                                            <div className="textData">                                   
                                                <div className="salesAssociates">{item.fullname}</div>
                                                <div className="commission">{`Commission: $${item.commission}`}</div>
                                                <div className="userRank">Associate</div>
                                            </div>
                                            <div className="buttons"> 
                                                <button className="adminButton editButton" onClick={() => {setPopup(true); checkUserData(item.fullname, item.email, item.commission, item.address)}}>Edit</button>
                                                <button className="adminButton deleteButton" onClick={() => {checkUser(item.userIdNo)}}>Delete</button>
                                            </div>
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
                                                        onChange={(e) => { 
                                                            const re = /^[0-9\b]+$/;
                                                            if (e.target.value === '' || re.test(e.target.value)) {
                                                            setCommission(e.target.value)}}}
                                                    />
                                                    <TextField
                                                        label="Address"
                                                        variant="standard"
                                                        sx={{ mb: "30px" }}
                                                        value={address}
                                                        onChange={(e) => setAddress(e.target.value)}
                                                    />
                                                </div>
                                                <input onClick = {() => {editData(item.userIdNo)}} className="submitButton" type="submit" />
                                            </form>
                                            </EditUser>
                                            {/* <div className="divider"/> */}
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
                </div>
                <div className="flexRight">
                    <div className="newUser">
                        <h4>Create New User</h4>
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
                        <div className="address field">
                            <TextField
                                label="Address"
                                variant="standard"
                                type="address"
                                sx={{ mb: "30px" }}
                                value={newAddress}
                                onChange={(e) => setNewAddress(e.target.value)
                                }
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