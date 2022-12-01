import React, { useState, useEffect } from "react";
import "./Administration.css";
// import EditUser from "./EditUser.js";
import { onAuthStateChanged } from "firebase/auth";
import Popup from "reactjs-popup";
import { auth, db } from "../firebase";
import {
    onValue,
    ref as dbRef,
    query,
    update,
    remove,
} from "firebase/database";
import TextField from "@mui/material/TextField";
// import Button from "@mui/material/Button";
import FormControl from "@mui/material/FormControl";
// page for administrator to view all users of the site and be able to change their permissions,
// ie. user, sales associate, in house employee, in house employee 2, and administrator
const Administration = () => {
    const [user, setUser] = useState({}); // Checking if user is logged in.
    const [users, setUsers] = useState([]); // List of all users.
    const [address, setAddress] = useState("");
    const [name, setName] = useState("");
    const [profile, setProfile] = useState("users/default/profile.jpg");
    const [email, setEmail] = useState("");
    const [commission, setCommission] = useState("");
    const [editPopup, setEditPopup] = useState([]);
    const [rank, setRank] = useState("");
    useEffect(() => {
        authState();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const authState = () => {
        onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            if (user) {
                const usersRef = query(dbRef(db, `users`));
                onValue(usersRef, (snapshot) => {
                    const data = snapshot.val();
                    //create nested array that retains the object keys
                    const cleanedData = Object.entries(data);
                    setUsers(cleanedData);
                });
            }
        });
    };

    // Edits a user's data in the DB
    const editData = (id) => (e) => {
        e.preventDefault();

        const userRef = query(dbRef(db, `users/${id}`));
        onValue(
            userRef,
            (snapshot) => {
                update(dbRef(db, "users/" + id), {
                    fullname: name,
                    email: email,
                    commission: commission,
                    address: address,
                    rank: rank,
                    profile_picture: profile,
                })
                    .then(() => {
                        console.log("Successfully updated.");
                    })
                    .catch((error) => {
                        console.log(error);
                    });
            },
            {
                onlyOnce: true,
            }
        );

        closePopup();
    };

    // Fills the popup box with data when it's opened.
    const checkUserData = (
        name,
        email,
        commission,
        address,
        rank,
        i,
        profile = "users/default/profile.jpg"
    ) => {
        let tempArr = Array(users.length).fill(false); //fill temp Arr with false for every quote
        tempArr[i] = true;
        setEditPopup(tempArr);
        setName(name);
        setProfile(profile);
        setEmail(email);
        setCommission(commission);
        setAddress(address);
        setRank(rank);
    };

    // Resets the text box fields
    const resetFields = () => {
        setCommission("");
    };

    // Resets the values in the popup window
    const resetPopup = () => {
        setName("");
        setEmail("");
        setCommission("");
        setAddress("");
        setRank("");
    };

    // Attempts to delete a user from the DB
    const checkUser = (id) => {
        const userRef = query(dbRef(db, `users/${id}/`));
        onValue(userRef, (snapshot) => {
            // const data = snapshot.val();
            remove(dbRef(db, `users/${id}`))
                .then(() => {
                    console.log("Successfully deleted.");
                })
                .catch((error) => {
                    console.log(error);
                });
        });
    };

    // Exit the popup window
    const closePopup = () => {
        resetPopup();
        resetFields();

        // fill editPopup with false
        setEditPopup(new Array(users.length).fill(false));
    };

    return user ? (
        // user logged in
        rank === "admin" || rank === "dev" ? (
            // user has permissions
            <div className="admin">
                <h2 className="adminTitle">Administration</h2>
                <div className="flexCont">
                    <div className="flexLeft">
                        <div className="divider" />
                        {users ? (
                            <div className="associateList">
                                {users.map((item, i) => {
                                    // console.log(item[0]);   //key value
                                    return (
                                        <div className="associateNode">
                                            <div className="textData">
                                                <div className="salesAssociates">
                                                    {item[1].fullname}
                                                </div>
                                                <div className="commission">{`Commission: $${item[1].commission}`}</div>
                                                <div className="userRank">
                                                    {item[1].rank}
                                                </div>
                                            </div>
                                            <div className="buttons">
                                                <button
                                                    className="adminButton editButton"
                                                    onClick={() => {
                                                        // setPopup(true);
                                                        // handle edit button
                                                        checkUserData(
                                                            item[1].fullname,
                                                            item[1].email,
                                                            item[1].commission,
                                                            item[1].address,
                                                            item[1].rank,
                                                            i,
                                                            item[i]
                                                                .profile_picture
                                                        );
                                                    }}
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    className="adminButton deleteButton"
                                                    onClick={() => {
                                                        checkUser(item[0]);
                                                    }}
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                            <Popup open={editPopup[i]}>
                                                {(close) => {
                                                    return (
                                                        <div className="popup">
                                                            <div className="admin__popup">
                                                                <button
                                                                    onClick={() => {
                                                                        close();
                                                                        closePopup();
                                                                    }}
                                                                    className="popup__closeBtn"
                                                                >
                                                                    close
                                                                </button>
                                                                <FormControl>
                                                                    <div className="editAssocFields">
                                                                        <TextField
                                                                            label="Name"
                                                                            variant="standard"
                                                                            sx={{
                                                                                mb: "30px",
                                                                            }}
                                                                            value={
                                                                                name
                                                                            }
                                                                            onChange={(
                                                                                e
                                                                            ) =>
                                                                                setName(
                                                                                    e
                                                                                        .target
                                                                                        .value
                                                                                )
                                                                            }
                                                                        />
                                                                        <TextField
                                                                            label="Email"
                                                                            variant="standard"
                                                                            sx={{
                                                                                mb: "30px",
                                                                            }}
                                                                            value={
                                                                                email
                                                                            }
                                                                            onChange={(
                                                                                e
                                                                            ) =>
                                                                                setEmail(
                                                                                    e
                                                                                        .target
                                                                                        .value
                                                                                )
                                                                            }
                                                                        />
                                                                        <TextField
                                                                            label="Commission"
                                                                            variant="standard"
                                                                            sx={{
                                                                                mb: "30px",
                                                                            }}
                                                                            value={
                                                                                commission
                                                                            }
                                                                            onChange={(
                                                                                e
                                                                            ) => {
                                                                                const re =
                                                                                    /^[0-9\b]+$/;
                                                                                if (
                                                                                    e
                                                                                        .target
                                                                                        .value ===
                                                                                        "" ||
                                                                                    re.test(
                                                                                        e
                                                                                            .target
                                                                                            .value
                                                                                    )
                                                                                ) {
                                                                                    setCommission(
                                                                                        e
                                                                                            .target
                                                                                            .value
                                                                                    );
                                                                                }
                                                                            }}
                                                                        />
                                                                        <TextField
                                                                            label="Address"
                                                                            variant="standard"
                                                                            sx={{
                                                                                mb: "30px",
                                                                            }}
                                                                            value={
                                                                                address
                                                                            }
                                                                            onChange={(
                                                                                e
                                                                            ) =>
                                                                                setAddress(
                                                                                    e
                                                                                        .target
                                                                                        .value
                                                                                )
                                                                            }
                                                                        />
                                                                        <select
                                                                            onChange={(
                                                                                e
                                                                            ) => {
                                                                                setRank(
                                                                                    e
                                                                                        .target
                                                                                        .value
                                                                                );
                                                                            }}
                                                                        >
                                                                            {item[1]
                                                                                .rank ===
                                                                            "user" ? (
                                                                                <option
                                                                                    value="user"
                                                                                    selected
                                                                                >
                                                                                    User
                                                                                </option>
                                                                            ) : (
                                                                                <option value="user">
                                                                                    User
                                                                                </option>
                                                                            )}
                                                                            {item[1]
                                                                                .rank ===
                                                                            "salesAssociate" ? (
                                                                                <option
                                                                                    value="salesAssociate"
                                                                                    selected
                                                                                >
                                                                                    Sales
                                                                                    Associate
                                                                                </option>
                                                                            ) : (
                                                                                <option value="salesAssociate">
                                                                                    Sales
                                                                                    Associate
                                                                                </option>
                                                                            )}
                                                                            {item[1]
                                                                                .rank ===
                                                                            "dev" ? (
                                                                                <option
                                                                                    value="dev"
                                                                                    selected
                                                                                >
                                                                                    Developer
                                                                                </option>
                                                                            ) : (
                                                                                <option value="dev">
                                                                                    Developer
                                                                                </option>
                                                                            )}
                                                                            {item[1]
                                                                                .rank ===
                                                                            "admin" ? (
                                                                                <option
                                                                                    value="admin"
                                                                                    selected
                                                                                >
                                                                                    Administrator
                                                                                </option>
                                                                            ) : (
                                                                                <option value="admin">
                                                                                    Administrator
                                                                                </option>
                                                                            )}
                                                                            {item[1]
                                                                                .rank ===
                                                                            "inhouse1" ? (
                                                                                <option
                                                                                    value="inhouse1"
                                                                                    selected
                                                                                >
                                                                                    In-House
                                                                                    1
                                                                                </option>
                                                                            ) : (
                                                                                <option value="inhouse1">
                                                                                    In-House
                                                                                    1
                                                                                </option>
                                                                            )}
                                                                            {item[1]
                                                                                .rank ===
                                                                            "inhouse2" ? (
                                                                                <option
                                                                                    value="inhouse2"
                                                                                    selected
                                                                                >
                                                                                    In-House
                                                                                    2
                                                                                </option>
                                                                            ) : (
                                                                                <option value="inhouse2">
                                                                                    In-House
                                                                                    2
                                                                                </option>
                                                                            )}
                                                                        </select>
                                                                        {/* <div className="dropDown">
                                                                    <div className="selected">
                                                                        any text
                                                                    </div>
                                                                    <ul>
                                                                        <li>rank 1</li>
                                                                        <li>rank 2</li>
                                                                        <li>rank 3</li>
                                                                    </ul>
                                                                </div> */}
                                                                    </div>
                                                                    <input
                                                                        key={
                                                                            item[0]
                                                                        }
                                                                        onClick={editData(
                                                                            item[0]
                                                                        )}
                                                                        className="submitButton"
                                                                        type="submit"
                                                                    ></input>
                                                                </FormControl>
                                                            </div>
                                                        </div>
                                                    );
                                                }}
                                            </Popup>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div> Loading... </div>
                        )}
                        <div className="divider" />
                    </div>
                </div>
            </div>
        ) : (
            <InvalidPermissions />
        )
    ) : (
        // user is not logged in
        <NoLogin />
    );
};

export default Administration;
