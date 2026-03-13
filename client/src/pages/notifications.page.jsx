import { useContext, useEffect, useState } from "react";
import axios from "axios";
import { UserContext } from "../App";

const NotificationsPage = () => {

  const { userAuth } = useContext(UserContext);
  const [notifications, setNotifications] = useState([]);

  const fetchNotifications = async () => {
    try {

      const { data } = await axios.get(
        `${import.meta.env.VITE_SERVER_DOMAIN}/notifications`,
        {
          headers: {
            Authorization: `Bearer ${userAuth.access_token}`
          }
        }
      );

      setNotifications(data.notifications);

    } catch (err) {
      console.error("Error fetching notifications:", err);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  return (
    <div className="max-w-[800px] mx-auto mt-10">

      <h1 className="text-3xl font-semibold mb-6">Notifications</h1>

      {notifications.length === 0 ? (
        <p>No notifications yet</p>
      ) : (
        notifications.map((n, i) => (
          <div key={i} className="p-4 border-b">

            <p>
              <strong>{n.user?.personal_info?.username}</strong>

              {n.type === "like" && " liked your blog "}
              {n.type === "comment" && " commented on your blog "}

              <strong>{n.blog?.title}</strong>
            </p>

          </div>
        ))
      )}

    </div>
  );
};

export default NotificationsPage;