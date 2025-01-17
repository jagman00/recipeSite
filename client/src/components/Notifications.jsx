import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchNotifications = async () => {
      const response = await fetch('/api/notifications', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setNotifications(data);
    };

    fetchNotifications();
  }, []);

  return (
    <div id="userContainer">
        <h2>{notifications.length} Notifications</h2>
        {notifications.map((notification) => (
            <div key={notification.id} style={{ marginBottom: '10px' }}>
                {notification.fromUser && (
                    <Link to={`/author/${notification.fromUser.userId}`}>
                        {notification.fromUser.name}
                    </Link>
                )}{' '}

                {notification.type === "like" && (
                    <span>liked your recipe - </span>
                )}
                {notification.type === "comment" && (
                    <span>commented on your recipe - </span>
                )}
                {notification.type === "new_recipe" && (
                    <span>created a new recipe - </span>
                )}
                {notification.type === "bookmark" && (
                    <span>bookmarked your recipe - </span>
                )}
                {notification.type === "follow" && (
                    <span>followed you.</span>
                )}

                {notification.recipe && (
                    <Link to={`/recipe/${notification.recipe.recipeId}`}>
                        {notification.recipe.title}
                    </Link>
                )}
                
            </div> 
        ))}
    </div>
  );
};

export default Notifications;