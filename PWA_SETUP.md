# PWA Setup Guide

This application is now configured as a Progressive Web App (PWA) and Single Page Application (SPA).

## Features Implemented

✅ **Service Worker** (`/public/sw.js`)
- Caches static assets for offline functionality
- Network-first strategy with cache fallback
- Automatic cache cleanup

✅ **Web App Manifest** (`/public/manifest.json`)
- App metadata and configuration
- Installable on mobile and desktop
- Standalone display mode

✅ **Offline Page** (`/app/offline/page.tsx`)
- Shown when offline and no cache available

✅ **PWA Installer Component** (`/app/components/PWAInstaller.tsx`)
- Shows install prompt when available
- Handles installation flow

✅ **Layout Updates** (`/app/layout.tsx`)
- PWA meta tags
- Apple iOS support
- Theme color configuration

## Adding Icons

To complete the PWA setup, you need to add app icons:

1. Create two PNG images:
   - `icon-192.png` (192x192 pixels)
   - `icon-512.png` (512x512 pixels)

2. Place them in `/public/` directory

3. You can use online tools to generate icons:
   - [RealFaviconGenerator](https://realfavicongenerator.net/)
   - [PWA Builder Image Generator](https://www.pwabuilder.com/imageGenerator)

## Testing PWA Features

1. **Local Development:**
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` in Chrome/Edge

2. **Check Service Worker:**
   - Open DevTools → Application → Service Workers
   - Should see registered service worker

3. **Test Install Prompt:**
   - Look for install banner/prompt
   - Or use DevTools → Application → Manifest → "Add to homescreen"

4. **Test Offline:**
   - DevTools → Network → Check "Offline"
   - App should still work with cached resources

## Deployment

The PWA features work automatically when deployed. Make sure:
- HTTPS is enabled (required for service workers)
- Icons are included in `/public/`
- Service worker is accessible at `/sw.js`

## Browser Support

- ✅ Chrome/Edge (Desktop & Mobile)
- ✅ Safari (iOS 11.3+)
- ✅ Firefox (Desktop & Mobile)
- ⚠️ Some features may vary by browser

