# CitiTraveler's Frontend

A modern travel booking platform built with React and Vite.

## Setup

1. Clone the repository:
```bash
git clone https://github.com/yourusername/cititravel_frontend.git
cd cititravel_frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with the following variables:
```env
VITE_API_URL="your backend url"  # Development API URL
```

4. Start the development server:
```bash
npm run dev
```

## Environment Variables

- `VITE_API_URL`: Backend API URL
  - Development: `http://localhost:3001`
  - Production: Your deployed API URL

## Deployment

This project is configured for deployment on Vercel.

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Deploy to Vercel:
```bash
vercel
```

3. Add environment variables in Vercel:
   - Go to your project settings in Vercel dashboard
   - Navigate to Environment Variables
   - Add `VITE_API_URL` with your production API URL

## Build

To create a production build:
```bash
npm run build
```

The build artifacts will be stored in the `dist/` directory.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Create production build
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint
