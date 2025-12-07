# Transcription Service

A TypeScript Express.js application for audio transcription.

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- MongoDB (optional, for storing transcriptions)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create a .env file in the root directory:
```bash
PORT=3000
NODE_ENV=development
MONGODB_URI=your_mongodb_connection_string
AZURE_SPEECH_KEY=your_azure_key
AZURE_SPEECH_REGION=your_azure_region
```

3. Run in development mode:
```bash
npm run dev
```

4. Build for production:
```bash
npm run build
npm start
```

The server will start on port 3000 (or whatever you set in PORT).

## API Routes

### Health Check
- **GET** `/health`
  - Check if server is running
  - Returns server status

### Test Route
- **GET** `/api/test`
  - Test endpoint to verify API is working
  - Returns success message

### Transcription Routes
- **POST** `/api/transcription`
  - Transcribe audio from a URL
  - Saves transcription to database
  - Body: `{ "audioUrl": "https://..." }`

- **POST** `/api/azure-transcription`
  - Transcribe audio using Azure Speech Service
  - Saves transcription to database
  - Body: `{ "audioUrl": "https://..." }`

- **GET** `/api/transcriptions`
  - Get list of transcriptions from past 30 days
  - Query parameters:
    - `page` - Page number (default: 1)
    - `limit` - Items per page (default: 10, max: 100)
    - `source` - Filter by source: 'mock' or 'azure'
    - Indexing and Handling for 100M+ records:
     * Compound index is created :{ source: 1, createdAt: -1 } since we store both source in same collection
     * index  { createdAt: -1 } is created for filtering with createdAt date (since we will be fetching only last 30 days data)
     * pagination is added to handle huge data so data will be sent by pages 

## Handling 10k+ concurrent Request 

- need to implement cluster module to scale application accross mutliple thread
- need to verify all required filter queries are indexed properly 
- caching data in redis with respect to user or an accessible key, need to invalidate the cache if any changes in data
- implementing rate limiting to restrict exploitation of routes
- we can maitain db as replica set so read oprations can be done from slaves
- handling application with a load balancer increase the servers if cpu spikes more than 70%


# Real Time

Real-time transcription uses WebSocket (Socket.io) for live audio transcription.

## Events

### Client to Server

**session-start**
- Start a new transcription session
- Data: none (empty object)

**audio-chunk**
- Send audio chunk for transcription
- Data: 
  ```json
  {
    "chunk": "base64_encoded_audio_data"
  }
  ```

**session-end**
- End the current session and get final transcription
- Data: none (empty object)

### Server to Client

**session-start**
- Session started successfully
- Data:
  ```json
  {
    "sessionId": "uuid_string"
  }
  ```

**transcription-partial**
- Partial transcription result (sent after each audio chunk)
- Data:
  ```json
  {
    "partial": "transcribed text",
    "sessionId": "uuid_string",
    "timestamp": "2024-01-01T00:00:00.000Z"
  }
  ```

**transcription-final**
- Final transcription result (sent when session ends)
- Data:
  ```json
  {
    "final": "complete transcribed text",
    "sessionId": "uuid_string",
    "timestamp": "2024-01-01T00:00:00.000Z"
  }
  ```

**session-end**
- Session ended successfully
- Data:
  ```json
  {
    "sessionId": "uuid_string",
    "message": "Session ended successfully"
  }
  ```

**error**
- Error occurred during processing
- Data:
  ```json
  {
    "message": "error message",
    "error": "error details"
  }
  ```

## Usage Flow

1. Connect to WebSocket server
2. Emit `session-start` → receive `session-start` with sessionId
3. Emit `audio-chunk` multiple times → receive `transcription-partial` for each chunk
4. Emit `session-end` → receive `transcription-final` and `session-end`
