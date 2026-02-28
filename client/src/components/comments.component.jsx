import { useContext } from "react";
import { BlogContext } from "../pages/blog.page";
import CommentField from "./comment-field.component";
import axios from "axios";
import NoDataMessage from "./nodata.component";
import AnimationWrapper from "../common/page-animation";

export const fetchComments = async ({ skip = 0, blog_id, setParentCommentCountFun, comment_array = null }) => {
  try {
    // Fetching comments from the server
    const { data } = await axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/get-blog-comments", { blog_id, skip });

    // Process each comment (e.g., add a 'childrenLevel' property)
    data.forEach(comment => {
      comment.childrenLevel = 0;
    });

    // Update parent comment count
    setParentCommentCountFun(prev => prev + data.length);

    // If comment_array is null, initialize a new response with the fetched data
    let updatedComments;
    if (comment_array == null) {
      updatedComments = { results: data };  // Initial comment array
    } else {
      updatedComments = { results: [...comment_array, ...data] };  // Append to existing comments
    }

    // You can now use updatedComments wherever you need it
    return updatedComments;  // Return updated comments

  } catch (err) {
    console.error("Error fetching comments:", err.response ? err.response.data : err.message);
    throw err;  // Rethrow the error to handle it in the calling component
  }
};




const CommentsContainer = () => {
  
  let { blog: { title, comments }, commentWrapper, setCommentsWrapper } = useContext(BlogContext);

  // Check if comments is defined and if results exists
  const commentsArr = comments?.results || [];

  console.log(commentsArr)

  return (
    <div
      className={
        "max-sm:w-full fixed " +
        (commentWrapper ? "top-0 sm:right-0" : "top-[100%] sm:right-[-100%]") +
        " duration-700 max-sm:right-0 sm:top-0 w-[30%] min-w-[350px] h-full z-50 bg-white shadow-2xl p-8 px-16 overflow-y-auto overflow-x-hidden"
      }
    >
      <div className="relative">
        <h1 className="text-xl font-medium">Comments</h1>
        <p className="text-lg mt-2 w-[78%] text-dark-grey line-clamp-1">{title}</p>

        <button
          onClick={() => setCommentsWrapper(preVal => !preVal)}
          className="absolute top-0 right-0 flex justify-center items-center w-12 h-12 rounded-full bg-grey"
        >
          <i className="fi fi-br-cross text-2xl mt-1"></i>
        </button>
      </div>

      <hr className="border-grey my-8 w-[120%] -ml-10" />

      <CommentField action="comment" />

      {
        commentsArr && commentsArr.length ? commentsArr.map((comment, i) => {
          return <AnimationWrapper key={i}>
            <CommentCard/>
          </AnimationWrapper>
        }) : <NoDataMessage message="No Comments" />
      }
    </div>
  );
};


export default CommentsContainer;
