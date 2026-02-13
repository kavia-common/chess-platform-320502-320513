# Chess Frontend (React)

Modern light-themed chess platform UI:
- Digital chessboard (click-to-move with basic rules)
- Sidebar for opponent options (AI vs Multiplayer placeholder)
- Top navigation (Play / History / Profile)
- Login/Register modal (mocked until backend auth endpoints exist)
- API client wrapper wired to backend `GET /` health endpoint, with safe mock fallbacks for the rest

## Configuration

Create a `.env` (do not commit it) or set environment variables:

- `REACT_APP_BACKEND_URL` (optional): FastAPI base URL, e.g. `http://localhost:3001`

See `.env.example`.

## Development

```bash
npm install
npm start
```

## Notes

Backend OpenAPI currently exposes only `GET /` health. The frontend uses mock fallbacks for:
- `/auth/*`
- `/games/*`
- `/history`

Once the backend implements these endpoints, disable mocks in `src/state/AuthContext.js` and page-level clients.
