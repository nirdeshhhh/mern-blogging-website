import React, { useState, useEffect, createContext } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import AnimationWrapper from '../common/page-animation';
import Loader from '../components/loader.component';
import { Link } from 'react-router-dom';
import { getDay } from '../common/date';
import BlogInteraction from '../components/blog-interaction.component';
import BlogPostCard from '../components/blog-post.component';
import BlogContent from '../components/blog-content.component';
import CommentsContainer, { fetchComments } from '../components/comments.component';

export const blogStructure = {
  title: '',
  des: '',
  content: [],
  author: { personal_info: {} },
  banner: '',
  tags: '',
  publishedAt: '',
};

export const BlogContext = createContext({});

const BlogPage = () => {
  let { blog_id } = useParams();

  const [blog, setBlog] = useState(blogStructure);
  const [similarBlogs, setSimilarBlogs] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLikedByUser, setLikedByUser] = useState(false);
  const [commentWrapper, setCommentsWrapper] = useState(false);
  const [totalParentCommentsLoaded, setTotalParentCommentsLoaded] = useState(0);

  const fetchBlog = () => {
   
    axios.post(import.meta.env.VITE_SERVER_DOMAIN + '/get-blog', { blog_id })
    .then(async ({ data: {blog} }) => {
        
        blog.comments = await fetchComments({ blog_id: blog_id, setParentCommentCountFun: setTotalParentCommentsLoaded });
  
        setBlog(blog);
  
        // Similar blogs
        axios
          .post(import.meta.env.VITE_SERVER_DOMAIN + '/search-blogs', {
            tag: blog.tags[0],
            limit: 6,
            eliminate_blog: blog_id,
          })
          .then(({ data }) => {
            setSimilarBlogs(data.blogs);
          });
  
        setLoading(false);
      })
      .catch((err) => {
        console.log("Error fetching blog:", err);
        setLoading(false);
      });
  };
  

  useEffect(() => {
    resetState();
    fetchBlog();
  }, [blog_id]);

  const resetState = () => {
    setBlog(blogStructure);
    setSimilarBlogs(null);
    setLoading(true);
    setLikedByUser(false);
    setCommentsWrapper(false);
    setTotalParentCommentsLoaded(0);
  };

  // If the blog is still loading, return the loader
  if (loading) {
    return <Loader />;
  }

  const {
    title,
    content,
    banner,
    author: {
      personal_info: { fullname, username: author_username, profile_img },
    },
    publishedAt,
    tags,
  } = blog;

  return (
    <AnimationWrapper>
      <BlogContext.Provider
        value={{
          blog,
          setBlog,
          isLikedByUser,
          setLikedByUser,
          commentWrapper,
          setCommentsWrapper,
          totalParentCommentsLoaded,
          setTotalParentCommentsLoaded,
        }}
      >
        <CommentsContainer />

        <div className="max-w-4xl mx-auto py-12 px-6 md:px-0">
          {/* Banner */}
          <img
            src={banner}
            alt="Banner"
            className="rounded-xl aspect-video w-full object-cover shadow-sm"
          />

          {/* Title & Author */}
          <div className="mt-10">
            <h1 className="text-3xl md:text-4xl font-bold leading-tight">{title}</h1>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-6 text-sm text-gray-600">
              <div className="flex items-center gap-4">
                <img
                  src={profile_img}
                  alt="Author"
                  className="w-12 h-12 rounded-full object-cover shadow-sm"
                />
                <div>
                  <p className="font-medium text-gray-800 capitalize">{fullname}</p>
                  <p className="text-gray-500">
                    @
                    <Link to={`/user/${author_username}`} className="underline hover:text-indigo-600 transition">

                      {author_username}
                    </Link>
                  </p>
                </div>
              </div>

              <p className="mt-4 sm:mt-0 text-gray-500">
                Published on <span className="font-medium">{getDay(publishedAt)}</span>
              </p>
            </div>
          </div>

          {/* Interactions */}
          <div className="mt-10">
            <BlogInteraction />
          </div>

          {/* Blog Content */}
          <div className="prose max-w-none mt-12 mb-20 font-gelesio blog-page-content">
            {Array.isArray(content) &&
              content.map((block, i) => (
                <div key={i} className="my-6 md:my-8">
                  <BlogContent block={block} />
                </div>
              ))}
          </div>

          {/* Similar Blogs */}
          {similarBlogs && similarBlogs.length > 0 && (
            <div className="mt-20">
              <h2 className="text-2xl font-semibold mb-6 text-gray-800">Similar Blogs</h2>
              <div className="space-y-6">
                {similarBlogs.map((blog, i) => {
                  let {
                    author: { personal_info },
                  } = blog;

                  return (
                    <AnimationWrapper key={i} transition={{ duration: 1, delay: i * 0.08 }}>
                      <BlogPostCard content={blog} author={personal_info} />
                    </AnimationWrapper>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </BlogContext.Provider>
    </AnimationWrapper>
  );
};

export default BlogPage;
