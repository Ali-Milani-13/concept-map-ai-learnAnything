# AI Concept Map Explorer

An enterprise-grade, interactive concept mapping application that leverages Large Language Models to instantly generate structured, hierarchical diagrams from text prompts. Built with Next.js and React Flow, this tool allows users to visually explore complex topics, dive deep into specific nodes with AI-generated explanations, and recursively generate sub-maps for granular learning.



https://github.com/user-attachments/assets/fff1a4a5-7347-4447-8dde-27dca7f7c36a


## ✨ Key Features

* **AI-Powered Diagramming:** Generates perfectly structured, one-to-many tree hierarchies based on any user prompt.
* **Recursive Sub-Mapping:** Click on any node to generate a nested, isolated sub-map to explore specific branches of a concept.
* **Deep-Dive Inspector:** Select nodes to fetch highly technical, AI-generated explanations cached directly into the map state.
* **Smart Auto-Layout:** Integrates Dagre to instantly untangle and format complex graphs with a single click.
* **Hybrid Storage (Local-First + Cloud Sync):** Maps are persisted to `localStorage` immediately, with seamless background synchronization to Supabase for authenticated users.
* **High-Fidelity Export:** Export any diagram, regardless of scale, as a clean, styled SVG.
* **Stateless Auth:** Secure, HTTP-only encrypted session management using Iron Session, decoupling authentication state from the UI.

## 🛠 Tech Stack

* **Framework:** Next.js (App Router)
* **Diagramming Engine:** React Flow (`@xyflow/react`)
* **Graph Layout Algorithm:** Dagre
* **Styling:** Tailwind CSS, Lucide React
* **AI Integration:** Groq SDK (OpenAI OSS Models)
* **Backend & Database:** Supabase
* **Session Management:** Iron Session

## 🏗 Architecture

This project strictly adheres to **Feature-Sliced Design (FSD)**, ensuring high cohesion and low coupling. Business logic, API calls, and state management are heavily encapsulated within strictly typed custom hooks, leaving components exclusively as pure, declarative UI.

### Directory Structure

~~~text
├── app/                  # Routing, layouts, and API endpoints ONLY
├── components/           # Shared, generic UI (e.g., ThemeToggle)
├── features/             # Domain-driven modules
│   ├── ai/               # AI prompt input and explanation logic
│   ├── auth/             # Login modals, session hooks, and auth actions
│   ├── history/          # LocalStorage sync and library sidebar
│   └── map/              # Orchestrator hooks, Dagre layout engines, pure canvas UI
├── lib/                  # Core configurations (Supabase client, Iron Session)
└── types/                # Global TypeScript interfaces
~~~

## 🚀 Getting Started

### Prerequisites
* Node.js 18.x or later
* A Supabase project
* A Groq API key (or equivalent OpenAI-compatible endpoint)

### 1. Clone the repository
~~~bash
git clone [https://github.com/yourusername/conceptmap-ai.git](https://github.com/yourusername/conceptmap-ai.git)
cd conceptmap-ai
~~~

### 2. Install dependencies
~~~bash
npm install
~~~


### 3. Run the Development Server
~~~bash
npm run dev
~~~
Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## 🤝 Contributing
Contributions, issues, and feature requests are welcome! 
If you are modifying the core mapping logic, please ensure that UI components remain pure and side-effects are extracted into the appropriate hook within the `features/map/hooks` directory to maintain FSD compliance.

## 📄 License
This project is licensed under the MIT License - see the LICENSE file for details.
