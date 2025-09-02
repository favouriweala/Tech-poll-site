# ALX Polly - Modern Polling Application

ALX Polly is a modern, full-stack polling application built with Next.js 15, React 19, and Supabase. Create, share, and participate in polls with real-time results and beautiful, responsive design.

## ✨ Features

- 🔐 **Secure Authentication** - User registration, login, and password reset
- 📊 **Poll Creation** - Create polls with multiple options and custom settings
- 🗳️ **Flexible Voting** - Support for single or multiple choice polls
- 🌐 **Public & Private Polls** - Control poll visibility and access
- ⏰ **Time-Limited Polls** - Set expiration dates for polls
- 📱 **Responsive Design** - Beautiful UI that works on all devices
- 🔒 **Anonymous Voting** - Option for anonymous participation
- 📈 **Real-time Results** - Live poll results and statistics
- 🛡️ **Security First** - Row Level Security (RLS) and data protection

## 🚀 Technology Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Backend**: Supabase (PostgreSQL, Authentication, Real-time)
- **Styling**: Tailwind CSS 4.0
- **Package Manager**: pnpm
- **Database**: PostgreSQL via Supabase
- **Authentication**: Supabase Auth

## 📋 Prerequisites

- Node.js 18+ 
- pnpm (recommended package manager)
- Supabase account and project

## 🛠️ Installation & Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Alx_polly/alx_polly
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   ```

4. **Set up the database**
   - Go to your Supabase project dashboard
   - Navigate to the SQL Editor
   - Run the SQL script from `supabase-schema.sql` to create all necessary tables and policies

5. **Run the development server**
   ```bash
   pnpm dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🗃️ Database Schema

The application uses a robust PostgreSQL schema with the following main tables:

- **profiles** - Extended user information and settings
- **polls** - Main poll data with configuration options
- **poll_options** - Individual choices for each poll
- **votes** - User votes with support for anonymous voting

Key features:
- Row Level Security (RLS) for data protection
- Performance-optimized indexes
- Support for both authenticated and anonymous voting
- Flexible poll configurations

## 📁 Project Structure

```
alx_polly/
├── app/                    # Next.js app directory
│   ├── (auth)/            # Authentication routes
│   ├── (polls)/           # Poll-related routes
│   ├── api/               # API endpoints
│   └── auth/              # Auth utilities
├── components/            # Reusable UI components
├── lib/                   # Utility libraries and configurations
├── public/                # Static assets
└── supabase-schema.sql    # Database schema
```

## 🔧 Available Scripts

```bash
# Development
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm start        # Start production server
pnpm lint         # Run ESLint
```

## 🚦 Usage

### Creating a Poll
1. Register or log in to your account
2. Navigate to "Create Poll"
3. Fill in poll details:
   - Title and description
   - Poll options
   - Settings (multiple choice, public/private, end date)
4. Submit to create your poll

### Voting on Polls
1. Browse available public polls
2. Click on a poll to view details
3. Select your choice(s)
4. Submit your vote
5. View real-time results

### Managing Polls
- View all your created polls in your profile
- Edit poll settings (if no votes yet)
- Monitor poll statistics and results
- Share polls with others

## 🔐 Authentication

The app supports:
- Email/password registration and login
- Password reset functionality
- Protected routes for authenticated users
- Profile management

## 🌐 Deployment

### Vercel (Recommended)
1. Connect your repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Other Platforms
The app can be deployed on any platform that supports Next.js applications.

## 🧪 Testing

```bash
# Run tests (when implemented)
pnpm test

# Run E2E tests (when implemented)
pnpm test:e2e
```

## 📝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 📞 Support

For support and questions, please open an issue in the repository.

---

Built with ❤️ using Next.js, React, and Supabase.
