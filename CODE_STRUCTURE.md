Project Folder Structure

project-root/
├── .env
├── package.json
├── tsconfig.json
├── README.md
└── src/
    ├── app.ts
    ├── server.ts
    ├── config/
    │   ├── env.ts
    │   ├── db.ts
    │   └── azure.ts
    ├── common/
    │   ├── common.ts
    │   └── constants.ts
    ├── middlewares/
    │   ├── error.middleware.ts
    │   ├── requestLogger.middleware.ts
    │   └── validate.middleware.ts
    ├── models/
    │   └── transcription.model.ts
    ├── interfaces/
    │   ├── ITranscription.ts
    │   └── index.ts
    ├── utils/
    │   ├── httpClient.ts
    │   ├── logger.ts
    │   └── retry.ts
    ├── shared/
    │   ├── downloadAudio.ts
    │   └── mongoCrud.ts
    └── features/
        └── transcription/
            ├── transcription.route.ts
            ├── transcription.controller.ts
            ├── transcription.validation.ts
            ├── transcription.service.ts
            └── transcription.helper.ts

Import Rules

The order is important. Higher layers can import from lower layers, but not the other way around.

Order (highest to lowest):
1. validation
2. controller
3. service
4. helper
5. shared
6. utils
7. common/interfaces/models

Allowed imports:
- Controller can import: Validation, Service
- Service can import: Helper
- Helper can import: Shared, Common
- Shared can import: Utils, Common, Models, Interfaces
- Anything can import: Models, Interfaces, Utils
- Middleware can import anything below it

Not allowed:
- Service cannot import Controller
- Helper cannot import Service
- Shared cannot import Helper/Service/Controller
- Utils cannot import Shared
- Validation cannot import Service/Controller/Common/Shared

Folder Explanations

1. src/app.ts
   - Sets up Express app
   - Adds routes and middlewares

2. src/server.ts
   - Starts the server
   - Listens on a port

3. config/
   - env.ts - loads environment variables
   - db.ts - connects to MongoDB
   - azure.ts - Azure speech config

4. common/
   - Put functions here if they're used everywhere in the project
   - Examples: error formatter, UUID generator, date helpers

5. middlewares/
   - Express middlewares
   - Examples: validation, logging, rate limiting

6. models/
   - MongoDB models (Mongoose schemas)

7. interfaces/
   - TypeScript interfaces and enums

8. utils/
   - Basic utility functions that don't change much
   - Examples: HTTP client, logger, retry logic

9. shared/
   - Functions used by multiple features
   - Business logic that's shared
   - Examples: download audio, database operations
   - If only one feature uses it, move it to that feature's helper

10. features/
    - Each feature has its own folder
    - Each feature has these files:
      - feature.route.ts - defines routes
      - feature.controller.ts - handles requests
      - feature.validation.ts - validates input
      - feature.service.ts - main business logic
      - feature.helper.ts - helper functions for the feature

How a Feature Works

1. validation.ts
   - Validates the request using Zod

2. controller.ts
   - Gets the request
   - Calls the service
   - Sends the response

3. service.ts
   - Main business logic goes here
   - Downloads audio
   - Does transcription
   - Saves to database
   - Returns result

4. helper.ts
   - Helper functions for the feature
   - Things like audio download, transcription functions

5. common/
   - Global utilities if needed
