# 📚 Onlibry — Online Library  
### Educational Full-Stack Project

**Onlibry** is an educational full-stack web application that simulates an online library system.  
The project was developed to practice backend development with **Django**, REST API design, and frontend development using **React**.

> ⚠️ **Disclaimer**  
> This project was created **strictly for educational purposes**.  
> It is **not intended for commercial use**, public content distribution, or providing access to copyrighted materials.

---

## 🎯 Project Goals

- Learn backend development using **Django REST Framework**
- Design and implement a **RESTful API**
- Build a **Single Page Application (SPA)** with React
- Connect frontend and backend via HTTP requests
- Implement authentication and user-specific features
- Understand real-world client–server architecture

---

## 🧩 Features

### 👤 User System
- JWT-based authentication
- Guest mode with limited access

### 📚 Book Catalog
- Browse all books (Discover)
- Search by title, author, or description
- Filter books by genre
- View detailed book information

### ⭐ User Interactions
- Add / remove books from **Favorites**
- Add books to **To Read**
- Mark books as **Reading now**
- Leave reviews and ratings (1–5)

### 🔍 Filters
- **Top rated** — books with high average ratings
- **New arrivals** — books added within the last 7 days
- **By genre** — filter books by selected genre

---

## 🏗 Project Architecture

The application follows a classic **client–server architecture**.

---

## 🔌 REST API Usage

### Where REST is used

REST is used to **connect the frontend and backend**.

The frontend never accesses the database directly.  
All data exchange happens through **HTTP requests**:

- `GET /api/books/` — list of books
- `GET /api/books/{id}/` — book details
- `POST /api/favorites/` — add to favorites
- `DELETE /api/favorites/{id}/` — remove from favorites
- `POST /api/reviews/` — submit a review
- `GET /api/genres/` — list of genres
- `POST /api/auth/token/` — authentication (JWT)

HTTP methods used:
- **GET** — retrieve data
- **POST** — create new data
- **PATCH** — update data
- **DELETE** — remove data

---

## 📄 API Documentation (Swagger)

API documentation is generated automatically using **Swagger / OpenAPI**.

- Available at:  
  **`/api/docs/`**
- Displays all endpoints, request formats, and responses
- Used for testing and understanding the API structure

---

## 🧠 Technologies Used

### Backend
- Python 3.9
- Django
- Django REST Framework
- JWT Authentication
- SQLite (educational use)
- Swagger (drf-spectacular)

### Frontend
- JavaScript (ES6+)
- React
- Vite
- Axios
- HTML / CSS

---

## 🔄 React `useEffect`

`useEffect()` hooks are used to:
- Load data on application startup
- Fetch books, genres, favorites, and user-related data
- React to authentication state changes
- Keep frontend state synchronized with the backend

Example:
```js
useEffect(() => {
  api.get('books/').then(res => setBooks(res.data))
}, [])
