#!/bin/bash

echo "🚀 Supabase Integration Setup"
echo "=============================="
echo ""

# Check if .env.local exists
if [ -f ".env.local" ]; then
    echo "✅ .env.local file exists"
else
    echo "📝 Creating .env.local file..."
    cat > .env.local << EOF
# Supabase Configuration
# Replace these with your actual Supabase project credentials
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Optional: For server-side operations
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
EOF
    echo "✅ Created .env.local file"
fi

echo ""
echo "📋 Next Steps:"
echo "1. Go to https://supabase.com and create a new project"
echo "2. Copy your project URL and anon key"
echo "3. Update the .env.local file with your actual credentials"
echo "4. Run 'npm run dev' to start the development server"
echo ""
echo "🔧 Optional OAuth Setup:"
echo "1. In Supabase dashboard, go to Authentication > Providers"
echo "2. Enable Google and/or Apple providers"
echo "3. Add redirect URLs:"
echo "   - http://localhost:3000 (development)"
echo "   - https://yourdomain.com (production)"
echo ""
echo "✨ Your Supabase integration is ready!"
