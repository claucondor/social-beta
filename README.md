# Social Beta - Resistance Network

A revolutionary social media platform built on blockchain technology, featuring a resistance-themed narrative with skill trees, NFT bonds, and clandestine networking.

## 🎯 Project Overview

Social Beta is a decentralized social media platform that combines traditional social networking with blockchain-based gamification. The platform features a unique resistance narrative where users become "Emisarios" (emissaries) who forge bonds, develop skills, and participate in clandestine operations.

## 🏗️ Architecture

### Core Components

- **Backend**: Server-side logic and API endpoints
- **Resistance**: Blockchain smart contracts and transactions (Flow blockchain)
- **Design**: Project documentation and design specifications

### Key Features

- **Skill Trees & Progression**: Users can unlock and develop various skills
- **NFT Bond System**: Forge digital bonds with other users
- **Gift Economy**: Exchange gifts and build relationships
- **Clandestine Network**: Private communication channels
- **Monetization Model**: Sustainable economic incentives

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- Flow CLI
- Git

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/social-beta.git
cd social-beta
```

2. Install dependencies:
```bash
# Backend dependencies
cd backend
npm install

# Flow blockchain setup
cd ../resistance
flow setup
```

3. Configure environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

## 📁 Project Structure

```
social-beta/
├── backend/           # Server-side application
├── design/            # Project documentation
│   ├── LORE_AND_NARRATIVE.md
│   ├── MONETIZATION_MODEL.md
│   ├── PROJECT_CODEX.md
│   ├── SKILL_TREES_AND_PROGRESSION.md
│   ├── SOCIAL_AND_ONCHAIN_INTERACTIONS.md
│   └── VINCULO_NFT_SYSTEM.md
└── resistance/        # Blockchain contracts
    ├── contracts/     # Smart contracts
    ├── scripts/       # Read operations
    └── transactions/  # Write operations
```

## 🔧 Development

### Smart Contracts

The project uses Flow blockchain with Cadence smart contracts:

- **ClandestineNetwork.cdc**: Core networking functionality
- **Gifts.cdc**: Gift exchange system
- **SkillRegistry.cdc**: Skill management

### Backend Development

```bash
cd backend
npm run dev
```

### Blockchain Operations

```bash
cd resistance
# Deploy contracts
flow deploy

# Run scripts
flow scripts execute scripts/get_user_bonds.cdc

# Execute transactions
flow transactions send transactions/forge_bond.cdc
```

## 📚 Documentation

Detailed documentation is available in the `design/` directory:

- [Project Codex](design/PROJECT_CODEX.md) - Core project principles
- [Lore & Narrative](design/LORE_AND_NARRATIVE.md) - Story and world-building
- [Skill Trees & Progression](design/SKILL_TREES_AND_PROGRESSION.md) - User progression system
- [Vinculo NFT System](design/VINCULO_NFT_SYSTEM.md) - Bond mechanics
- [Social & Onchain Interactions](design/SOCIAL_AND_ONCHAIN_INTERACTIONS.md) - Social features
- [Monetization Model](design/MONETIZATION_MODEL.md) - Economic design

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in this repository
- Join our community discussions
- Check the documentation in the `design/` directory

## 🔮 Roadmap

- [ ] Frontend application development
- [ ] Mobile app
- [ ] Advanced skill tree features
- [ ] Enhanced gift economy
- [ ] Community governance tools
- [ ] Cross-chain integrations

---

**Join the resistance. Forge your bonds. Build the future.** 