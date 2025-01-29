import React, {useState,useEffect, useRef, useContext} from "react";
import { Link } from "react-router-dom";
import bellIcon from "../assets/bellIcon2.png";
import "../NotiBell.css"; 
import { SocketContext } from "../SocketContext";

const NotificationBell = () => {
    const socket = useContext(SocketContext); // Get the socket from context
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [dropdownVisible, setDropdownVisible] = useState(false);
    const dropdownRef = useRef(null);
    const token = localStorage.getItem('token');
    
    const [page, setPage] = useState(1); // Tracks the current page
    const [hasMore, setHasMore] = useState(true); // Tracks if there are more notifications to load
    const [loading, setLoading] = useState(false); // For showing 
    
    // Fetch notifications
    const fetchNotifications = async (page = 1) => {
        setLoading(true); // Start loading
        try {
            const response = await fetch(`/api/notifications?limit=10&offset=${(page - 1) * 10}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const data = await response.json();
            
            if (response.ok){
                const {notifications: newNotifications, unreadCount, hasMore: more} = data;

                // When fetching first page, replace notifications
                // When fetching subsequent pages, append notifications
                setNotifications((prevNotifications) => 
                    page === 1 
                    ? newNotifications 
                    : [...prevNotifications, ...newNotifications]
                );
                setUnreadCount(unreadCount); // Update unread count from the server     
                setHasMore(more); // Update "hasMore" flag

                // Calculate unread count during the first page
                if (page === 1) {
                    const unread = newNotifications.filter((notification) => !notification.read).length;
                    setUnreadCount(unread);
                }

            } else {
                console.error('Failed to fetch notifications:', data.message);
            }

        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setLoading(false); // Stop loading
        }
    };

    // When the user logs in (triggered by login or component mount)
    useEffect(() => {
        fetchNotifications(1); // Fetch notifications and initialize unread count
    }, [token]); // Trigger on token change

    useEffect(() => {
        if (page>1) {
            fetchNotifications(page); // Fetch notifications for the current page
        }
    }, [page]);

    const loadMoreNotifications = () => {
        if (!loading && hasMore) {
            setPage((prevPage) => prevPage + 1); // Increment the page number
        }
    };

    // Listen for real-time notifications
    useEffect(() => {
        if (socket) {
            socket.on('newNotification', (notification) => { // Listen for notifications
                //console.log("New notification received:", notification); // Debugging 
                if (notification.message && notification.createdAt) {
                    setNotifications((prev) => [
                        notification,
                        ...prev.filter((notif) => notif.id !== notification.id),
                    ]);
                    setUnreadCount((count) => count + 1); // Increment unread count
                }
            });
            return () => {
                socket.off('newNotification');
            }
        }
    }, [socket]);

    // Time ago function
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

    const handleBellClick = async () => {
        const newVisibility = !dropdownVisible;
        setDropdownVisible(newVisibility);

        if (newVisibility) {
            // When opening the dropdown
            await markAllAsRead(); // Mark all notifications as read
            setPage(1);
            fetchNotifications(1); // Fetch the latest notifications
        }
    }

    // Function to mark all notifications as read
    const markAllAsRead = async () => {
        try {
            
            await fetch('/api/notifications/mark-read', {
                method: 'PUT',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setUnreadCount(0); // Reset unread count
            setNotifications((prev) =>
                prev.map((notification) => ({ ...notification, read: true }))
        ); // Mark notifications as read locally
        } catch (error) {
            console.error('Error marking notifications as read:', error);
        }
    };
    
    // Close dropdown on outside click
    useEffect(() => {
        const handleOutsideClick = (event) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target) &&
                !event.target.closest(".bell-icon") // Check if clicked element is not the bell icon
            ) {
                setDropdownVisible(false);
                markAllAsRead(); // Mark all notifications as read
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
                                            onClick={handleLinkClick}
                                        >
                                            {notification.fromUser.name}
                                        </Link>
                                    )}

                                    {notification.type === "like" && (
                                        <span> liked your recipe - </span>
                                    )}
                                    {notification.type === "comment" && (
                                        <span> commented on your recipe - </span>
                                    )}
                                    {notification.type === "new_recipe" && (
                                        <span> created a new recipe - </span>
                                    )}
                                    {notification.type === "bookmark" && (
                                        <span> bookmarked your recipe - </span>
                                    )}
                                    {notification.type === "follow" && (
                                        <span> followed you.</span>
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

                    {/* "See More Notifications" Button */}
                    {hasMore && (
                        <button 
                            onClick={loadMoreNotifications} 
                            disabled={loading} 
                            className="see-more-button">
                                {loading 
                                ? "Loading..."
                                : 'See More Notifications'}
                        </button>
                    )}
                    
                </div>
            )}
        </div>
     );

    
}
 
export default NotificationBell;
