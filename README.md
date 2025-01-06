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