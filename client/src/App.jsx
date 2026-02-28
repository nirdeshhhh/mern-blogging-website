import { Routes, Route } from "react-router-dom";
import Navbar from "./components/navbar.component";
import UserAuthForm from "./pages/userAuthForm.page";
import { createContext, useEffect, useState } from "react";
import { lookInSession } from "./common/session";
import Editor from "./pages/editor.pages";
import HomePage from "./pages/home.page";
import PageNotFound from "./pages/404.page";  
import SearchPage from "./pages/search.page";
import ProfilePage from "./pages/profile.page";
import BlogPage from "./pages/blog.page";
// const fileUpload = require('express-fileupload');
import { Toaster } from "react-hot-toast";

export const UserContext = createContext({});


const App = () => {
    const [userAuth, setUserAuth] = useState(null);
    const [loading, setLoading] = useState(true);
    

    useEffect(() => {
        const userInSession = lookInSession("user");

        try {
            const parsedUser = userInSession ? JSON.parse(userInSession) : null;
            setUserAuth(parsedUser?.access_token ? parsedUser : { access_token: null });

          
            setLoading(false);
        } catch {
            setUserAuth({ access_token: null });
            setLoading(false); 
        }
    }, []);


    return (
        
        <UserContext.Provider value={{ userAuth, setUserAuth, loading }}>
                  <Toaster position="top-center" />

            <Routes>
                <Route path="/editor" element={<Editor/>} />
                <Route path="/editor/:blog_id" element={<Editor/>} />
                <Route path="/" element={<Navbar />}>
                    <Route index element={<HomePage/>}/>
                    <Route path="/signin" element={<UserAuthForm type="sign-in" />} />
                    <Route path="/signup" element={<UserAuthForm type="sign-up" />} />
                    <Route path="search/:query" element={<SearchPage/>}/>
                    <Route path="user/:id" element={<ProfilePage/>}/>
                    <Route path="blog/:blog_id" element={<BlogPage/>} />
                    <Route path="*" element={<PageNotFound/>}/>
                </Route>
            </Routes>
        </UserContext.Provider>
    );
};

export default App;
