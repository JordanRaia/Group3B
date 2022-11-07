import "./App.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "./Home/Home";
import Header from "./Header/Header";
import Login from "./Login/Login";
import Register from "./Login/Register";
import NewQuote from "./NewQuote/NewQuote";
import FinalizeQuote from "./FinalizeQuote/FinalizeQuote";
import SanctionQuote from "./SanctionQuote/SanctionQuote";
import Administration from "./Administration/Administration";
import Quotes from "./Quotes/Quotes";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                {/* Home Page */}
                <Route exact path={"/"} element={[<Header />, <Home />]} />
                {/* Login Page */}
                <Route exact path={"/login"} element={[<Login />]} />
                {/* Register Page */}
                <Route exact path={"/register"} element={[<Register />]} />
                {/* New Quote */}
                <Route
                    exact
                    path={"/NewQuote"}
                    element={[<Header />, <NewQuote />]}
                />
                {/* Finalize Quote */}
                <Route
                    exact
                    path={"/FinalizeQuote"}
                    element={[<Header />, <FinalizeQuote />]}
                />
                {/* Finalize Quote */}
                <Route
                    exact
                    path={"/SanctionQuote"}
                    element={[<Header />, <SanctionQuote />]}
                />
                {/* Finalize Quote */}
                <Route
                    exact
                    path={"/Administration"}
                    element={[<Header />, <Administration />]}
                />
                {/* Finalize Quote */}
                <Route
                    exact
                    path={"/Quotes"}
                    element={[<Header />, <Quotes />]}
                />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
