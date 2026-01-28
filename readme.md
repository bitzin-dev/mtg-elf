# 🧝 PORTAL MTG ELF
### The Ultimate Magic: The Gathering Collection Manager

---

**View the hosted application: ** [Preview Click Here](https://colecaomtg.com)

## 🌟 Introduction

**Portal MTG ELF** is a high-performance, modern application designed for **Magic: The Gathering** collectors and players. It moves beyond simple spreadsheets to offer a visually immersive and data-rich experience for managing your cards, decks, and investments.

Whether you are a **Commander** veteran, a **Tribal** enthusiast (as our name suggests!), or a market speculator, Portal MTG ELF provides the tools you need to tame the chaos of your collection.

## 🎯 What Pain Does It Solve?

Collecting Magic is complex.
- **Spreadsheets are boring** and lack visual feedback.
- **Other apps are slow** when handling thousands of cards.
- **Tracking prices** across different versions (foils, promos) is a nightmare.
- **Building lists** for buying or proxy printing is often a manual, disconnected process.

**Portal MTG ELF was created to verify your inventory instantly.** It resolves these pains by integrating directly with **Scryfall**, providing real-time pricing, beautiful card imagery, and **non-blocking performance** even for massive collections.

---

## ✨ Key Features

### 📚 Advanced Collection Management
- **Smart Filtering**: Organize collections by **Tribal** (e.g., Elves, Goblins), **Set**, **Artist**, or Custom queries.
- **Massive Scale**: Optimized incremental loading allows you to manage collections with thousands of cards without freezing the UI.
- **Progress Tracking**: See exactly how many cards you own versus the total in a set.

### 💰 Financial Intelligence
- **Real-time Prices**: Automatic price fetching converted to your local currency (BRL/USD).
- **Collection Value**: Dashboard widgets showing total collection value and growth.

### 🖼️ Immersive Visuals
- **Binder View**: Browse your cards exactly like a physical binder.
- **Card Scanner**: (Experimental) Use your camera to identify cards.
- **High-Res Art**: Enjoy full-resolution card art from Scryfall.

### 🛠️ Utilities
- **Buy List**: Flag cards you need to acquire.
- **Print List**: Organize proxies for testing.
- **Saved Searches**: Keep track of complex Scryfall queries for future reference.

---

## 🚀 Tech Stack

Built with the fastest modern web technologies:

- **Backend**: [Bun](https://bun.sh) + [Hono](https://hono.dev) (Ultra-fast server)
- **Database**: [MongoDB](https://www.mongodb.com) (Flexible schema for complex card data)
- **Frontend**: [React](https://react.dev) + [Vite](https://vitejs.dev)
- **Styling**: [Tailwind CSS](https://tailwindcss.com) + [Lucide Icons](https://lucide.dev)
- **Data Source**: [Scryfall API](https://scryfall.com)

---

## 🛠️ Getting Started

We made it easy! You don't need to run multiple terminals manually.

### 📋 Prerequisites
1.  **[Bun](https://bun.sh)** (Backend Runtime)
2.  **[Node.js](https://nodejs.org)** (Frontend Runtime)
3.  **[MongoDB](https://www.mongodb.com)** (Database) - *Must be running!*

### ⚡ Quick Start (Automatic)

**1. Clone the repository**
```bash
git clone https://github.com/yourusername/portal-mtg-elf.git
cd portal-mtg-elf
```

**2. Run the Launcher**
This will automatically create the `.env` file, install dependencies, and start both servers.

- **Windows**: Double-click **`start.bat`**
- **Linux / Mac**: Run `./start.sh` (Remember to `chmod +x start.sh`)

**3. Access the App**
- Frontend: http://localhost:5173
- Backend: http://localhost:3000

---

### 🔧 Manual Setup (Optional)

If you prefer to run things manually:

1. **Backend**:
   ```bash
   cd backend
   bun install
   # Create .env file with: MONGODB_URI=mongodb://localhost:27017
   bun run dev
   ```

2. **Frontend**:
   ```bash
   cd front-end
   npm install
   npm run dev
   ```
---

## 📸 Screenshots

| Dashboard | Binder View |
|:---:|:---:|
| ![Dashboard](https://placehold.co/600x400/10b981/ffffff?text=Dashboard+Stats) | ![Binder](https://placehold.co/600x400/8b5cf6/ffffff?text=Binder+View) |

| Collection Manager | Search & Filters |
|:---:|:---:|
| ![Collection](https://placehold.co/600x400/0ea5e9/ffffff?text=Collection+Grid) | ![Search](https://placehold.co/600x400/f59e0b/ffffff?text=Advanced+Filters) |

---

## 📄 License

This project is distributed under a **Proprietary Source Available License** (Non-Commercial).

See the [LICENSE](license.md) file for details.

---

<p align="center">
  Made with 💚 and ✨ by <a href="mailto:bitzindev@proton.me">**bitzin-dev & toca do dev... digo toca do elfo**</a>
</p>
