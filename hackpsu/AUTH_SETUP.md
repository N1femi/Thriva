# Authentication Setup

This project uses Supabase for authentication with support for:
- Email/Password authentication
- Google OAuth
- Apple OAuth

## Setup Instructions

1. **Create a Supabase Project**
   - Go to [supabase.com](https://supabase.com)
   - Create a new project
   - Note down your project URL and anon key

2. **Configure Environment Variables**
   - Copy `.env.local.example` to `.env.local`
   - Fill in your Supabase credentials:
     ```
     NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
     NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
     ```

3. **Configure OAuth Providers (Optional)**
   - In your Supabase dashboard, go to Authentication > Providers
   - Enable Google and/or Apple providers
   - Configure the OAuth credentials for each provider
   - Add your domain to the allowed redirect URLs

4. **Run the Application**
   ```bash
   npm run dev
   ```

## Features

- **Smooth Slider Animation**: Toggle between login and signup with smooth animations
- **Social Authentication**: One-click login with Google and Apple
- **Form Validation**: Built-in validation for email and password fields
- **Password Visibility Toggle**: Show/hide password functionality
- **Responsive Design**: Works on all device sizes
- **Toast Notifications**: User feedback for all actions

## Components Used

- `Card` - Main container for the auth form
- `Switch` - Toggle between login/signup modes
- `Button` - All interactive elements
- `Input` - Form input fields
- `Label` - Form labels
- `Separator` - Visual dividers
- `toast` - Notification system

All components are from the shadcn/ui registry for consistency and accessibility.
