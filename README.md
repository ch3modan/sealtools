# 🦭 SealTools

**SealTools** is a free, open-source, web-first RSVP (Rapid Serial Visual Presentation) reading application designed specifically for neurodivergent individuals. 

Instead of doomscrolling, channel your screen time into reading books — at your own pace, in your own way. SealTools presents one word at a time at a controlled speed, drastically reducing the cognitive load of tracking lines and managing eye movement.

## ✨ Features

- **RSVP Reader Engine:** Adjustable speed from 100 to 800 WPM, with smart pauses on punctuation for a natural reading rhythm.
- **Bionic Reading Mode:** Bolds the beginning of words to guide the eyes and facilitate faster text recognition.
- **ORP Highlighting:** (Optimal Recognition Point) Highlights the center character of each word to keep your eyes perfectly aligned.
- **Accessibility First:** 
  - 6 color profiles meticulously designed to prevent halation (a common issue for astigmatism).
  - Dyslexia-friendly fonts including OpenDyslexic, Atkinson Hyperlegible, and Lexend.
- **Bring Your Own Books:** Local PDF and EPUB import directly into your browser.
- **Bimodal Reading (TTS):** Web Speech API integration that speaks words aloud in sync with the visual display.
- **Progress Tracking:** Daily reading streaks, word counts, and a 28-day GitHub-style contribution heatmap.
- **Custom Authentication:** Self-hosted email/password authentication via Azure Functions, ensuring complete privacy. 

## 🛠️ Tech Stack

SealTools is built with a modern, serverless stack optimized for free-tier hosting:

- **Frontend:** [Expo SDK 54](https://expo.dev/) (React Native for Web), Expo Router, [NativeWind](https://www.nativewind.dev/) (Tailwind CSS), and Zustand for state management.
- **Backend API:** [Azure Functions v4](https://azure.microsoft.com/en-us/products/functions) (Node.js/TypeScript).
- **Database:** [Azure Cosmos DB for NoSQL](https://azure.microsoft.com/en-us/products/cosmos-db) (Serverless tier).
- **Storage:** [Azure Blob Storage](https://azure.microsoft.com/en-us/products/storage/blobs) (Valet Key pattern with SAS URLs for secure, direct client-side uploads).
- **Hosting:** Azure Static Web Apps (Automated CI/CD).

## 🚀 Local Development Setup

To run SealTools locally on your machine:

### 1. Clone the repository
```bash
git clone https://github.com/ch3modan/sealtools.git
cd sealtools
```

### 2. Install Dependencies
```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd api
npm install
cd ..
```

### 3. Setup Environment Variables
You will need an active Azure Subscription with a Cosmos DB NoSQL account and an Azure Storage account. 

Create a file at `api/local.settings.json` and add your Azure credentials:
```json
{
  "IsEncrypted": false,
  "Values": {
    "FUNCTIONS_WORKER_RUNTIME": "node",
    "COSMOS_ENDPOINT": "https://<YOUR-COSMOS-DB-NAME>.documents.azure.com:443/",
    "COSMOS_KEY": "<YOUR-PRIMARY-KEY>",
    "COSMOS_DATABASE": "sealtools",
    "STORAGE_ACCOUNT_NAME": "<YOUR-STORAGE-ACCOUNT-NAME>",
    "STORAGE_ACCOUNT_KEY": "<YOUR-STORAGE-ACCOUNT-KEY>",
    "STORAGE_CONTAINER": "book-files"
  }
}
```

### 4. Run the App
Start the Expo frontend and the Azure Functions backend simultaneously.

```bash
# Terminal 1: Start the frontend
npx expo start -c

# Terminal 2: Start the backend API
cd api
npm run start
```
*Note: In development, Expo is configured to automatically proxy `/api/*` requests to your local Azure Functions runtime (usually port 7071).*

## ☁️ Azure Deployment

SealTools is designed to be hosted for virtually $0/month using Azure's free tiers. 

1. **Database:** Create an **Azure Cosmos DB for NoSQL** account using the "Serverless" capacity mode.
2. **Storage:** Create an Azure Storage account and create a private container named `book-files`. *You must enable CORS on the Blob service for uploads to work.*
3. **Web App:** Create an **Azure Static Web App**. Connect it to your GitHub repository and specify `api` as the API location and `dist` as the output location.
4. **Environment Variables:** Add your `COSMOS_ENDPOINT`, `COSMOS_KEY`, `STORAGE_ACCOUNT_NAME`, and `STORAGE_ACCOUNT_KEY` to the Environment Variables section of your Static Web App.

## 📄 License

This project is open-source and available under the MIT License.
