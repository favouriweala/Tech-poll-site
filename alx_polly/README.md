# ALX Polly - Modern Polling Application

ALX Polly is a modern, full-stack polling application built with Next.js 15, React 19, and Supabase. Create, share, and participate in polls with real-time results and beautiful, responsive design.

## 🎯 Project Overview

ALX Polly provides a comprehensive polling platform where users can:
- **Create engaging polls** with multiple configuration options
- **Vote anonymously or with an account** on public polls  
- **Manage poll lifecycle** from creation to results analysis
- **View real-time statistics** with performance-optimized vote counting
- **Share polls** across different platforms and audiences

The application emphasizes **performance**, **security**, and **user experience** with enterprise-grade features like Row Level Security (RLS), optimized database queries, and responsive design that works seamlessly across all devices.

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

### 1. **Clone the repository**
```bash
git clone <repository-url>
cd Alx_polly/alx_polly
```

### 2. **Install dependencies**
```bash
pnpm install
```

### 3. **Supabase Configuration**

#### Create a Supabase Project
1. Go to [supabase.com](https://supabase.com) and create a new account
2. Create a new project
3. Wait for the project to be set up (usually takes 2-3 minutes)

#### Get your Supabase credentials
1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy the following values:
   - Project URL
   - Anon public key
   - Service role key (keep this secret!)

### 4. **Environment Variables Setup**
Create a `.env.local` file in the root directory and add your Supabase credentials:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here
```

⚠️ **Important**: Never commit the `.env.local` file. It's already in `.gitignore`.

### 5. **Database Setup**
1. In your Supabase dashboard, navigate to **SQL Editor**
2. Copy the contents of `supabase-schema.sql` from the project root
3. Paste and run the SQL script to create:
   - All necessary tables (profiles, polls, poll_options, votes)
   - Row Level Security (RLS) policies
   - Database functions and triggers
   - Performance indexes and views

### 6. **Run the Development Server**
```bash
pnpm dev
```

### 7. **Verify Setup**
1. Open [http://localhost:3000](http://localhost:3000)
2. You should see the ALX Polly homepage
3. Try registering a new account to test the authentication flow
4. Create a test poll to verify database connectivity

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

## 🚦 Usage Examples

### Creating Your First Poll

1. **Register and Login**
   ```
   • Visit http://localhost:3000
   • Click "Register" to create a new account
   • Verify your email (check spam folder if needed)
   • Login with your credentials
   ```

2. **Navigate to Poll Creation**
   ```
   • Click "Create Poll" in the navigation
   • Or visit /polls/new directly
   ```

3. **Fill Poll Details**
   ```
   Basic Info Tab:
   • Title: "What's your favorite programming language?"
   • Description: "Help us understand developer preferences"
   
   Options:
   • JavaScript
   • Python
   • TypeScript
   • Go
   • Rust
   ```

4. **Configure Settings**
   ```
   Settings Tab:
   • ✅ Allow multiple selections (for multi-choice polls)
   • ✅ Make poll public (for anyone to vote)
   • Set end date (optional): 7 days from now
   ```

5. **Create and Share**
   ```
   • Click "Create Poll"
   • Copy the poll URL to share with others
   • Access your poll dashboard to monitor results
   ```

### Voting on Polls

1. **Find Polls**
   ```
   • Browse public polls on the homepage
   • Use direct poll links shared by creators
   • Search through available polls
   ```

2. **Cast Your Vote**
   ```
   • Select your choice(s) - single or multiple based on poll settings
   • Click "Submit Vote"
   • View real-time results immediately
   • See vote percentages and statistics
   ```

3. **Anonymous Voting**
   ```
   • Voting works without an account for public polls
   • Anonymous votes are tracked by IP address
   • Results are still shown in real-time
   ```

### Managing Your Polls

1. **Dashboard Access**
   ```
   • Visit /dashboard after logging in
   • View statistics: total polls, votes received, active polls
   • See all your created polls in a grid layout
   ```

2. **Poll Management**
   ```
   • Edit poll details (title, description)
   • View detailed voting statistics
   • Delete polls you no longer need
   • Share poll links with custom messages
   ```

3. **Monitor Results**
   ```
   • Real-time vote counts and percentages
   • Unique voter statistics
   • Option popularity rankings
   • Time-based voting trends
   ```

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

## 🧪 Testing & Local Development

### Running the App Locally

1. **Development Server**
   ```bash
   # Start the development server with hot reloading
   pnpm dev
   
   # The app will be available at:
   # http://localhost:3000
   ```

2. **Building for Production**
   ```bash
   # Build the application
   pnpm build
   
   # Start production server
   pnpm start
   
   # Production app runs at:
   # http://localhost:3000
   ```

3. **Code Quality**
   ```bash
   # Run ESLint for code quality checks
   pnpm lint
   
   # Fix auto-fixable ESLint issues
   pnpm lint --fix
   ```

### Testing Features Manually

1. **Authentication Flow**
   ```bash
   • Test user registration with email verification
   • Test login/logout functionality
   • Test password reset flow
   • Verify protected routes redirect to login
   ```

2. **Poll Creation & Management**
   ```bash
   • Create polls with various configurations
   • Test single vs multiple choice settings
   • Test public vs private poll visibility
   • Test poll deletion and editing
   ```

3. **Voting System**
   ```bash
   • Vote on polls as authenticated user
   • Test anonymous voting functionality
   • Verify vote counting and statistics
   • Test voting restrictions (one vote per user)
   ```

4. **Performance Testing**
   ```bash
   • Create polls with many options (test UI handling)
   • Generate multiple votes (test vote calculation performance)
   • Test real-time updates and cache invalidation
   ```

### Database Testing

1. **Verify Database Connection**
   ```bash
   # Check Supabase connection in browser console
   # Should see successful auth and data queries
   ```

2. **Test RLS Policies**
   ```bash
   • Try accessing other users' private polls (should fail)
   • Verify users can only edit their own polls
   • Test anonymous voting permissions
   ```

### Automated Testing (Future Implementation)

```bash
# Unit tests (planned)
pnpm test

# Integration tests (planned)  
pnpm test:integration

# End-to-end tests (planned)
pnpm test:e2e

# Run all tests (planned)
pnpm test:all
```

### Troubleshooting

1. **Environment Issues**
   ```bash
   # Check if .env.local exists and has correct values
   # Verify Supabase credentials are valid
   # Ensure database schema is properly set up
   ```

2. **Database Issues**
   ```bash
   # Check Supabase dashboard for error logs
   # Verify RLS policies are active
   # Check if tables and functions exist
   ```

3. **Development Issues**
   ```bash
   # Clear Next.js cache
   rm -rf .next
   
   # Reinstall dependencies
   rm -rf node_modules package-lock.json
   pnpm install
   ```

## 📝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 🔗 Quick Reference

### Key URLs (Development)
- **Homepage**: `http://localhost:3000`
- **Login**: `http://localhost:3000/login`
- **Register**: `http://localhost:3000/register`
- **Create Poll**: `http://localhost:3000/polls/new`
- **Dashboard**: `http://localhost:3000/dashboard`
- **Public Polls**: `http://localhost:3000/polls`

### Key Files
- **Database Schema**: `supabase-schema.sql`
- **Environment Config**: `.env.local`
- **Main Actions**: `lib/actions.ts`
- **Auth Context**: `app/(auth)/context/authContext.tsx`
- **Performance Utils**: `lib/vote-utils.ts`

### Environment Variables
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### Essential Commands
```bash
pnpm install          # Install dependencies
pnpm dev              # Start development server
pnpm build            # Build for production
pnpm start            # Start production server
pnpm lint             # Run code quality checks
```

## 📄 License

This project is licensed under the MIT License.

## 📞 Support

For support and questions, please open an issue in the repository.

---

Built with ❤️ using Next.js, React, and Supabase.
