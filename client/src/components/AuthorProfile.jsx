import React,{ useEffect,useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchUserById,fetchFollowers, fetchFollowings, fetchUser } from '../API/index';
import FollowButton from './FollowButton'; 
import Modal from './Modal';


const AuthorProfile = () => {
    const { authorId } = useParams();
    const [authorInfo, setAuthorInfo] = useState(null);
    const [error, setError] = useState(null);
    const [followerCount, setFollowerCount] = useState(0);
    const [followingCount, setFollowingCount] = useState(0);
    const [followers, setFollowers] = useState([]);
    const [followings, setFollowings] = useState([]);

    const [loggedInUserId, setLoggedInUserId] = useState(null);
    const [loggedInUserName, setLoggedInUserName] = useState(""); 

    const [modalOpen, setModalOpen] = useState(false);
    const [modalTitle, setModalTitle] = useState("");
    const [modalContent, setModalContent] = useState(null);

    const token = localStorage.getItem("token");

    useEffect(() => {

        const getAuthorInfo = async () => {
            try {
                const data = await fetchUserById(authorId);
                setAuthorInfo(data);

                const followersData = await fetchFollowers(authorId);
                setFollowerCount(followersData.followerCount);
                setFollowers(followersData.followerList || []); // Default to empty array if no data

                const followingsData = await fetchFollowings(authorId);
                setFollowingCount(followingsData.followingCount);
                setFollowings(followingsData.followingList || []);
            } catch (error) {
                console.error("Failed to fetch author", error);
                setError("Failed to fetch author");
            };
        };
        
        const getLoggedInUser = async () => {
            try {
                const user = await fetchUser(token);
                setLoggedInUserId(user.userId);
                setLoggedInUserName(user.name);
            } catch (error) {
                console.error("Failed to fetch logged-in user", error);
            }
        };

        getAuthorInfo();
        getLoggedInUser();
    }, [authorId]); 

    /* Follow List */
    const handleFollowChange = (loggedInUserId, isFollowing, loggedInUsername) => {
    if (isFollowing) {
        // Add the logged-in user to the author's followers list
        const newFollower = {
        userId: loggedInUserId,
        name: loggedInUsername,
        };
        setFollowers((prevFollowers) => [...prevFollowers, newFollower]);
        setFollowerCount((prevCount) => prevCount + 1);
    } else {
        // Remove the logged-in user from the author's followers list
        setFollowers((prevFollowers) =>
        prevFollowers.filter((user) => user.userId !== loggedInUserId)
        );
        setFollowerCount((prevCount) => prevCount - 1);
    }
    };
    
    const handleViewFollowers = () => {
        setModalTitle("Followers");
        setModalContent(
          followers.length > 0 ? (
            followers.map((follower) => (
              <div key={follower.userId} className="follower">
                {follower.userId === loggedInUserId ? (
                  <Link to={`/user`}>{follower.name}</Link>
                ) : (
                  <>
                    <Link to={`/author/${follower.userId}`}>{follower.name}</Link>
                    <FollowButton
                      authorId={follower.userId}
                      authorName={follower.name}
                    />
                  </>
                )}
              </div>
            ))
          ) : (
            <p>This user does not have followers yet.</p>
          )
        );
        setModalOpen(true);
      };

    const handleViewFollowings = () => {
    setModalTitle("Following");
    setModalContent(
        followings.length > 0 ? (
        followings.map((following) => (
            <div key={following.userId} className="following">

            {following.userId === loggedInUserId ? (
                <Link to={`/user`}>{following.name}</Link>
            ) : (
                <>
                    <Link to={`/author/${following.userId}`}>{following.name}</Link>
                    <FollowButton
                        authorId={following.userId}
                        authorName={following.name}
                    />
                </>
            )}

            </div>
        ))
        ) : (
        <p>This user is not following anybody yet.</p>
        )
    );
    setModalOpen(true);
    };

    const handleCloseModal = () => {
    setModalOpen(false);
    setModalTitle("");
    setModalContent(null);
    };
    
    return ( 
        <div>
            {authorInfo ? (
                <div id="userContainer">
                    <div id="userPicAndDetailsContainer">
                        <div id="profileBorder">
                            <div id="userProfilePicContainer">
                                <img src={authorInfo?.profileUrl} alt="User Profile" />
                            </div>
                        </div>
                        <div id="userDetailsContainer">
                            <h3 className="header">User Details</h3>
                            <p><strong>Name:</strong> {authorInfo.name}</p>
                            <p><strong>Email:</strong> {authorInfo.email}</p>
                            <p><strong>Title:</strong> {authorInfo.userTitle || "Not provided"}</p>
                            <p><strong>Bio:</strong> {authorInfo.bio || "Not provided"}</p>

                            <span className="cursor" onClick={handleViewFollowers}>
                                <strong>Followers:</strong>{" "}
                                {followerCount >= 1000 ? (followerCount / 1000).toFixed(1) + "k" : followerCount}
                            </span>{" "}
                            <span className="cursor" onClick={handleViewFollowings}>
                                <strong>Following:</strong>{" "}
                                {followingCount >= 1000 ? (followingCount / 1000).toFixed(1) + "k" : followingCount}
                            </span>
                        <div/>
                        <FollowButton
                            authorId={authorInfo.userId}
                            onFollowChange={(userId, isFollowing) => handleFollowChange(loggedInUserId, isFollowing, loggedInUserName)} // Pass name dynamically
                            authorName={authorInfo.name}
                        />
                    </div>
                    <Modal isOpen={modalOpen} onClose={handleCloseModal} title={modalTitle}>
                        {modalContent}
                    </Modal>
                    
                </div>
                
                <h3 className="header">Creator&apos;s Recipes</h3>
                {authorInfo.recipes && authorInfo.recipes.length > 0 ? (
                    <div className="recipeList">
                    {authorInfo.recipes.map((recipe) => (
                        <div key={recipe.recipeId} className="recipeCard">
                            <Link to={`/recipe/${recipe.recipeId}`}>
                                <div id="profileImgContainer">
                                    <img src={recipe.recipeUrl} className="image" alt={recipe.title} />
                                </div>
                                <div id="recipeBar">
                                    <h4>{recipe.title}</h4>
                                </div>
                            </Link>
                        </div>
                    ))}
                    </div>
                ) : (
                    <p id="noRecipes">No recipes found.</p>
                )}
                </div>
            ) : (
                <p>Loading author information...</p>
            )
                  
            }
        </div>
     );
}
 
export default AuthorProfile;
