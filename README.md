# Nova Commerce

A modern React ecommerce starter built with Vite, React Router and custom CSS3 (no Tailwind).

## Run locally
1. Install Node.js (18+ recommended).
2. Open this folder in a terminal.
3. Run `npm install`
4. Run `npm run dev`
5. Open the local URL printed by Vite.

## Included
- Responsive home page with hero, categories and featured products
- Dedicated product listing route (`/products`)
- Product detail route (`/products/:id`)
- Login and registration with client-side form validation
- Admin dashboard with category-based product creation and inventory deletion
- Logout button
- Search, category filtering, add-to-cart and quantity controls
- Checkout page with Cash on Delivery
- Order confirmation and local demo order history
- Browser localStorage persistence

## Important before deploying to Vercel
This project is a frontend prototype. Authentication, admin roles, products, cart and orders currently use browser localStorage. Client-side credentials or role checks are not secure: users can inspect or modify frontend code and browser storage. Before accepting real orders or exposing an admin dashboard publicly, connect a backend/database and implement server-side authentication, authorization, validation and order storage. Never put private admin passwords or secret API keys in Vite `VITE_*` variables or frontend code.

Cash on Delivery currently creates a local order confirmation only. Connect an API/database and an order notification workflow to receive orders in your business system.
