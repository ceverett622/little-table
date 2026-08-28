# Little Table

A daycare meal planning app that tracks children's allergies and dietary restrictions.

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/ceverett622/little-table.git
cd little-table
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Then edit `.env.local` and add your Supabase credentials:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Development

Run the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:3000`

### Building for Production

```bash
npm run build
```

This will create an optimized build in the `dist` folder.

## Deployment

This project is configured for easy deployment on **Vercel**:

1. Push your code to GitHub (already done!)
2. Go to [vercel.com](https://vercel.com) and sign in with GitHub
3. Click "Add New" → "Project"
4. Select the `little-table` repository
5. Add your environment variables (VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY)
6. Click "Deploy"

Your site will be live at `https://little-table.vercel.app`

## Tech Stack

- **React** 18 - UI library
- **TanStack Router** - File-based routing
- **TanStack React Query** - Data fetching & caching
- **Supabase** - Backend & database
- **Vite** - Build tool
- **TypeScript** - Type safety

## License

MIT
