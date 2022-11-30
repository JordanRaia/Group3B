import React, { useEffect, useState } from "react";
//import { useNavigate } from "react-router-dom";
import "./Administration.css";
// material ui
import Popup from "reactjs-popup";
// firebase
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../firebase";
import {
    onValue,
    ref as dbRef,
    child,
    push,
    update,
    query,
    //set,
    //remove,
} from "firebase/database";
import InvalidPermissions from "../InvalidPermissions/InvalidPermissions";
import NoLogin from "../NoLogin/NoLogin";

// page for administrator to view all users of the site and be able to change their permissions,
// ie. user, sales associate, in house employee, in house employee 2, and administrator
const Administration = () => {
    //const navigate = useNavigate();
    const [user, setUser] = useState({}); // Checking if user is logged in.
    const [salesteam, setSalesTeam] = useState([]); // List of all users.
    const [email, setEmail] = useState("");
    const [commission, setCommission] = useState("");
    const [name, setName] = useState("");
    const [rank, setRank] = useState("");
    const [address, setAddress] = useState("");
    const [editPopup, setEditPopup] = useState([]);

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
                    setSalesTeam(data);
                });

                // get the user's rank
                const rankRef = dbRef(db, `users/${currentUser.uid}/rank`);
                onValue(rankRef, (snapshot) => {
                    //set data to name
                    const data = snapshot.val();
                    //save name to useState name
                    setRank(data);
                });
            }
        });
    };

    /*const writeUserData = (userId, name, email, imageUrl, rank) => {
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

                    let profileUrl = "users/default/profile.jpg";

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
    };*/

    const handleEditButton = (salesperson, i) => (e) => {
        e.preventDefault();

        let tempArr = Array(Object.keys(salesteam).length).fill(false); //fill temp Arr with false for every quote
        tempArr[i] = true;
        setEditPopup(tempArr);

        //email
        setEmail(salesteam[salesperson]["email"]);
        //commission
        setCommission(salesteam[salesperson]["commission"]);
        //fullname
        setName(salesteam[salesperson]["fullname"]);
        //rank
        setRank(salesteam[salesperson]["rank"]);
        //address
        setAddress(salesteam[salesperson]["address"]);
    };

    const handleSaveSalesPerson = (quoteKey) => async (e) => {
        e.preventDefault(); // prevent page refresh

        if (email === "") {
            alert("must enter email");
        } else if (name === "") {
            alert("must enter name");
        } else if (address === "") {
            alert("must enter address");
        } else if (commission === "") {
            alert("must enter commission amt");
        } else if (rank === "") {
            alert("must enter rank");
        } else {
            // submit to database

            // quote entry
            const quoteData = {
                address: address,
                commission: commission,
                email: email,
                fullname: name,
                rank: rank
            };

            let newQuoteKey = "";

            // get a key for a new quote
            if (!quoteKey) {
                newQuoteKey = push(child(dbRef(db), "users")).key;
            } else {
                newQuoteKey = quoteKey;
            }

            const updates = {};
            updates["/users/" + newQuoteKey] = quoteData;

            await update(dbRef(db), updates);

            closePopup();
            return newQuoteKey;
        }
    };

    function closePopup() {
        //setPopup(false);
        setEditPopup(new Array(Object.keys(salesteam).length).fill(false));
        setEmail("");
        setCommission("");
        setName("");
        setRank("");
        setAddress("");
    }

    return user ? (
        // logged in
        rank === "admin" || rank === "dev" ? (
            // user has permissions
            <div className="new">
                <h2>Administration:</h2>
                {Object.keys(salesteam).map((salesperson, i) => {
                    return (
                        <div key={i} className="new__personContainer">
                            <div className="new__quote">
                                <div className="new__salesPersonInfo">
                                    <p className="new__salesPersonId">{salesteam[salesperson]["fullname"]} </p>
                                    <p className="new__salesPerson">
                                        {salesteam["fullname"]}
                                    </p>
                                </div>
                                <p className="new__salesname">
                                    {salesteam[email]}
                                </p>
                                <button
                                    onClick={handleEditButton(salesperson, i)}
                                    className="new__quoteButton"
                                >
                                    View Teammate
                                </button>
                                <Popup open={editPopup[i]}>
                                    {(close) => {
                                        return (
                                            <div className="popup">
                                                <div className="popup__inner">
                                                    <button
                                                        onClick={() => {
                                                            close();
                                                            closePopup();
                                                        }}
                                                        className="popup__closeBtn"
                                                    >
                                                        close
                                                    </button>
                                                    <div className="new__popup">
                                                        <h3>
                                                            Edit team member: {salesteam[salesperson]["fullname"]}
                                                        </h3>
                                                        <h3>
                                                            {
                                                                salesteam[salesperson][
                                                                    "email"
                                                                ]
                                                            }
                                                        </h3>
                                                        <div className="new__salespersonInfo">
                                                            <span className="new__text">
                                                                Address: {" "}
                                                                {salesteam[salesperson]["address"] ? salesteam[salesperson]["address"] : "no address on hand"}
                                                            </span>
                                                        </div>
                                                        <div>
                                                            <span className="new__text">
                                                                Position:{" "}
                                                                {salesteam[salesperson]["rank"]}
                                                            </span>
                                                        </div>
                                                        <form>
                                                            <div className="new__flex">
                                                                <label htmlFor="fullname">
                                                                    Name:{" "}
                                                                </label>
                                                                <input
                                                                    onChange={(e) =>
                                                                        setName(e.target.value)}
                                                                    value={name}
                                                                    type="text"
                                                                    id="fullname"
                                                                    name="fullname"
                                                                />
                                                            </div> 
                                                            <div className="new__flex">
                                                                <label htmlFor="email">
                                                                    Email:{" "}
                                                                </label>
                                                                <input
                                                                    onChange={(e) =>
                                                                        setEmail(e.target.value)}
                                                                    value={email}
                                                                    type="text"
                                                                    id="email"
                                                                    name="email"
                                                                />
                                                            </div>  
                                                            <div className="new__flex">
                                                                <label htmlFor="address">
                                                                    Address:{" "}
                                                                </label>
                                                                <input
                                                                    onChange={(e) =>
                                                                        setAddress(e.target.value)}
                                                                    value={address}
                                                                    type="text"
                                                                    id="address"
                                                                    name="address"
                                                                />
                                                            </div>
                                                            <div className="new__flex">
                                                                <label htmlFor="rank">
                                                                    Rank:{" "}
                                                                </label>
                                                                <input
                                                                    onChange={(e) =>
                                                                        setRank(e.target.value)}
                                                                    value={rank}
                                                                    type="text"
                                                                    id="rank"
                                                                    name="rank"
                                                                />
                                                            </div> 
                                                            <div className="new__flex">
                                                                <label htmlFor="commission">
                                                                    Commission:{" "}
                                                                </label>
                                                                <input
                                                                    onChange={(e) =>
                                                                        setCommission(e.target.value)}
                                                                    value={commission}
                                                                    type="text"
                                                                    id="commission"
                                                                    name="commission"
                                                                />
                                                            </div>                                             
                                                        </form>
                                                        <div>
                                                            <button
                                                                onClick={handleSaveSalesPerson(salesperson)}
                                                            >
                                                                Save
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    }}
                                </Popup>
                            </div>
                        </div>
                    );
                })}
                <h3>
                    {Object.keys(salesteam).length} sales person
                    {Object.keys(salesteam).length !== 1 && "s"} found
                </h3>
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
