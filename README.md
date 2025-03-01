# Pictoria AI - Personalized AI Photo Generation Platform

Transform your photos with the power of AI! Pictoria AI is your ultimate solution for creating/generating professional AI-generated photos, similar to the popular PhotoAI platform. Perfect for LinkedIn headshots, Instagram content, dating profile pictures, and professional portraits. Train AI model on your personal images and generate stunning, high-quality AI-generated photos within minutes.

[![Watch Tutorial Video](https://img.shields.io/badge/Watch-Tutorial%20Video-red)](https://www.youtube.com/watch?v=7AQNeii5K7E)
[![GitHub Stars](https://img.shields.io/github/stars/codebucks27/Pictoria-AI-Starter-Code?style=social)](https://github.com/codebucks27/Pictoria-AI-Starter-Code)

🎯 For customised solutions or deployment please contact: https://tally.so/r/wdlj0N

> NOTE: This is a final version of the project. Before you make it live, please make sure to test it thoroughly and make any necessary adjustments.

## 🚀 Key Features  

- 🛠️ Complete SaaS built in modern Next.js
- 💻 Beautiful landing page included
- 🤖 Train AI model on your personal images
- 🖥️ Clean & intuitive event monitoring dashboard
- 🎯 AI-Powered Professional Photo Generation
- 🎨 Custom AI Model Training
- 💼 Professional LinkedIn Headshots
- 🌟 Clean, modern UI on top of shadcn-ui
- 📱 Social Media Content Generation
- 💳 Integrated Payment System
- ✉️ Email Notifications
- 📊 Usage Analytics
- 🎁 ...much more

## 🛠️ Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Styling:** Tailwind CSS, Shadcn UI
- **Database:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth
- **AI Integration:** Replicate AI API
- **Payment Processing:** Stripe
- **Email Service:** Resend
- **Language:** TypeScript

## ⚡ Prerequisites

Before you begin, ensure you have:

- Node.js installed (v20.x recommended, v18+ supported) 
- A Supabase account
- A Replicate account
- A Stripe account
- A Resend account

## 🚀 Setup Instructions

### 1. Clone the Repository

```bash
cd Pictoria-AI # change to your project directory
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
```

### 3. Environment Variables

Create a `.env.local` file in the root directory. Check `.env.example` for required variables.

### 4. Supabase Database Setup

1. Create a new Supabase project
2. Create a new storage bucket named `generated_images`
3. Execute the SQL queries from `supabase-queries.md` in your Supabase SQL editor (You can also follow the tutorial video to setup the database)
4. Set up the database triggers and functions
5. Make sure to setup the right RLS policies (You can also follow the tutorial video to setup the RLS policies)

### 5. AI Image Generation Models

Visit these links to set up your AI image generation:
- [Flux Dev Model](https://replicate.com/black-forest-labs/flux-dev)
- [Flux Schnell Model](https://replicate.com/black-forest-labs/flux-schnell)

For stock images, I have used [Lummi AI](https://www.lummi.ai/)

### 6. Stripe Setup

Watch our detailed video tutorial for Stripe integration setup: [Stripe Setup Tutorial](https://www.youtube.com/watch?v=7AQNeii5K7E&t=27960s)

### 7. Start Development Server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Visit `http://localhost:3000` to see your app.

## 📦 Project Structure

```
├── app/                 # Next.js 15 app directory
├── components/         # React components
├── lib/               # Utility, Supabase & Stripe functions
├── public/            # Static assets
└── globals.css            # Global styles
```

## 💰 Pricing Plans

- **Hobby**: 100 images/month
- **Pro**: 300 images/month
- **Enterprise**: Unlimited images

## 📝 License

Please check the LICENSE file for details.

## 🎥 Tutorial Video

For a complete setup walkthrough, check out our [video tutorial](https://youtu.be/7AQNeii5K7E).

## 🌟 Show Your Support

Give a ⭐️ if this project helped you!

If you have any question or want a custom build for your business, you can reach out to me via:

- E-mail : codebucks27@gmail.com
- Twitter: https://twitter.com/code_bucks
- Instagram: https://www.instagram.com/code.bucks/

MyChannel: https://www.youtube.com/codebucks
My Website: https://devdreaming.com/
