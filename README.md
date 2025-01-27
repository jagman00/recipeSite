# Recipe Round Table
Recipe Round Table is a full-stack web application designed to connect food enthusiasts with a vibrant community for sharing and discovering recipes. The platform provides a seamless experience for users to create, share, bookmark, and explore recipes while engaging with others through likes, comments, and follows.

## Key Features
1. User Account
	•	Secure user register and login authentications using JSON Web Tokens (JWT).
    •	User can also register and login wiht gmail account (OAuth).
    •	User can edit informations and upload picture to his/her profile
	•	Persistent user sessions.

2. Recipe Management
	•	Create, edit, and delete recipes.
	•	Each recipe includes a title, ingredients, instructions, and images.

3. Social Interactions
	•	Users can like, comment on, and bookmark recipes.
	•	Follow other users to stay updated with their recipe creations.
	•	View profiles to see user-specific recipes and activities.

4. Notifications
	•	Receive real-time notifications for:
	    •	Likes on your recipes.
        •	When someone bookmarks your recipe.
	    •	Comments on your recipes.
	    •	When someone follows you.
        •	When someone you followed create a new recipe.
	•	Notification dropdown with the latest 10 notifications.
	•	A “See More Notifications” button for older notifications.

5. Recipe Bookmarking
	•	Save your favorite recipes to a “Bookmarked Recipes” page for quick access.

6. Utilities
    •	Print button for printing
    •	Convertion table button for quick unit reference
    •	Report button for reporting inappropriate contents

7. Search and Filter
	•	Search recipes using keywords.
	•	Filter recipes by categories.

7. Other features
    •	Admin dashboard
    •	Activity Feed
    •	Contact us

8. Responsive Design 
    •	Seamless user interface across devices with different screen sizes: desktop, tablet or mobile.

## Tech Stack
- **Frontend**: HTML, CSS, JavaScript, React
- **Backend**: Node.js, Express
- **Database**: PostgreSQL with Prisma for ORM
- **Other Tools**
	•	Socket.IO: Real-time notifications.
	•	JWT: Secure authentication.
	•	Multer: For image uploads.
    •	Postman: For testing and documenting API

## Contributors
- **Jackson Grant**
- **Thu Yein Tun**
- **William Howard**
- **Caleb Vang Dodson**
- **Ryan Raidt**

## Installation and Setup
### Prerequisites
- Node.js and npm
- PostgreSQL

### Clone the Repository
- git clone git@github.com:jagman00/recipeSite.git
- cd recipeSite

### Install Dependencies
- npm install 

### Configure Environment Variables
Create a .env file in the root direcroty
- DATABASE_URL=your_postgresql_database_url
- JWT_SECRET=your_secret_key

### Run the Development Server
- npm run dev


## Usage
1.	Sign Up or Log In: Create an account or log in to access the platform.
2.	Explore Recipes: Browse recipes shared by the community.
3.	Create Recipes: Add your own recipes to the platform.
4.	Engage: Like, comment on, and bookmark recipes. Follow other users to see their latest creations.
5.	Manage Notifications: Stay updated with real-time notifications.

## Future Enhancements
- Implement advanced search and filtering. 
- Add social sharing options for recipes.
- Introduce a premium subscription with exclusive recipes and features.


### Extra Notes for developers : 
If there any changes and update in schema.prisma
try running 
npx prisma generate 
npx prisma db push
npx prisma migrate reset
(or)
npx prisma migrate dev --name init

To use jwt_decode in frontend, in your client file terminal, please run
npm install jwt-decode (or) 
yarn add jwt-decode to install the library.
And, import the following in your required file
import { jwtDecode } from "jwt-decode";

For Google Authentication
(1)npm install - in both frontend and backend
(2)npm run build - in frontend client
(3)include GOOGLE_CLIENT_ID in backend .env
(4)create .env in root/client and include VITE_GOOGLE_CLIENT_ID

To store the uploaded files 
(1)npm install in both frontend and backend
(2)Please create uploads folder in the root folder. Same level as server.js
recipeSite/uploads
(3)In your .gitignore file please include
uploads/

For Using socket.io
(1)Server - npm install socket.io
(2)Client - npm install socket.io-client
(or)if already included in package.json, just npm install on both sides.