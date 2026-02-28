import { useParams } from "react-router-dom";
import InPageNavigation from "../components/inpage-navigation.component";
import { useEffect, useState } from "react";
import Loader from "../components/loader.component";
import AnimationWrapper from "../common/page-animation";
import axios from "axios";
import filterPaginationData from "../common/filter-pagination-data";
import BlogPostCard from "../components/blog-post.component";
import NoDataaMessage from "../components/nodata.component";
import UserCard from "../components/usercard.component";

const SearchPage = () => {
  const { query } = useParams();
  const [blogs, setBlog] = useState({ results: [], page: 1, totalCount: 0 });
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState(null);
  const [isSmallScreen, setIsSmallScreen] = useState(false);

  // 🔍 Detect screen size
  useEffect(() => {
    const handleResize = () => {
      setIsSmallScreen(window.innerWidth < 1024); // Tailwind's `lg` breakpoint
    };

    handleResize(); // run once
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const searchBlogs = async ({ page = 1, create_new_arr = false } = {}) => {
    setLoading(true);
    try {
      const { data } = await axios.post(
        import.meta.env.VITE_SERVER_DOMAIN + "/search-blogs",
        { query, page }
      );

      setBlog(prev => ({
        results: create_new_arr ? data.blogs : [...(prev?.results || []), ...data.blogs],
        page,
        totalCount: data.totalCount
      }));

    } catch (err) {
      console.log("Error searching blogs:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = () => {
    axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/search-users", { query })
      .then(({ data: { users } }) => setUsers(users));
  };

  useEffect(() => {
    resetState();
    searchBlogs({ page: 1, create_new_arr: true });
    fetchUsers();
  }, [query]);

  const resetState = () => {
    setBlog(null);
    setUsers(null);
  };

  const UserCardWrapper = () => {
    return (
      <>
        {users == null ? (
          <Loader />
        ) : users.length ? (
          users.map((user, i) => (
            <AnimationWrapper key={i} transition={{ duration: 1, delay: i * 0.08 }}>
              <UserCard user={user} />
            </AnimationWrapper>
          ))
        ) : (
          <NoDataaMessage message="No user found" />
        )}
      </>
    );
  };

  return (
    <section className="h-cover flex justify-center gap-10">
      <div className="w-full">
        <InPageNavigation
          routes={[`Search Results from "${query}"`, "Accounts Matched"]}
          defaultHidden={isSmallScreen ? [] : ["Accounts Matched"]}
        >
          {blogs === null ? (
            <Loader />
          ) : blogs.results.length > 0 ? (
            blogs.results.map((blog, i) => (
              <AnimationWrapper
                transition={{
                  duration: 1,
                  delay: i * 0.1,
                }}
                key={i}
              >
                <BlogPostCard
                  content={blog}
                  author={blog.author.personal_info}
                />
              </AnimationWrapper>
            ))
          ) : (
            <NoDataaMessage message="No blogs published" />
          )}

          {isSmallScreen && <UserCardWrapper />}
        </InPageNavigation>
      </div>

      {/* Sidebar only on large screens */}
      {!isSmallScreen && (
        <div className="min w-[40%] lg:min-w-[350px] max-w-min border-1 border-grey pl-8 pt-3 max:md:hidden">
          <h1 className="font-medium text-xl mb--8">
            Users related to search <i className="fi fi-rr-user mt-1"></i>
          </h1>
          <UserCardWrapper />
        </div>
      )}
    </section>
  );
};

export default SearchPage;
