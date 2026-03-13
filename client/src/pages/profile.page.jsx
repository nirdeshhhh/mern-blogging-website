import { useState, useEffect, useContext } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { getFullDay } from "../common/date"; // Update path as needed
import AnimationWrapper from "../common/page-animation";
import Loader from "../components/loader.component";
import { UserContext } from "../App";
import InPageNavigation from "../components/inpage-navigation.component";
import AboutUser from "../components/about.component";
import BlogPostCard from "../components/blog-post.component";
import NoDataMessage from "../components/nodata.component";
import filterPaginationData from "../common/filter-pagination-data";

export const profileDataStructure = {
  personal_info: {
    fullname: "",
    username: "",
    profile_img: "",
    bio: "",
  },
  account_info: {
    total_posts: 0,
    total_blogs: 0,
    total_reads: 0,
  },
  social_links: {},
  joinedAt: "",
};

const ProfilePage = () => {
  const { id: profileId } = useParams();
  const [profile, setProfile] = useState(profileDataStructure);
  const [loading, setLoading] = useState(true);
  const [blogs, setBlogs] = useState(null);

  const {
    personal_info: { fullname, username: profile_username, profile_img, bio },
    account_info: { total_posts, total_reads },
    social_links,
    joinedAt,
  } = profile;

  const {
    userAuth: { username },
  } = useContext(UserContext);

  const fetchUserProfile = () => {
    axios
      .post(`${import.meta.env.VITE_SERVER_DOMAIN}/get-profile`, {
        username: profileId,
      })
      .then(({ data }) => {
        if (data && data.personal_info) {
          console.log("Raw joinedAt:", data.joinedAt); // Debug log
          setProfile({
            ...data,
            joinedAt: getFullDay(data.joinedAt),
          });
          getBlogs({ user_id: data._id });
        } else {
          console.error("Invalid profile data structure:", data);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching profile:", err.response?.data || err.message);
        setLoading(false);
      });
  };

  const getBlogs = async ({ page = 1, user_id }) => {
    try {
      const { data } = await axios.post(`${import.meta.env.VITE_SERVER_DOMAIN}/search-blogs`, {
        author: user_id,
        page,
      });

      const formattedData = await filterPaginationData({
        state: blogs,
        data: data.blogs,
        page,
        countRoute: "/search-blogs-count",
        data_to_send: { author: user_id },
      });

      formattedData.user_id = user_id;
      setBlogs(formattedData);
    } catch (err) {
      console.error("Error fetching blogs:", err);
    }
  };

  useEffect(() => {
    resetState();
    fetchUserProfile();
  }, [profileId]);

  const resetState = () => {
    setProfile(profileDataStructure);
    setBlogs(null);
    setLoading(true);
  };

  if (loading) return <Loader />;

  return (
    <AnimationWrapper>
      <section className="h-cover flex flex-col lg:flex-row-reverse gap-8 px-4 lg:px-16 py-8">
        {/* Profile Sidebar */}
        <aside className="w-full lg:max-w-xs flex flex-col items-center lg:items-start bg-white shadow-sm rounded-2xl p-6 gap-4 border border-gray-100">
          <img 
            src={profile_img || "/default-profile.png"} 
            alt="Profile" 
            className="w-32 h-32 rounded-full border-4 border-gray-200 object-cover" 
            onError={(e) => {
              e.target.src = "/default-profile.png";
            }}
          />
          
          <div className="text-center md:text-left w-full">
            <h1 className="text-2xl font-semibold text-gray-800">@{profile_username}</h1>
            <p className="text-lg text-gray-600 capitalize">{fullname}</p>
            <p className="text-sm text-gray-500 mt-1">
              {total_posts.toLocaleString()} Blogs · {total_reads.toLocaleString()} Reads
            </p>
  
            {profileId === username && (
              <Link to="/settings/edit-profile" className="inline-block mt-4 px-4 py-2 rounded-md bg-blue-600 text-black text-sm hover:bg-blue-700 transition">
                Edit Profile
              </Link>
            )}
          </div>
  
          <AboutUser className="hidden md:block mt-4 w-full" bio={bio} social_links={social_links} joinedAt={joinedAt} />
        </aside>
  
        {/* Blog List and About Section */}
        <div className="flex-1 mt-10 lg:mt-0 min-w-0">
          <InPageNavigation routes={["Blogs Published", "About"]} defaultHidden={["About"]}>
            <>
              {blogs == null ? (
                <Loader />
              ) : blogs.results?.length > 0 ? (
                <div className="grid sm:grid-cols-2 gap-x-6 gap-y-12">
                  {blogs.results.map((blog, i) => (
                    <AnimationWrapper
                      transition={{
                        duration: 1,
                        delay: i * 0.1,
                      }}
                      key={i}
                    >
                      <BlogPostCard 
                        content={blog} 
                        author={blog.author?.personal_info || profile.personal_info} 
                      />
                    </AnimationWrapper>
                  ))}
                </div>
              ) : (
                <NoDataMessage message="No blogs published" />
              )}
            </>
  
            {/* Mobile About Section */}
            <AboutUser bio={bio} social_links={social_links} joinedAt={joinedAt} />
          </InPageNavigation>
        </div>
      </section>
    </AnimationWrapper>
  );
};

export default ProfilePage;

