# Digital Brain - Second Mind App

> An AI-powered second brain and note-taking app built with React + Vite, powered by Google Gemini.

Digital Brain lets you capture, organize, and interact with your notes intelligently. Ask questions about your notes, get AI-generated summaries, and let Gemini help you think — all in a clean, fast interface.

---

## ✨ Features

- 📝 Create and manage notes in a second-brain style workspace
- 🤖 AI-powered insights and Q&A using Google Gemini
- ⚡ Blazing fast with Vite + React
- 🌐 Deployable on Netlify in minutes

---

## 🚀 Getting Started

### Prerequisites

Make sure you have the following installed:

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- npm (comes with Node.js)
- A **Google Gemini API key** — [get one free here](https://aistudio.google.com/app/apikey)

---

### 1. Clone the Repository

```bash
git clone https://github.com/TheVoidJulius/digital-brain.git
cd digital-brain
```

---

### 2. Install Dependencies

```bash
npm install
```

---

### 3. Set Up Your Environment Variables

Create a `.env` file in the root of the project:

```bash
touch .env
```

Then open it and add your Gemini API key:

```env
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

> ⚠️ **Important:** The variable name **must** start with `VITE_` for Vite to expose it to the frontend.

> 🔒 Never share or commit your `.env` file. It's already listed in `.gitignore` to keep your key safe.

---

### 4. Run the App Locally

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🌍 Deploying to Netlify

### Option A — Netlify Dashboard (Recommended for beginners)

1. Push your code to GitHub
2. Go to [netlify.com](https://netlify.com) → **Add new site** → **Import from Git**
3. Select your `digital-brain` repository
4. Use these build settings:

   | Field             | Value           |
   |-------------------|-----------------|
   | Base directory    | *(leave blank)* |
   | Build command     | `npm run build` |
   | Publish directory | `dist`          |

5. Go to **Site Settings → Environment Variables** and add:

   ```
   VITE_GEMINI_API_KEY = your_gemini_api_key_here
   ```

6. Click **Deploy Site** 🎉

### Option B — Netlify CLI

```bash
npm install -g netlify-cli
netlify login
netlify init
netlify deploy --prod
```

---

### Fix 404 on Page Refresh (React Router)

If you're using React Router, create a `_redirects` file inside the `public/` folder:

```
/*    /index.html    200
```

---

## 🔑 How to Get a Free Gemini API Key

1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Sign in with your Google account
3. Click **Create API Key**
4. Copy the key and paste it into your `.env` file as shown above

> The free tier is generous — perfect for personal use and projects.

---

## 📁 Project Structure

```
digital-brain/
├── public/
│   └── vite.svg
├── src/
│   └── ...           # React components, pages, logic
├── .env              # Your local API key (never commit this)
├── .gitignore
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

---

## 🛠️ Built With

- [React](https://react.dev/)
- [Vite](https://vitejs.dev/)
- [Google Gemini API](https://ai.google.dev/)

---

## 🤝 Contributing

Contributions are welcome! Feel free to open an issue or submit a pull request.

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m 'Add your feature'`
4. Push to the branch: `git push origin feature/your-feature`
5. Open a Pull Request

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

## 🙋 Author

Made with ❤️ by [TheVoidJulius](https://github.com/TheVoidJulius)

