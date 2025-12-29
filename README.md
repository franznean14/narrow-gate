# Covenant Tactical - Next.js Game

A cooperative tabletop game built with Next.js 15, React 18, and Tailwind CSS.

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

Dependencies are already installed. If you need to reinstall:

```bash
npm install
```

### Development

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the game.

### Build

Build for production:

```bash
npm run build
```

Start production server:

```bash
npm start
```

## Project Structure

```
narrow_gate/
├── app/
│   ├── layout.tsx      # Root layout
│   ├── page.tsx         # Main game component
│   └── globals.css      # Global styles with Tailwind
├── package.json         # Dependencies
├── next.config.js       # Next.js configuration
├── tailwind.config.js   # Tailwind CSS configuration
└── tsconfig.json        # TypeScript configuration
```

## Technologies

- **Next.js 15** - React framework with App Router
- **React 18** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Lucide React** - Icons

## Features

- Cooperative tabletop game mechanics
- Interactive map with nodes and connections
- Card-based gameplay
- Character selection and abilities
- Turn-based gameplay
- Responsive design

## License

Private project

