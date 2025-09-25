# External Cron Service Setup

## Option 1: cron-job.org (Free)
1. Go to https://cron-job.org/
2. Create free account
3. Add new cron job:
   - URL: `https://your-domain.com/api/cron/process-notifications`
   - Schedule: `*/2 * * * *` (every 2 minutes)
   - HTTP Method: GET
   - Add header: `Authorization: Bearer YOUR_CRON_SECRET` (optional)

## Option 2: EasyCron (Free tier available)
1. Go to https://www.easycron.com/
2. Create account
3. Add cron job with same URL and schedule

## Option 3: GitHub Actions (Free for public repos)
Create `.github/workflows/cron-notifications.yml`:

```yaml
name: Process Notifications
on:
  schedule:
    - cron: '*/2 * * * *'  # Every 2 minutes
  workflow_dispatch:  # Allow manual trigger

jobs:
  process-notifications:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger notification processing
        run: |
          curl -X GET "https://your-domain.com/api/cron/process-notifications" \
            -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}"
```

## Security
Add to your `.env`:
```
CRON_SECRET=your-random-secret-here
```
