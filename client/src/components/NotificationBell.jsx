import React, {useState,useEffect, useRef} from "react";
import { Link } from "react-router-dom";
import bellIcon from "../assets/bellIcon1.png";
import "../NotiBell.css"; 

const NotificationBell = () => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [dropdownVisible, setDropdownVisible] = useState(false);
    const dropdownRef = useRef(null);
    const token = localStorage.getItem('token');

    //Fetch notifications
    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const response = await fetch('/api/notifications', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                const data = await response.json();
                setNotifications(data);
                
                // Count unread notifications
                const unread = data.filter((notification) => !notification.read);
                setUnreadCount(unread.length);
            } catch (error) {
                console.error('Error fetching notifications:', error);
            }
        };

        fetchNotifications();
    }, [token]);

    function timeAgo(date) {
        const now = new Date();
        const seconds = Math.floor((now - date) / 1000);
      
        if (seconds < 60) return `${seconds} sec${seconds > 1 ? 's' : ''} ago`;
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes} min${minutes > 1 ? 's' : ''} ago`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours} hr${hours > 1 ? 's' : ''} ago`;
        const days = Math.floor(hours / 24);
        if (days < 30) return `${days} day${days > 1 ? 's' : ''} ago`;
        const months = Math.floor(days / 30);
        if (months < 12) return `${months} mth${months > 1 ? 's' : ''} ago`;
        const years = Math.floor(months / 12);
        return `${years} yr${years > 1 ? 's' : ''} ago`;
    }

    
    const handleBellClick = async (event) => {
        setDropdownVisible((prev) => !prev);

        // Mark notifications as read when dropdown opens
        if (!dropdownVisible && unreadCount > 0) { 
            try {
                await fetch('/api/notifications/mark-read', {
                    method: 'PUT',
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                // Update local state
                setUnreadCount(0);
                setNotifications(notifications.map((notification) => ({ ...notification, read: true })));
            } catch (error) {
                console.error('Error marking notifications as read:', error);
            }
        }
    }
    
    // Hide dropdown on outside click
    useEffect(() => {
        const handleOutsideClick = (event) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target) &&
                !event.target.closest(".bell-icon") // Check if clicked element is not the bell icon
            ) {
                setDropdownVisible(false);
            }
        };

        document.addEventListener("mousedown", handleOutsideClick);
        return () => {
            document.removeEventListener("mousedown", handleOutsideClick);
        };
    }, []);

    // Hide dropdown when clicking on a link
    const handleLinkClick = () => {
        setDropdownVisible(false);
    };

    return ( 
        <div className="notification-bell" >
            <button onClick={handleBellClick} className="bell-icon">
                <img src={bellIcon} alt="Notifications" />
                {unreadCount > 0 && <span className="unread-count">{unreadCount}</span>}
            </button>

            {dropdownVisible && (
                <div className="notification-dropdown" ref={dropdownRef}>
                    <h2>Notifications</h2>

                    {notifications.length === 0 ? (
                        <p>No new notifications.</p>
                    ):(
                        <ul>
                            {notifications.map((notification) => (
                                <li key={notification.id} className={notification.read ? 'read' : 'unread'}>
                                    {notification.fromUser && (
                                        <Link 
                                        to={`/author/${notification.fromUser.userId}`}
                                        className="notification-link"
                                        onClick={handleLinkClick}>
                                            {notification.fromUser.name}
                                        </Link>
                                    )}

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
                                        <Link 
                                            to={`/recipe/${notification.recipe.recipeId}`}
                                            className="notification-link"
                                            onClick={handleLinkClick}
                                        >
                                            {notification.recipe.title}
                                        </Link>
                                    )}

                                    <br />
                                    <small>{timeAgo(new Date(notification.createdAt))}</small>
                                </li>
                            ))}
                        </ul>
                        
                    )}
                    
                </div>
            )}
        </div>
     );

    
}
 
export default NotificationBell;
