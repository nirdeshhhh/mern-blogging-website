import { useContext, useState, useRef } from "react";
import { Navigate } from "react-router-dom"; // Import Navigate
import AnimationWrapper from "../common/page-animation";
import { Link } from "react-router-dom";
import InputBox from "../components/input.component";
import googleIcon from "../imgs/google.png";
import { Toaster, toast } from "react-hot-toast";
import axios from "axios";
import { storeInSession } from "../common/session";
import { UserContext } from "../App";
// import { authWithGoogle } from "../common/firebase";

const UserAuthForm = ({ type }) => {
    const { userAuth, setUserAuth } = useContext(UserContext) || {};
    const access_token = userAuth?.access_token || null;


    const formRef = useRef(null);
    
    const userAuthThroughServer = async (serverRoute, formData) => {
        try {
            console.log("Sending request to:", import.meta.env.VITE_SERVER_DOMAIN + serverRoute);
            
    
            const { data } = await axios.post(
                import.meta.env.VITE_SERVER_DOMAIN + serverRoute,
                formData,
            );
    
            console.log("Response received:", data);
    
            storeInSession("user", JSON.stringify(data));
            setUserAuth(data);
    
            toast.success(type === "sign-in" ? "Login successful!" : "Signup successful!");
    
        } catch (error) {
            console.error("Error:", error.response?.data || error.message);
            toast.error(error.response?.data?.error || "An error occurred");
        }
    };
    
    
    const handleSubmit = async (e) => {
        e.preventDefault();

        let serverRoute = type === "sign-in" ? "/signin" : "/signup";

        const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
        const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/;

        if (!formRef.current) return; // Prevents undefined form reference issue

        let formData = {};
        const form = new FormData(formRef.current);

        for (let [key, value] of form.entries()) {
            formData[key] = value;
        }

        let { fullname, email, password } = formData;

        if (fullname && fullname.length < 3) {
            return toast.error("Fullname must be at least 3 characters long");
        }

        if (!email || !emailRegex.test(email)) {
            return toast.error("Enter a valid Email");
        }

        if (!password || !passwordRegex.test(password)) {
            return toast.error(
                "Password must be 6 to 20 characters long with at least one uppercase letter, one lowercase letter, and one number."
            );
        }

        userAuthThroughServer(serverRoute, formData);
    };

    const handleGoogleAuth = async (e) => {
        e.preventDefault();
      
        try {
          const res = await authWithGoogle();
          if (!res) return toast.error("Google Sign-in Failed");
      
          const { idToken, user } = res;
      
          const formData = {
            access_token: idToken,
          };
      
          const serverRoute = "/google-auth";
          userAuthThroughServer(serverRoute, formData);
        } catch (err) {
          toast.error("Trouble logging in through Google");
          console.error(err);
        }
      };
      

    return access_token ? (
        <Navigate to="/" />
    ) : (
        <AnimationWrapper keyValue={type}>
            <Toaster position="top-right" />
            <section className="flex justify-center items-center h-screen">
                <form ref={formRef} onSubmit={handleSubmit} className="w-[80%] max-w-[400px]">
                    <h1 className="text-4xl font-gelasio capitalize text-center mb-6">
                        {type === "sign-in" ? "Welcome Back" : "Join Us Today"}
                    </h1>

                    {type !== "sign-in" && (
                        <InputBox name="fullname" type="text" placeholder="Full Name" icon="fi-rr-user" />
                    )}

                    <InputBox name="email" type="email" placeholder="Email" icon="fi-rr-envelope" />
                    <InputBox name="password" type="password" placeholder="Password" icon="fi-rr-key" />

                    <button className="btn-dark center mt-6" type="submit">
                        {type.replace("-", " ")}
                    </button>

                    <div className="relative w-full flex items-center gap-2 my-6 opacity-50 uppercase text-black font-bold">
                        <hr className="w-1/2 border-black" />
                        <p>or</p>
                        <hr className="w-1/2 border-black" />
                    </div>

                    <button className="btn-dark flex items-center justify-center gap-4 w-[90%] center"
                        onClick={handleGoogleAuth}
                    >
                        <img src={googleIcon} className="w-5" alt="Google icon" />
                        Continue with Google
                    </button>

                    {type === "sign-in" ? (
                        <p className="mt-6 text-dark-grey text-xl text-center">
                            Don't have an account?
                            <Link to="/signup" className="underline text-black text-xl ml-1">
                                Sign up
                            </Link>
                        </p>
                    ) : (
                        <p className="mt-6 text-dark-grey text-xl text-center">
                            Already a member?
                            <Link to="/signin" className="underline text-black text-xl ml-1">
                                Sign in
                            </Link>
                        </p>
                    )}
                </form>
            </section>
        </AnimationWrapper>
    );
};

export default UserAuthForm;
