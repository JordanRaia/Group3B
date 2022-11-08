import "./App.css";
import { Route, Routes } from "react-router-dom";
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
        <div className="app">
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/" element={<Header />}>
                    <Route path="" element={<Home />} />
                    <Route path="NewQuote" element={<NewQuote />} />
                    <Route path="FinalizeQuote" element={<FinalizeQuote />} />
                    <Route path="SanctionQuote" element={<SanctionQuote />} />
                    <Route path="Administration" element={<Administration />} />
                    <Route path="Quotes" element={<Quotes />} />
                </Route>
            </Routes>
        </div>
    );
}

export default App;
