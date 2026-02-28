import { useContext, useEffect, useRef, useState } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { UserContext } from "../App";
import logo from "../imgs/Remove background project.png";
import UserNavigationPanel from "./user-navigation.component";

const Navbar = () => {
    const [searchInput, setSearchInput] = useState(""); // Define searchInput state
    const [searchBoxVisiblity, setSearchBoxVisiblity] = useState(false);
    const [userNavPanelVisible, setUserNavPanelVisible] = useState(false);
    const dropdownRef = useRef(null);
    const { userAuth, loading } = useContext(UserContext);
    
    let navigate = useNavigate();

    const isLoggedIn = !!userAuth?.access_token;
    const profile_img = userAuth?.profile_img;

    const handleUserNavPanel = () => {
        setUserNavPanelVisible(prev => !prev);
    };

    const handleSearch = (e) => {
        let query = e.target.value;

        if(e.keyCode == 13 && query.length){
            navigate(`/search/${query}`);
        }
    };

    // Real-time search effect
    useEffect(() => {
        const timeout = setTimeout(() => {
            if (searchInput.trim() === "") {
                if (location.pathname.startsWith("/search")) {
                    navigate("/"); // Go to homepage if search input is cleared
                }
            } else {
                navigate(`/search/${searchInput}`);
            }
        }, 400); // Debounce input by 400ms

        return () => clearTimeout(timeout);
    }, [searchInput, navigate]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setUserNavPanelVisible(false);
            }
        };
        document.addEventListener("click", handleClickOutside);
        return () => {
            document.removeEventListener("click", handleClickOutside);
        };
    }, []);

    if (loading) return null;

    return (
        <>
            <nav className="navbar py-4 md:py-6 px-4 md:px-8 bg-white shadow-sm flex items-center justify-between">

            <div className="flex items-center gap-4 ml-7">
            <Link to="/">
                <img src={logo} alt="Logo" className="w-10 h-10 object-contain" />
            </Link>
            <Link
                to="/"
                className="text-xl font-bold text-indigo-700 hover:text-red-500 transition duration-300"
            >
                BuBeacon
            </Link>

            <div className="relative hidden md:block ml-8">
                <input
                type="text"
                placeholder="Search"
                className="w-62 bg-grey p-2.5 pl-10 pr-4 rounded-full placeholder:text-dark-grey"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={handleSearch}
                />
                <i className="fi fi-rr-search absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500"></i>
            </div>
            </div>

    
   
            <div className="flex items-center gap-4">
              {/* Mobile Search Icon */}
              <button
                className="md:hidden bg-gray-100 w-10 h-10 rounded-full flex items-center justify-center"
                onClick={() => setSearchBoxVisible((prev) => !prev)}
              >
                <i className="fi fi-rr-search text-xl text-gray-600"></i>
              </button>
    
              {/* Write Button */}
              <Link
                to="/editor"
                className="hidden md:flex items-center gap-2 text-sm px-4 py-2 rounded-full bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition"
              >
                <i className="fi fi-rr-file-edit"></i>
                <span>Write</span>
              </Link>
    
              {/* User Section */}
              {isLoggedIn ? (
                <>
                 <Link to="/dashboard/notification">
                  <div className="relative">
                    <button className="w-14 h-14 rounded-full bg-gray-300 bg-opacity-20 hover:bg-opacity-30 flex items-center justify-center transition">
                      <i className="fi fi-rr-bell text-base text-gray-700"></i> {/* Changed text-lg ➔ text-base */}
                    </button>
                  </div>
                </Link>


    
                  <div ref={dropdownRef} className="relative">
                    <button
                      onClick={handleUserNavPanel}
                      className="w-12 h-12 rounded-full overflow-hidden border-2 border-indigo-600"
                    >
                      <img
                        src={profile_img}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    </button>
                    {userNavPanelVisible && (
                      <div className="absolute right-0 mt-2 w-48 rounded-lg bg-white shadow-xl z-50">
                        <UserNavigationPanel />
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <Link
                    to="/signin"
                    className="text-ml text-white bg-black px-6 py-3 rounded-full"

                  >
                    Sign in
                  </Link>
                  <Link
                    to="/signup"
                    className="hidden md:inline-block text-ml border border-indigo-300 text-indigo-600 px-5 py-2.5 rounded-full"
                    >
                    Sign up
                  </Link>
                </>
              )}
            </div>
          </nav>

          
          <Outlet />
        </>
      );
    };
    
    export default Navbar;