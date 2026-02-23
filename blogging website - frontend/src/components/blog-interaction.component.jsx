import { useContext, useEffect } from "react";
import { BlogContext } from "../pages/blog.page";
import { Link } from "react-router-dom";
import { UserContext } from "../App";
import { Toaster, toast } from "react-hot-toast";
import axios from "axios";

const BlogInteraction = () => {
  const context = useContext(BlogContext);
  const userContext = useContext(UserContext);

  if (!context?.blog || !context.blog.activity || !context.blog.author?.personal_info) {
    return null;
  }

  const {
    blog,
    setBlog,
    isLikedByUser,
    setLikedByUser,
    setCommentsWrapper,
  } = context;

  const {
    _id,
    title,
    des,
    blog_id,
    activity: { total_likes, total_comments },
    author: { personal_info: { username: author_username } }
  } = blog;

  const {
    userAuth: { username, access_token }
  } = userContext;

  useEffect(() => {
    axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/isliked-by-user", { _id }, {
      headers: {
        'Authorization': `Bearer ${access_token}`
      }
    })
    .then(({ data: { result } }) => {
      setLikedByUser(Boolean(result));
    })
    .catch(err => {
      console.log(err);
    });
  }, [_id, access_token, setLikedByUser]);

  const handleLike = () => {
    if (!access_token) {
      toast.error("Please login to like this blog");
      return;
    }

    const previousState = isLikedByUser;
    const newState = !previousState;

    setLikedByUser(newState);
    setBlog(prev => ({
      ...prev,
      activity: {
        ...prev.activity,
        total_likes: prev.activity.total_likes + (newState ? 1 : -1)
      }
    }));

    axios.post(`${import.meta.env.VITE_SERVER_DOMAIN}/like-blog`, {
      _id,
      isLikedByUser: previousState
    }, {
      headers: {
        'Authorization': `Bearer ${access_token}`
      }
    })
    .then(({ data }) => {
      setLikedByUser(data.likedByUser);
      setBlog(prev => ({
        ...prev,
        activity: {
          ...prev.activity,
          total_likes: data.total_likes
        }
      }));
    })
    .catch(err => {
      console.error("Like error:", err);
      toast.error("Failed to update like. Please try again.");
      setLikedByUser(previousState);
      setBlog(prev => ({
        ...prev,
        activity: {
          ...prev.activity,
          total_likes: prev.activity.total_likes + (previousState ? 1 : -1)
        }
      }));
    });
  };

  return (
    <>
      <Toaster />
      <hr className="border-grey my-2" />

      {/* Blog Description */}
      {des && (
        <p className="text-lg text-dark-grey mt-4 mb-6">
          {des}
        </p>
      )}

      <div className="flex gap-6 justify-between">
        <div className="flex gap-3 items-center">
          <button
            onClick={handleLike}
            className={
              "w-10 h-10 rounded-full flex items-center justify-center " +
              (isLikedByUser ? "bg-red/20 text-red" : "bg-grey/80")
            }
          >
            <i className={"fi " + (isLikedByUser ? "fi-sr-heart" : "fi-rr-heart")}></i>
          </button>

          <p className="text-xl text-dark-grey">{total_likes}</p>

          <button
            onClick={() => setCommentsWrapper(preVal => !preVal)}
            className="w-10 h-10 rounded-full flex items-center justify-center bg-grey/80"
          >
            <i className="fi fi-rr-comment-dots"></i>
          </button>
          <p className="text-xl text-dark-grey">{total_comments}</p>
        </div>

        <div className="flex gap-6 items-center">
          {username === author_username && (
            <Link to={`/editor/${blog_id}`} className="underline hover:text-purple">
              Edit
            </Link>
          )}

          <Link to={`https://twitter.com/intent/tweet?text=Read ${title}&url=${location.href}`}>
            <i className="fi fi-brands-twitter text-xl hover:text-twitter"></i>
          </Link>
        </div>
      </div>

      <hr className="border-grey my-2" />
    </>
  );
};

export default BlogInteraction;
