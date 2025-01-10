import React,{ useEffect,useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchUserById } from '../API/index';
import FollowButton from './FollowButton';

const AuthorProfile = () => {
    return ( 
        <div>
            Author Profile
        </div>
     );
}
 
export default AuthorProfile;