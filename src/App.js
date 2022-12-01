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
import Customers from "./Customers/Customers";
import Page404 from "./Page404/Page404";
// import Footer from "./Footer/Footer";

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
                    <Route path="Customers" element={<Customers />} />
                    <Route path="*" element={<Page404 />} />
                </Route>
            </Routes>
            {/* <Footer/> */}
        </div>
    );
}

export default App;
