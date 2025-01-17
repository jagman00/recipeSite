# recipeSite

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