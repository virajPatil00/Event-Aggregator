# Campus Connect

Cross-platform mobile app (Expo React Native) and Node/Express backend with Prisma/SQLite for centralized college event aggregation.

## Monorepo Structure
- server: Node/Express + Prisma (SQLite)
- app: Expo React Native (Android/iOS/Web)

## Prereqs
- Node.js 18+
- npm

## Backend (server)
```
cd server
cp .env .env.local || true
# Edit .env to change PORT/JWT secret
npm run prisma:generate
npm run prisma:migrate
npm run seed
npm run dev
# Health check
curl http://localhost:4000/health
```

## Mobile (app)
```
cd app
npm start
# Android: npm run android (requires Android emulator or device)
# iOS: npm run ios (requires macOS Xcode or use Expo Go on iOS device)
# Web: npm run web
```

### Configure API URL in app
Create a config file (to be added later) or use Expo env to point to server URL.

## Push Notifications
- The backend stores Expo push tokens via POST /api/notifications/token
- Admin/Organizer can send via POST /api/notifications/send

## Aggregator
- Basic ICS/RSS aggregator runs every 30 minutes and can be triggered via POST /api/aggregator/run (ADMIN)

## GitHub push
Initialize and push to your GitHub repo:
```
# from repo root
git add .
git commit -m "feat: initial Campus Connect backend and Expo app"
# create remote if not set
git remote add origin https://github.com/<your-username>/<your-repo>.git
# or use SSH: git remote add origin git@github.com:<your-username>/<your-repo>.git
git branch -M main
git push -u origin main
```