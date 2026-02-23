import AnimationWrapper from "../common/page-animation";
import BlogPostCard from "../components/blog-post.component";
import InPageNavigation from "../components/inpage-navigation.component";
import Loader from "../components/loader.component";
import { useEffect, useState } from "react";
import axios from "axios";
import filterPaginationData from "../common/filter-pagination-data";
import MinimalBlogPost from "../components/nobanner-blog-post.component";
import { activeTabRef } from "../components/inpage-navigation.component";
import NoDataMessage from "../components/nodata.component";

const HomePage = () => {
  const [blogs, setBlog] = useState(null);
  const [homeBlogs, setHomeBlogs] = useState(null);
  const [trendingBlogs, setTrendingBlogs] = useState(null);
  const [pageState, setPageState] = useState("home");
  const [loading, setLoading] = useState(true);

  const categories = ["general", "law", "computer science", "fest", "bjmc", "bba", "campus updates"];

  const fetchLatestBlogs = async ({ page = 1, category = "" } = {}) => {
    try {
      const { data } = await axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/latest-blogs", { page, category });

      console.log("Fetched Latest Blogs:", data.blogs); // 👈 ADD THIS

  
      // 🛠 Fix: Ensure blogs have a valid createdAt
      const fixedBlogs = data.blogs.map(blog => ({
        ...blog,
        createdAt: blog.createdAt || blog.timestamp || new Date().toISOString(),
      }));
  
      const formattedData = await filterPaginationData({
        state: blogs,
        data: fixedBlogs,
        page,
        countRoute: "/all-latest-blogs-count",
      });
  
      setHomeBlogs(formattedData);
      setBlog(formattedData);
      setLoading(false);
    } catch (err) {
      console.log("Error fetching latest blogs:", err);
      setLoading(false);
    }
  };
  
  const fetchBlogsByCategory = async () => {
    setLoading(true);
    try {
      const { data } = await axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/search-blogs", {
        tag: pageState,
      });

      setBlog({ results: data.blogs });
      setLoading(false);
    } catch (err) {
      console.log("Error fetching category blogs:", err);
      setLoading(false);
    }
  };

  const fetchTrendingBlogs = async () => {
    try {
      const { data } = await axios.get(import.meta.env.VITE_SERVER_DOMAIN + "/trending-blogs");
      setTrendingBlogs(data.blogs);
    } catch (err) {
      console.log("Error fetching trending blogs:", err);
    }
  };

  const loadBlogByCategory = (e) => {
    const category = e.target.innerText.toLowerCase();
    setLoading(true);

    if (pageState === category) {
      setPageState("home");
    } else {
      setPageState(category);
    }
  };

  useEffect(() => {
    if (typeof activeTabRef === "function") {
      activeTabRef();
    }

    if (pageState === "home") {
      if (homeBlogs) {
        setBlog(homeBlogs);
        setLoading(false);
      } else {
        fetchLatestBlogs();
      }
    } else {
      fetchBlogsByCategory();
    }

    if (!trendingBlogs) {
      fetchTrendingBlogs();
    }
  }, [pageState]);

  return (
    <AnimationWrapper>
      <section className="min-h-screen flex justify-center gap-10 px-4 md:px-8 pt-10">
        <div className="w-full max-w-4xl">
          <InPageNavigation routes={[pageState, "trending blogs"]} defaultHidden={["trending blogs"]}>
            <>
              {loading ? (
                <Loader />
              ) : blogs?.results?.length > 0 ? (
                blogs.results.map((blog, i) => (
                  <AnimationWrapper transition={{ duration: 0.6, delay: i * 0.08 }} key={i}>
                    <BlogPostCard content={blog} author={blog.author?.personal_info} />
                  </AnimationWrapper>
                ))
              ) : (
                <NoDataMessage message="No blog found" />
              )}
            </>
            {!trendingBlogs || trendingBlogs.length === 0 ? (
              <Loader />
            ) : (
              trendingBlogs.map((blog, i) => (
                <AnimationWrapper transition={{ duration: 0.6, delay: i * 0.08 }} key={i}>
                  <MinimalBlogPost blog={blog} index={i} />
                </AnimationWrapper>
              ))
            )}
          </InPageNavigation>
        </div>

        {/* Right Sidebar */}
        <aside className="min-w-[220px] max-w-xs border-l border-light-gray pl-6 pt-3 max-md:hidden ml-8">
          <div className="flex flex-col gap-12">
            {/* Categories */}
            <div>
              <h2 className="font-semibold text-2xl text-gray-800 mb-6">Explore Topics</h2>
              <div className="flex flex-wrap gap-3">
                {categories.map((category, i) => (
                  <button
                    onClick={loadBlogByCategory}
                    className={`px-4 py-2 rounded-full border text-sm font-medium transition ${
                      pageState === category
                        ? "bg-black text-white"
                        : "border-gray-300 text-gray-700 hover:bg-gray-100"
                    }`}
                    key={i}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            {/* Trending Section */}
            <div>
              <h2 className="font-semibold text-2xl text-gray-800 mb-6 flex items-center gap-2">
                BU Trendings <i className="fi fi-rr-arrow-trend-up text-xl"></i>
              </h2>
              {!trendingBlogs || trendingBlogs.length === 0 ? (
                <Loader />
              ) : (
                trendingBlogs.map((blog, i) => (
                  <AnimationWrapper transition={{ duration: 0.6, delay: i * 0.08 }} key={i}>
                    <MinimalBlogPost blog={blog} index={i} />
                  </AnimationWrapper>
                ))
              )}
            </div>
          </div>
        </aside>
      </section>
    </AnimationWrapper>
  );
};

export default HomePage;
