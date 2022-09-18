import "./App.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "./Home/Home";
import Header from "./Header/Header";
import Login from "./Login/Login";
import { defaultLink } from "./constants";
import { useEffect } from "react";
import { useStateValue } from "./StateProvider";
//firebase
import { auth } from "./firebase";

function App() {
    const [dispatch] = useStateValue();

    //listener to keep track of user, can be used later for a shopping cart
    useEffect(() => {
        auth.onAuthStateChanged((authenticatedUser) => {
            console.log("user:", authenticatedUser); //debug, check user

            //user logged in
            if (authenticatedUser) {
                dispatch({
                    //set user to authenticatedUser
                    type: "SET_USER",
                    user: authenticatedUser,
                });
            } else {
                //user not logged in
                dispatch({
                    //set user to null
                    type: "SET_USER",
                    user: null,
                });
            }
        });
    }, [dispatch]);

    return (
        <BrowserRouter>
            <div className="app">
                <Routes>
                    {/* Each Route needs Group3B/ to work on gh-pages, can change later if hosted elsewhere */}
                    {/* Home Page */}
                    <Route
                        path={defaultLink}
                        element={[<Header />, <Home />]}
                    />
                    {/* Login Page */}
                    <Route
                        path={defaultLink + "/login"}
                        element={[<Login />]}
                    />
                </Routes>
            </div>
        </BrowserRouter>
    );
}

export default App;
