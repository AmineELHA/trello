# Monitoring and Analytics Setup

This document explains how Sentry (error tracking) and PostHog (analytics) are integrated into the Trello clone application.

## Sentry - Error Tracking

Sentry is configured for both frontend and backend to track errors and performance issues.

### Backend (Rails)

**Package:** `sentry-ruby` and `sentry-rails`

**Configuration:** `backend/config/initializers/sentry.rb`

**Environment Variables Required:**
- `SENTRY_DSN`: Your Sentry DSN from https://sentry.io
- `SENTRY_TRACES_SAMPLE_RATE`: Performance monitoring sample rate (default: 0.1)
- `SENTRY_PROFILES_SAMPLE_RATE`: Profiling sample rate (default: 0.1)

**Setup:**
1. Create a new Rails project in Sentry: https://sentry.io
2. Copy the DSN to your `.kamal/secrets` file as `SENTRY_DSN`
3. Errors will automatically be captured in production

### Frontend (Next.js)

**Package:** `@sentry/nextjs`

**Configuration Files:**
- `frontend/sentry.client.config.ts` - Client-side error tracking
- `frontend/sentry.server.config.ts` - Server-side error tracking  
- `frontend/sentry.edge.config.ts` - Edge runtime error tracking

**Environment Variables Required:**
- `NEXT_PUBLIC_SENTRY_DSN`: Your Sentry DSN (must be public for client-side)
- `NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE`: Sample rate (default: 0.1)

**Features:**
- Session replay on errors
- Performance monitoring
- User feedback
- Breadcrumbs for debugging

**Setup:**
1. Create a new Next.js project in Sentry: https://sentry.io
2. Copy the DSN to your `.kamal/secrets` file as `NEXT_PUBLIC_SENTRY_DSN`
3. Errors will automatically be captured in production

## PostHog - Product Analytics

PostHog tracks user behavior, feature usage, and product metrics.

**Package:** `posthog-js`

**Configuration:** `frontend/src/lib/posthog.tsx`

**Environment Variables Required:**
- `NEXT_PUBLIC_POSTHOG_KEY`: Your PostHog API key
- `NEXT_PUBLIC_POSTHOG_HOST`: PostHog host (default: https://app.posthog.com)

**Features:**
- Automatic pageview tracking
- Custom event tracking
- Session recording
- Feature flags
- A/B testing
- User identification

**Setup:**
1. Create a PostHog account: https://posthog.com
2. Create a new project
3. Copy your API key to `.kamal/secrets` as `NEXT_PUBLIC_POSTHOG_KEY`
4. Analytics will automatically start tracking in production

### Using PostHog in Your Code

The PostHog provider is already integrated in the app. To track custom events:

```typescript
import posthog from 'posthog-js';

// Track custom event
posthog.capture('board_created', {
  board_name: 'My Board',
  user_id: userId
});

// Identify user
posthog.identify(userId, {
  email: user.email,
  name: user.name
});
```

## Development vs Production

Both Sentry and PostHog are **disabled in development** by default:
- Sentry only captures errors when `NODE_ENV === 'production'`
- PostHog can be debugged in development with `posthog.debug()`

## Privacy Considerations

**Sentry:**
- Sensitive data is filtered in `sentry.rb` before sending
- Consider implementing PII scrubbing for user data

**PostHog:**
- Session recordings mask all text by default (`maskAllText: true`)
- All media is blocked (`blockAllMedia: true`)
- Adjust these settings in `frontend/src/lib/posthog.tsx` if needed

## Monitoring Dashboard

After deployment, monitor your application:

- **Sentry Dashboard:** https://sentry.io/organizations/your-org/issues/
- **PostHog Dashboard:** https://app.posthog.com/project/your-project

## Cost Optimization

Both services have generous free tiers:

**Sentry:**
- Adjust `traces_sample_rate` to reduce performance monitoring costs
- Default is 10% (0.1) which is usually sufficient

**PostHog:**
- Free tier includes 1M events/month
- Session recordings can be expensive - consider sampling in production

## Troubleshooting

### Sentry not capturing errors

1. Check `SENTRY_DSN` is set correctly
2. Verify environment is "production"
3. Check Sentry dashboard for ingestion issues

### PostHog not tracking events

1. Check `NEXT_PUBLIC_POSTHOG_KEY` is set
2. Open browser console and look for PostHog initialization
3. Enable debug mode: `posthog.debug()`

### Environment variables not loading

1. Ensure secrets are in `.kamal/secrets`
2. Restart the application: `kamal app restart`
3. Check environment variables: `kamal app exec 'env | grep SENTRY'`
