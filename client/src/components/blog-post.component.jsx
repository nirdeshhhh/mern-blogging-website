import { getDay } from "../common/date";
import { Link } from "react-router-dom";

const BlogPostCard = ({ content, author = {} }) => {

  const {
    publishAt,
    createdAt,
    timestamp,
    tags = [],
    title = "Untitled",
    des = "",
    banner = "/path/to/default/banner.jpg",
    activity = {},
    blog_id: id
  } = content;

  const {
    fullname = "Unknown Author",
    profile_img = "/path/to/default/profile.jpg",
    username = "unknown"
  } = author;

  const total_likes = activity.total_likes || 0;

  // 🛠 Safely decide which date to use
  const dateToShow = publishAt || createdAt || timestamp || "";

  return (
    <Link to={`/blog/${id}`} className="flex gap-8 items-center border-b border-grey pb-5 mb-4">
      <div className="w-full">
        <div className="flex gap-2 items-center mb-7 text-sm text-dark-grey">
          <img src={profile_img} className="w-6 h-6 rounded-full object-cover" alt="Author" />
          <p className="line-clamp-1">{fullname} @{username}</p>
          <p className="min-w-fit">{getDay(dateToShow)}</p>
        </div>

        <h1 className="blog-title">{title}</h1>

        <p className="my-3 text-xl font-gelasio leading-7 max-sm:hidden md:max-[1100px]:hidden line-clamp-2">
          {des}
        </p>

        <div className="flex gap-4 mt-7">
          {tags[0] && (
            <span className="btn-light py-1 px-4">
              {tags[0]}
            </span>
          )}
          <span className="ml-3 flex items-center gap-2 text-dark-grey">
            <i className="fi fi-rr-heart text-xl"></i> {total_likes}
          </span>
        </div>
      </div>

      <div className="h-28 aspect-square bg-grey flex items-center justify-center">
        <img src={banner} className="w-full h-full object-cover rounded-md" alt="Blog banner" />
      </div>
    </Link>
  );
};

export default BlogPostCard;
