import React,{ useEffect,useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchUserById } from '../API/index';
import FollowButton from './FollowButton';

const AuthorProfile = () => {
    const { authorId } = useParams();
    const [authorInfo, setAuthorInfo] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        const getAuthorInfo = async () => {
            try {
                const data = await fetchUserById(authorId);
                setAuthorInfo(data);
            } catch (error) {
                console.error("Failed to fetch author", error);
                setError("Failed to fetch author");
            };
        };
        
        getAuthorInfo();
    }, [authorId]);

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
                        <div/>
                        
                    </div>
                    <FollowButton authorId={authorInfo.userId} />
                    
                </div>
                
                <h3 className="header">Creator&apos;s Recipes</h3>
                {authorInfo.recipes && authorInfo.recipes.length > 0 ? (
                    <div className="recipe-list">
                    {authorInfo.recipes.map((recipe) => (
                        <div key={recipe.recipeId} className="recipe-card">
                            <Link to={`/recipe/${recipe.recipeId}`}>
                                <div id="imgContainer">
                                    <img src={recipe.recipeUrl} className="image" alt={recipe.title} />
                                </div>
                            </Link>
                            
                            <div id="recipeBar">
                                <h4>{recipe.title}</h4>
                                <div id="likesAndBookmarks">
                                    <p>
                                        <img src="../src/assets/likesIcon.png" alt="likes" />{" "}
                                        {recipe._count?.likes || 0}
                                    </p>
                                    <p>
                                        <img src="../src/assets/bookmarksIcon.png" alt="bookmarks" />{" "}
                                        {recipe._count?.bookmarks || 0}
                                    </p>
                                </div>
                            </div>
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