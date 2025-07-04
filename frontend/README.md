# 🚀 La Resistencia • Frontend

> **Clandestine Network Interface** - A cyberpunk social correspondence game built on Flow blockchain

## 🎮 Game Concept

In a dystopian future where **"El Conductor"** (The Conductor) - a benevolent AI - controls all human connections, you join **"La Resistencia"** (The Resistance) - a clandestine network of rebels who believe in authentic human bonds.

### 🔮 Core Features

- **🔗 Vínculo NFTs**: Each relationship becomes a unique, evolving NFT with generative art
- **📨 Delayed Messaging**: Strategic communication delays to avoid AI detection
- **🌳 Skill Trees**: Progress through Emisario (user), AI Counselor, and Bond skill trees
- **🎨 Generative Art**: Your relationships create unique glitch art that evolves
- **🎪 On-Chain Gifts**: Send real-world value through blockchain escrow

## 🛠️ Tech Stack

- **React 18** + **TypeScript** + **Vite**
- **Flow Blockchain** integration with **@onflow/fcl**
- **Framer Motion** for epic animations
- **Tailwind CSS** with custom cyberpunk theme
- **Zustand** for state management
- **Lucide React** for icons

## 🎨 Design System

### Color Palette
- **Glitch Primary**: `#00ff41` - Classic matrix green
- **Glitch Secondary**: `#ff0080` - Neon pink
- **Glitch Accent**: `#ffff00` - Electric yellow
- **Resistance**: Pink/magenta gradient
- **Cyber**: Blue gradient for tech elements
- **Dark**: Deep black backgrounds

### Typography
- **Orbitron**: Futuristic headers and titles
- **Fira Code**: Monospace for code and technical text

### Animations
- **Glitch effects** for emphasis
- **Matrix rain** background
- **Neon glow** effects
- **Typing animations** for narrative text

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd social-beta/frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

### Build for Production

```bash
# Build optimized production bundle
npm run build

# Preview production build
npm run preview
```

## 🏗️ Project Structure

```
frontend/
├── public/                 # Static assets
├── src/
│   ├── components/         # Reusable UI components
│   │   ├── Layout.tsx      # Main app layout
│   │   ├── MatrixRain.tsx  # Background effects
│   │   └── ...
│   ├── pages/              # Route components
│   │   ├── WelcomePage.tsx # Landing page
│   │   ├── LoginPage.tsx   # Authentication
│   │   ├── DashboardPage.tsx # Main dashboard
│   │   └── ...
│   ├── store/              # Zustand state management
│   │   ├── authStore.ts    # User authentication
│   │   ├── gameStore.ts    # Game state
│   │   └── ...
│   ├── hooks/              # Custom React hooks
│   ├── utils/              # Utility functions
│   ├── types/              # TypeScript definitions
│   └── styles/             # Global styles
├── tailwind.config.js      # Tailwind configuration
├── vite.config.ts          # Vite configuration
└── package.json
```

## 🎯 Key Components

### 🔐 Authentication Flow
- Flow wallet integration
- User registration with on-chain Emisario creation
- Persistent authentication state

### 📱 Main Interface
- **Dashboard**: Overview of your resistance activities
- **Messages**: Encrypted communication with delays
- **Vínculos**: Your relationship NFTs with evolving art
- **Skills**: Character progression trees
- **Library**: Published relationship stories

### 🎨 Visual Effects
- **Matrix Rain**: Animated background effect
- **Glitch Text**: Corrupted text animations
- **Neon Glows**: Cyberpunk lighting effects
- **Typing Effects**: Narrative text animations

## 🌐 Backend Integration

The frontend connects to the backend API at `http://localhost:8080` for:
- User registration and profile management
- Message storage and retrieval
- Transaction code generation
- AI-powered narrative generation

## 📡 Flow Blockchain Integration

### Smart Contracts
- **ClandestineNetwork**: Main game contract
- **SkillRegistry**: Character progression
- **Gifts**: On-chain value transfer

### Wallet Integration
- FCL (Flow Client Library) for wallet connection
- Transaction signing for game actions
- NFT management for Vínculos

## 🎭 Narrative Integration

The UI seamlessly blends the cyberpunk resistance narrative:
- **Spanish lore text** (El Conductor, La Resistencia)
- **English code/UI** (developer-friendly)
- **Glitch aesthetics** (corrupted AI theme)
- **Underground feel** (secret network vibes)

## 🔧 Development

### Environment Variables
Create a `.env` file:
```
VITE_BACKEND_URL=http://localhost:8080
VITE_FLOW_NETWORK=testnet
```

### Useful Commands
```bash
# Development
npm run dev          # Start dev server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint

# Flow integration
npm run flow:dev     # Connect to Flow testnet
npm run flow:deploy  # Deploy contracts (if applicable)
```

## 🎨 Customization

### Tailwind Theme
Edit `tailwind.config.js` to customize:
- Color palettes
- Animations
- Typography
- Spacing

### Components
All components use:
- Tailwind classes for styling
- Framer Motion for animations
- TypeScript for type safety

## 🚀 Deployment

### Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Other Platforms
- **Netlify**: Drag & drop `dist` folder
- **GitHub Pages**: Use `gh-pages` package
- **Self-hosted**: Serve `dist` folder

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Follow the cyberpunk aesthetic
4. Keep Spanish lore, English code
5. Add epic animations
6. Submit a pull request

## 📝 License

This project is part of the **La Resistencia** ecosystem - a blockchain-based social game exploring human connection in an AI-dominated world.

---

**"En un mundo controlado por la IA, los vínculos humanos son actos de rebeldía."**

*Join the resistance. Forge real bonds. Create digital art from your defiance.* 