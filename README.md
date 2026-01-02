# Sri Dikshitha – Tailoring Management Web Application

This is a full-stack tailoring shop website built using Node.js, Express, and MongoDB.

## Features

### Customers
- View designs, materials, and gold items
- Write reviews (visible after admin approval)
- Mobile-friendly layout
- Secure login and registration

### Admin
- Add, edit, delete designs, materials, and gold
- Approve customer reviews
- Open / close shop status

## Admin Access

This application uses role-based access control.

• Admin accounts are pre-configured in the database  
• Admin credentials are NOT publicly exposed for security reasons  
• Only users with the `admin` role can access the admin dashboard  
• Regular users are registered with `user` role by default  

To change or add admins:
• Update the user role directly in MongoDB Atlas
• Set `role: "admin"` for the required user


## Tech Stack
- Node.js
- Express
- MongoDB Atlas
- EJS
- Cloudinary
- Render (Deployment)

## Live Website
https://sri-dikshitha-tailoring-website.onrender.com

## Run Locally

1. Clone the repository
2. Install dependencies
3. Create `.env` file
4. Run `npm start`
