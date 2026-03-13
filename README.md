# Sky.ai

Sky.ai is a simple AI chatbot application that provides text responses for text input prompts. It features a modern web interface and a robust backend powered by Google's Generative AI.

## 🚀 Tech Stack

**Frontend (Client)**

* **Framework:** React 19 with Vite
* **Styling:** Tailwind CSS (v4)
* **Icons:** Lucide React
* **Language:** JavaScript/ES6+

**Backend (Server)**

* **Framework:** Express.js with Node.js
* **Language:** TypeScript
* **Database:** PostgreSQL
* **ORM:** Prisma
* **AI Integration:** Google GenAI SDK (`@google/genai`)
* **Authentication:** JWT (JSON Web Tokens) & Bcrypt

## 🗄️ Database Schema

The application uses PostgreSQL with the following core relational models:

* **User:** Stores user credentials (name, email, password) and links to their chats.
* **Chat:** Represents a chat session belonging to a user, containing multiple messages.
* **Message:** Represents individual messages within a chat. Includes a `Role` enum (`USER`, `ASSISTANT`, `SYSTEM`) and optional JSON metadata.

## ⚙️ Prerequisites

Before you begin, ensure you have the following installed:

* Node.js (v18 or higher recommended)
* PostgreSQL Database
* A Google Gemini API Key

## 🛠️ Installation & Setup

### 1. Clone the repository

```bash
git clone <repository-url>
cd sky-ai

```

### 2. Server Setup

Navigate to the server directory and install dependencies:

```bash
cd server
npm install

```

Set up your environment variables. Create a `.env` file in the `server` directory:

```env
PORT=3000
DATABASE_URL="postgresql://user:password@localhost:5432/sky_ai_db"
JWT_SECRET="your_jwt_secret"
GEMINI_API_KEY="your_google_genai_api_key"

```

Run Prisma migrations to set up your database schema:

```bash
npx prisma migrate dev

```

Start the backend development server:

```bash
npm run dev

```

### 3. Client Setup

Open a new terminal, navigate to the client directory, and install dependencies:

```bash
cd client
npm install

```

Start the frontend development server:

```bash
npm run dev

```

The application frontend will typically be available at `http://localhost:5173`.

## 🔌 API Routes

The backend Express server exposes the following main route prefixes:

* `/auth` - Authentication endpoints (Signup, Login, etc.)
* `/user` - User management and profile retrieval
* `/chat` - Chat session creation and retrieval
* `/message` - Handling individual messages within a chat

**CORS Configuration:** The API is configured to accept cross-origin requests from `http://localhost:5173` (local development) and `https://sky-ai-client.onrender.com` (production).
