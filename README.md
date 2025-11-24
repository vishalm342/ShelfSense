# ShelfSense

An intelligent book management and recommendation platform that helps users organize their reading library, track reading progress, and discover new books through AI-powered recommendations.

## Purpose

ShelfSense simplifies book collection management by providing a centralized platform where users can:
- Search and add books from Google Books API
- Organize books by reading status (Want to Read, Currently Reading, Read)
- Track reading statistics and progress
- Get personalized book recommendations
- Maintain a digital library accessible anywhere

## Tech Stack

### Frontend
- **React 19** - UI framework
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing
- **Zustand** - State management
- **Tailwind CSS** - Styling
- **Axios** - HTTP client
- **Lucide React** - Icons

### Backend
- **Node.js** - Runtime environment
- **Express** - Web framework
- **PostgreSQL** - Database
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **express-validator** - Input validation

### APIs
- **Google Books API** - Book data and search

## Setup

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL (v14 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/ShelfSense.git
cd ShelfSense
```

2. **Setup Backend**
```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory:
```env
NODE_ENV=development
PORT=8000

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=shelfsense
DB_USER=your_db_user
DB_PASSWORD=your_db_password

# JWT
JWT_SECRET=your_super_secret_jwt_key_change_in_production
JWT_EXPIRES_IN=7d

# CORS
FRONTEND_URL=http://localhost:5173
```

3. **Setup Database**
```bash
# Create PostgreSQL database
createdb shelfsense

# Run database initialization
npm run init-db
```

4. **Setup Frontend**
```bash
cd ../frontend
npm install
```

Create a `.env` file in the `frontend` directory:
```env
VITE_API_URL=http://localhost:8000/api
```

5. **Start Development Servers**

Terminal 1 (Backend):
```bash
cd backend
npm run dev
```

Terminal 2 (Frontend):
```bash
cd frontend
npm run dev
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000

## Features

- User authentication (signup/login)
- Book search via Google Books API
- Add books to personal library
- Organize books by reading status
- Update book status and remove books
- Dashboard with reading statistics
- Filter library by reading status
- Responsive design for all devices

## Project Structure

```
ShelfSense/
├── backend/
│   ├── config/          # Database configuration
│   ├── database/        # Database schema and migrations
│   ├── middleware/      # Express middleware
│   ├── models/          # Database models
│   ├── routes/          # API routes
│   └── server.js        # Express server entry point
├── frontend/
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── pages/       # Page components
│   │   ├── services/    # API services
│   │   ├── store/       # Zustand state management
│   │   └── main.jsx     # React entry point
│   └── public/          # Static assets
└── README.md
```

## Contact

For questions, feedback, or support:

- **Email**: vishalm8656@gmail.com
- **GitHub**: [@yourusername](https://github.com/vishalm342)
- **Issues**: [Report a bug](https://github.com/yourusername/ShelfSense/issues)

## License

MIT License

Copyright (c) 2025 ShelfSense

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
