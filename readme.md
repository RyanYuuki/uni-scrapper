# UniScrapper

**UniScrapper** is a modular and scalable backend API built with Express.js for scraping movie and TV series metadata, streaming links, and search results from various public content sources. It provides a unified, standardized interface suitable for integration with media-focused apps and services.

> **Note**: The project is in active development. Currently supports: `XPrime`. More sources will be integrated soon.

---

## 🚀 Features

- REST API for media search, details, and streaming
- Modular source integration (easy to add new providers)
- Efficient in-memory caching using `node-cache`
- Clean, standardized JSON responses
- Built using Express.js and TypeScript
- CORS-enabled middleware for cross-origin access

---

## 📦 Installation

### Prerequisites

- Node.js v18+ and npm
- Git

### Clone the Repository

```bash
git clone https://github.com/your-username/uniscrapper.git
cd uniscrapper
````

### Install Dependencies

```bash
npm install
```

### Run the Server

```bash
npm run dev
```

The server will start on: [http://localhost:3000](http://localhost:3000)

---

## 📘 API Documentation

### Base URL

```
http://localhost:3000/api
```

### Available Endpoints

| Method | Endpoint   | Description                      |
| ------ | ---------- | -------------------------------- |
| POST   | `/search`  | Search for movies or series      |
| POST   | `/streams` | Retrieve streaming links         |
| POST   | `/details` | Fetch metadata and detailed info |
| GET    | `/`        | API status and basic information |

Each endpoint expects a JSON body depending on the source type. Standard response formats are used for consistency.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).