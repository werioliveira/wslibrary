# WSLibrary WEB Documentation
## Overview
WSLibrary is a Next.js application that helps users manage and track their manga reading progress. It features manga tracking, status management, and integration with various manga sources.

## Tech Stack
- Next.js 14 (App Router)
- TypeScript
- Prisma (Database ORM)
- NextAuth.js (Authentication)
- TailwindCSS (Styling)
- AWS S3/MinIO (Image Storage)
## Authentication
The application uses NextAuth.js with Google OAuth for authentication. Mobile authentication is handled separately with JWT tokens.

### Auth Routes
- /api/auth/[...nextauth] - Main authentication endpoint
- /api/auth/mobile-login - Mobile-specific login endpoint
- /api/auth/mobile-login/session - Mobile session validation
## Main Features
### 1. Manga Management
Users can:

- Add new manga to their collection
- Track reading progress
- Update reading status
- Search through their collection
- Manage reading status (Reading, Plan to Read, Dropped, Completed)
### 2. API Routes Manga Management
- POST /api/manga - Add new manga
- GET /api/manga - Get user's manga collection with filters
  - Query params: userId, page, limit, status, name External Sources Integration
The application scrapes various manga sources:

- /api/mangas/sussy - Sussy Toons
- /api/mangas/mangaLivre - Manga Livre
- /api/mangas/lermangas - Ler Mangás
- /api/mangas/imperio - Imperio
- /api/mangas/slimer - Slime Read
- /api/mangas/ego - Ego Toons
- /api/mangas/lunar - Lunar Scan
- /api/mangas/yushuke - Yushuke Mangas
- /api/mangas/seitacelestial - Seita Celestial User Settings
- PUT /api/discord-id - Update user's Discord ID
- PUT /api/save-push-token - Save push notification token
## Frontend Components
### Main Components
- <MangaContainer /> - Displays manga collection with filtering
- <MangaCard /> - Individual manga display card
- <AddMangaButton /> - Button to add new manga
- <Navbar /> - Navigation component
- <Pagination /> - Handles manga list pagination
### Pages
- / - Home page with manga collection
- /profile - User profile management
- /manga/[id] - Individual manga details
## Environment Variables Required
```plaintext
NEXT_PUBLIC_BASE_URL=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
AUTH_SECRET=
DATABASE_URL=
MINIO_ENDPOINT=
MINIO_ACCESS_KEY=
MINIO_SECRET_KEY=
 ```

## Mobile Integration
The application supports mobile access through:

- Custom mobile login endpoints
- Push notification support
- APK download available through floating button
## Status Management
Manga can be categorized into four statuses:

- Lendo (Reading)
- Pretendo Ler (Plan to Read)
- Dropado (Dropped)
- Concluido (Completed)
## Search and Filtering
Users can:

- Search manga by name
- Filter by reading status
- Navigate through paginated results
## Image Management
- Images are stored in MinIO/S3
- Supports base64 image uploads
- Automatically generates unique image keys
## Error Handling
The application implements comprehensive error handling:

- API error responses
- Client-side error states
- Loading states with skeletons
- Authentication error management
## Security Features
- Protected API routes
- Session management
- Token-based authentication for mobile
- Secure image upload handling

## Development Setup
1. Install dependencies:
```bash
npm install
 ```

2. Set up environment variables (as listed in Environment Variables section)
3. Run database migrations:
```bash
npx prisma generate
npx prisma db push
 ```

4. Start development server:
```bash
npm run dev
 ```
This documentation provides an overview of the main features and architecture of the WSLibrary application. For specific implementation details, refer to the individual component and API route files.