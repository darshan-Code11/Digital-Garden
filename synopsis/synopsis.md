# 🌿 PROJECT SYNOPSIS

---

## Project Title: Digital Garden Journal

**Application Name:** DailyGarden  
**Type:** Full-Stack Web Application  
**Version:** 1.0.0  
**Repository:** [darshan-Code11/Digital-Garden](https://github.com/darshan-Code11/Digital-Garden)  
**Date:** April 2026

---

## Objective

The primary objective of the **Digital Garden Journal** project is to develop an intelligent, all-in-one digital platform that empowers gardeners — hobbyists and professionals alike — to efficiently manage, monitor, and nurture their plants. The application bridges the gap between modern technology and traditional gardening by integrating Artificial Intelligence, smart reminders, secure payments, and a gardening marketplace into a single, seamless web experience.

The goal is to eliminate guesswork from plant care by providing AI-driven disease diagnosis, personalized watering reminders, and real-time growth tracking, all accessible from any device via a responsive, modern web interface.

---

## Introduction

Gardening is both an art and a science. While millions of people across the world cultivate plants, many face challenges in identifying plant diseases early, maintaining consistent watering schedules, or managing multiple plants across different garden spaces. The lack of a centralized, intelligent tool often leads to poor plant health, crop failure, or costly mistakes.

**DailyGarden – Digital Garden Journal** is a web-based solution designed to address these pain points. Built on a Node.js/Express backend coupled with a MongoDB database, the application offers a rich, single-page frontend built with Vanilla HTML5 and CSS3. It harnesses cutting-edge AI technologies — including HuggingFace's MobileNetV2 machine learning model and Anthropic's Claude Vision API — to analyze leaf images and detect plant diseases with clinical accuracy across 38 different disease classes.

Beyond disease detection, the platform integrates Google OAuth for secure authentication, Razorpay for in-app purchases and subscriptions, and Twilio's SMS service for automated watering reminders — making it a truly comprehensive gardening companion.

---

## Project Scope

The Digital Garden Journal covers the following domains:

1. **Personal Garden Management** — Tracking individual plants, their growth stages, and garden assignments.
2. **AI-Powered Plant Healthcare** — Automated diagnosis of plant diseases using machine learning and computer vision.
3. **Smart Notification System** — Time-based SMS watering reminders dispatched via Twilio.
4. **E-Commerce & Marketplace** — A built-in marketplace for purchasing gardening products with integrated payment processing.
5. **User Authentication & Profiles** — Secure sign-in via Google OAuth 2.0 with persistent session management.
6. **Community & Learning** — Gardening tips, how-to guides, community posts, and a harvest tracker.
7. **Subscription Plans** — Premium gardening features accessible via a subscription model.

**Out of Scope (Current Version):**
- Native mobile application (iOS/Android)
- Multi-language support
- IoT sensor integration for real-time soil monitoring

---

## Key Features

### 🤖 1. AI Disease Detection
- Users can upload a photo of any plant leaf directly from their device.
- The system first queries the **HuggingFace MobileNetV2** model (trained on 54,000+ PlantVillage images) for rapid ML-based classification.
- The result is matched against a built-in database of **38 plant disease classes** covering Tomato, Potato, Pepper, Corn, Apple, Grape, Strawberry, Cherry, Peach, Blueberry, Raspberry, Soybean, Squash, and Orange.
- Each diagnosis includes: disease name, confidence score, urgency level (🟢 low / 🟡 medium / 🔴 high / 🚨 critical), scientific description, and step-by-step treatment instructions.
- If the ML model fails or returns an unknown label, the system automatically **falls back to Claude-3.5 Vision API** for intelligent analysis.

### 📅 2. Smart Watering Reminders
- Users can configure a watering schedule per plant (frequency in days + preferred reminder time).
- A **Node-Cron background job** runs every minute on the server, evaluating which plants are due for watering.
- **Twilio SMS** notifications are dispatched automatically to the user's registered phone number.
- The system intelligently avoids duplicate reminders by tracking `lastWatered` timestamps.

### 🔐 3. Google OAuth Authentication
- Secure, one-click sign-in via **Google OAuth 2.0** (Passport.js).
- User profiles (name, email, avatar, phone) are persisted in MongoDB.
- Session management ensures users remain logged in across page refreshes.
- Non-Google users can register with email/password; sessions are synced to the backend.

### 💳 4. Razorpay Payment Integration
- Full **Razorpay payment gateway** integration supporting multiple payment methods.
- Supports: Credit/Debit Cards, UPI, Net Banking, Mobile Wallets.
- Marketplace purchases and premium subscription plans are processed securely.
- Order history is saved in MongoDB and accessible from the user's profile.

### 🌱 5. Garden & Plant Management
- Users can add, edit, and delete plants with rich metadata: name, variety, growth stage, emoji icon, color theme, garden (e.g., "Balcony Garden"), notes, and days since planting.
- Visual **progress bars** display growth from Seed → Sprout → Seedling → Vegetative → Flowering → Fruit → Harvest.
- Plants are organized into **named gardens**, allowing multi-garden tracking.
- All plant data is synchronized with MongoDB; changes persist across sessions and devices.

### 📈 6. Real-Time Progress Tracking
- A visual dashboard displays growth statistics across all gardens.
- Users can mark plants as watered, reset progress, and log notes directly from the plant detail view.
- A **timeline view** tracks key milestones in a plant's life cycle.

### 🛒 7. Gardening Marketplace
- A built-in e-commerce section features gardening products (seeds, tools, fertilizers, planters).
- Products include images, descriptions, ratings, prices, and discount information.
- Users can add items to cart, adjust quantities, apply sale codes, and complete checkout via Razorpay.
- A **wishlist** feature allows users to save favorite products.

### 🌐 8. Community & Tips
- A **community feed** where gardeners can share posts and interact (like, comment).
- A curated **gardening tips library** covering planting, watering, pest control, and harvesting.
- Detailed **how-to guides** accessible from the Tips page.

---

## System Requirements

### Hardware Requirements
| Component | Minimum | Recommended |
|-----------|---------|-------------|
| Processor | Dual-core 1.5 GHz | Quad-core 2.5 GHz+ |
| RAM | 2 GB | 4 GB+ |
| Storage | 500 MB (server) | 1 GB+ |
| Network | Stable broadband | High-speed internet |

### Software Requirements
| Component | Specification |
|-----------|--------------|
| **Runtime** | Node.js v16.x or higher |
| **Database** | MongoDB Atlas (cloud) or MongoDB v5+ (local) |
| **Operating System** | Windows 10/11, macOS, or Linux |
| **Browser** | Chrome 90+, Firefox 85+, Edge 90+, Safari 14+ |

### API & Service Dependencies
| Service | Purpose |
|---------|---------|
| **MongoDB Atlas** | Cloud database for users, plants, and orders |
| **Google OAuth 2.0** | User authentication and profile management |
| **HuggingFace API** | MobileNetV2 plant disease ML model inference |
| **Anthropic Claude API** | Vision-based AI fallback for disease detection |
| **Razorpay API** | Payment gateway for marketplace and subscriptions |
| **Twilio API** | SMS delivery for plant watering reminders |

### Environment Variables Required
```env
PORT=5000
MONGO_URI=<MongoDB connection string>
SESSION_SECRET=<random secret key>
GOOGLE_CLIENT_ID=<Google OAuth Client ID>
GOOGLE_CLIENT_SECRET=<Google OAuth Client Secret>
RAZORPAY_KEY_ID=<Razorpay Public Key>
RAZORPAY_KEY_SECRET=<Razorpay Secret Key>
TWILIO_ACCOUNT_SID=<Twilio Account SID>
TWILIO_AUTH_TOKEN=<Twilio Auth Token>
TWILIO_PHONE_NUMBER=<Twilio Sender Number>
HF_API_KEY=<HuggingFace API Key>
ANTHROPIC_API_KEY=<Anthropic API Key>
```

---

## Working Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER (Browser)                           │
│                  Visits http://localhost:5000                    │
└────────────────────────────┬────────────────────────────────────┘
                             │ HTTP Request
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Express.js Server (server.js)                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐ │
│  │  Auth Layer │  │  API Routes │  │  Static File Serving    │ │
│  │  (Passport) │  │  (REST API) │  │  (index.html)           │ │
│  └──────┬──────┘  └──────┬──────┘  └─────────────────────────┘ │
│         │                │                                       │
└─────────┼────────────────┼───────────────────────────────────────┘
          │                │
    ┌─────▼─────┐   ┌──────▼──────────────────────────┐
    │  Google   │   │         MongoDB (Mongoose)        │
    │  OAuth    │   │  ┌──────────┐ ┌───────┐ ┌──────┐│
    │  2.0      │   │  │  Users   │ │Plants │ │Orders││
    └───────────┘   │  └──────────┘ └───────┘ └──────┘│
                    └─────────────────────────────────┘
                             │
              ┌──────────────┼──────────────┐
              │              │              │
     ┌────────▼────┐  ┌──────▼──────┐  ┌───▼─────────┐
     │ HuggingFace │  │   Razorpay  │  │   Twilio    │
     │  ML Model   │  │  Payments   │  │ SMS Alerts  │
     │(MobileNetV2)│  │  Gateway    │  │ (node-cron) │
     └─────────────┘  └─────────────┘  └─────────────┘
              │
     ┌────────▼────────┐
     │  Claude Vision  │
     │  (API Fallback) │
     └─────────────────┘
```

### Detailed User Flow

1. **Landing & Authentication**
   - User visits the application → served the single-page `index.html`.
   - User clicks **Sign in with Google** → redirected to Google OAuth consent screen.
   - On success, Passport.js creates/fetches the user in MongoDB and establishes a session.
   - User's profile (name, avatar) is displayed in the navigation bar.

2. **Plant Management**
   - User navigates to **My Plants** → sees all plants fetched from `/api/plants`.
   - User clicks **Add Plant** → fills form (name, variety, stage, garden, emoji) → saved to MongoDB via `POST /api/plants`.
   - User can delete a plant (removes from DB via `DELETE /api/plants/:id`).

3. **Disease Detection**
   - User navigates to **AI Detect** page → clicks **Upload Leaf Photo**.
   - Image is encoded to Base64 → sent to `POST /api/detect-disease`.
   - Server calls HuggingFace ML model → matches label to PlantVillage DB → returns diagnosis.
   - If ML fails → Claude Vision API analyses the image and returns JSON diagnosis.
   - Results displayed: disease name, confidence %, urgency badge, description, treatment steps.

4. **Watering Reminders**
   - User opens a plant's detail view → sets **Water Every N Days** + **Reminder Time**.
   - Server stores `waterFrequencyDays` and `reminderTime` in MongoDB.
   - Node-Cron fires every minute → queries plants matching current time → checks if watering is due → sends Twilio SMS.

5. **Marketplace & Payments**
   - User browses gardening products → adds items to cart.
   - At checkout → `POST /api/create-order` generates a Razorpay Order ID.
   - Razorpay SDK on frontend opens the payment modal.
   - On success → order is recorded via `POST /api/orders` in MongoDB.

---

## Advantages

### ✅ For End Users
1. **All-in-One Platform** — No need for multiple apps: disease detection, reminders, plant tracking, and shopping in one place.
2. **Beginner-Friendly** — Clear UI with visual progress bars, emoji indicators, and step-by-step treatment guides makes it accessible to non-expert gardeners.
3. **Proactive Plant Care** — Automated SMS reminders ensure plants are never forgotten, even during busy schedules.
4. **Expert-Level Diagnosis** — ML + Claude AI provides hobbyists with professional-grade plant disease assessments instantly and for free.
5. **Cross-Device Access** — Responsive web design works seamlessly on mobile phones, tablets, and desktops.
6. **Data Persistence** — All plant data is stored in the cloud (MongoDB Atlas), so no information is lost if the browser is closed.

### ✅ Technical Advantages
1. **Dual-AI Design** — The primary HuggingFace ML model delivers fast, accurate, offline-trained results; Claude Vision serves as an intelligent fallback, ensuring near-100% uptime for disease detection.
2. **Scalable Architecture** — Node.js + Express with MongoDB is highly scalable and can handle a growing user base with minimal infrastructure changes.
3. **Modular Codebase** — Authentication, payments, AI, and reminders are implemented as distinct, well-defined modules in `server.js`, making the code maintainable and extensible.
4. **Background Processing** — Node-Cron handles reminder scheduling as a background server task with zero impact on frontend performance.
5. **Security** — Google OAuth 2.0 eliminates password management risks; session secrets, API keys, and credentials are stored securely in environment variables.
6. **Low Operational Cost** — Uses free/affordable tiers of third-party APIs (HuggingFace free tier, Twilio trial credits, MongoDB Atlas free cluster) suitable for MVP deployment.

---

## Conclusion

The **Digital Garden Journal (DailyGarden)** is a feature-rich, intelligent web application that successfully merges modern web development with cutting-edge artificial intelligence to serve a practical, everyday need. By combining AI-powered plant disease detection (capable of diagnosing 38 distinct diseases across 14+ plant species), automated SMS watering reminders, a fully functional e-commerce marketplace, and secure Google-based authentication — all within a beautifully designed, responsive interface — the project demonstrates the potential of technology to transform traditional gardening practices.

The application is production-ready and can be deployed on platforms like Render, Railway, or Vercel with minimal configuration. Its modular architecture and use of industry-standard technologies ensure it can be maintained, extended, and scaled with confidence.

**DailyGarden** stands as a comprehensive solution for the modern gardener — making smart, data-driven plant care accessible to everyone, from weekend hobbyists to serious horticulturists. 🌱

---

*Synopsis prepared for the Digital Garden Journal project — April 2026*  
*Author: Darshan Gowda | GitHub: [darshan-Code11](https://github.com/darshan-Code11)*
