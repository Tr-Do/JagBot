## JagBot
- A web-based chatbot and admin panel built for TAMUSA students and advisors.
- Supports rule-based FAQ routing and AI fallback, token-gated access for students, and password protection for admin control.



## Project Architecture


### Frontend:
- Rate limiter and abuse detection
- Token-gated UI with sessionStorage
- Admin panel with password authentication
- Chat interface with multi-turn support

### Backend:
- Redis-based token generation, revocation, and validation
- Express routes for chat, token, and admin login
- AI fallback for unmatched FAQ queries




## Setup instructions
- Clone the repo
- Create a .env in the root with: 
```
ADMIN_PASSWORD=your_password
OPENAI_API_KEY=your_api_key
```
- Install all dependencies
```
npm install
```
- Install and run Redis (Windows)
```
redis-server.exe redis-windows.conf
```
- Run the server
```
node server.js
```
## Usage


### Student flow
- Visit `/`
- Enter 5-letter access token
- Use the chatbot interface

### Admin flow
- Visit `/admin.html`
- Enter password (from .env file)
- Generate tokens with valid student IDs (starts with J or K, followed by 8 digits)
- Revoke tokens as needed



## Security Design
- Student access is controlled by time-limited token (stored in Redis with 30-minute TTL)
- Admin access is protected by password stored in .env file
- Session is stored in sessionStorage
- Abuse rate-limiting enforced on client side, tracked with timestamp
- Student IDs are logged for each token request
- Chat inputs are logged for unmatched queries to improve coverage



## Tech Stack
- HTML
- CSS
- Javascript
- Redis
- Node.js
- Express
- OpenAI API



## Limitations
- Reliance on OpenAI API for rephrasing and fallback responses
- No persistent admin session
- No server-side logging for admin sessions