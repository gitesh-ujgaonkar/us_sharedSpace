# Us - For Couples Together

"Us" is a private, intimate digital space designed for couples to cherish memories, stay connected, and interact in a meaningful way. It emphasizes emotional connection through shared memory logs, daily reveals, and real-time presence indicators.

![Us App Banner](https://placehold.co/1200x400/ffe4e6/be123c?text=Us+App)

## ✨ Features

- **Private Rooms**: Create a secure, shared space just for you and your partner.
- **Memory Logging**: Capture moments with emotional context (Happy, Excited, Grateful, Loved, Peaceful).
- **Daily Reveal**: A gamified feature that surprises you with one cherished memory from your past every day.
- **Real-time Presence**: See when your partner is online in the room.
- **Nudges**: Send a playful, animated "nudge" (💛) to let your partner know you're thinking of them.
- **Emotional Tracking**: Memories are tagged with emotions, visualized with calming colors.

## 🛠️ Technology Stack

- **Frontend**: [Next.js 14](https://nextjs.org/) (App Router)
- **Language**: TypeScript
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/) / Radix UI
- **Backend & Database**: [Supabase](https://supabase.com/) (PostgreSQL)
- **Authentication**: Supabase Auth
- **Real-time**: Supabase Realtime (Presence & Subscriptions)

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- pnpm (recommended) or npm/yarn
- A Supabase project

### Installation

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/yourusername/us-app.git
    cd us-app
    ```

2.  **Install dependencies:**

    ```bash
    pnpm install
    # or
    npm install
    ```

3.  **Set up Environment Variables:**

    Create a `.env.local` file in the root directory and add your Supabase credentials:

    ```env
    NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
    ```

4.  **Run the development server:**

    ```bash
    pnpm dev
    # or
    npm run dev
    ```

    Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 🗂️ Project Structure

- `app/`: Next.js App Router pages and layouts.
    - `(auth)/`: Authentication routes.
    - `dashboard/`: Room management.
    - `room/[id]/`: The main interactive couple space.
- `components/`: Reusable UI components.
    - `ui/`: Base components (buttons, inputs, etc.).
    - `daily-memory-reveal.tsx`: Game logic for daily memories.
- `lib/`: Utilities and Supabase client configuration.

## 🤝 Contributing

This project is a personal space for couples, but contributions are welcome!

1.  Fork the repository.
2.  Create your feature branch (`git checkout -b feature/AmazingFeature`).
3.  Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4.  Push to the branch (`git push origin feature/AmazingFeature`).
5.  Open a Pull Request.

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

Made with ❤️ using Next.js and Supabase.
