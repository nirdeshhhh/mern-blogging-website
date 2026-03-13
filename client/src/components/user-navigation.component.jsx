import AnimationWrapper from "../common/page-animation";
import { Link, useNavigate } from "react-router-dom";
import { useContext } from "react";
import { UserContext } from "../App";
import { removeFromSession } from "../common/session";

const UserNavigationPanel = () => {
    const { userAuth, setUserAuth } = useContext(UserContext);
    const navigate = useNavigate();

    const username = userAuth?.username || "Guest";

    const SignOutUser = () => {
        removeFromSession("user");
        setUserAuth({
            access_token: null,
            username: null,
            profile_img: null,
        });
        navigate("/");
    };

    return (
        <AnimationWrapper className="absolute right-0 z-50" transition={{ duration: 0.2 }}>
            <div className="bg-white absolute right-0 border border-grey w-60 duration-200">
                <Link to="/editor" className="flex gap-2 link px-6 py-4 hover:bg-grey">
                    <i className="fi fi-rr-file-edit"></i>
                    <p>Write</p>
                </Link>

                <Link to={`/user/${username}`} className="flex gap-2 link px-6 py-4 hover:bg-grey">
                    <i className="fi fi-rr-user"></i>
                    <p>Profile</p>
                </Link>

                <Link to="/dashboard/blogs" className="flex gap-2 link px-6 py-4 hover:bg-grey">
                    <i className="fi fi-rr-dashboard"></i>
                    <p>Dashboard</p>
                </Link>

                <Link to="/settings/edit-profile" className="flex gap-2 link px-6 py-4 hover:bg-grey">
                    <i className="fi fi-rr-settings"></i>
                    <p>Settings</p>
                </Link>

                <span className="absolute border-t border-grey w-full"></span>

                <button
                    className="text-left hover:bg-grey w-full pl-8 py-4"
                    onClick={SignOutUser}
                >
                    <h1 className="font-bold text-xl mb-1">Sign Out</h1>
                    <p className="text-dark-grey">@{username}</p>
                </button>
            </div>
        </AnimationWrapper>
    );
};

export default UserNavigationPanel;
