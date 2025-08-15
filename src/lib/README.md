# Supabase Integration

This directory contains the Supabase client configuration and type definitions for the Digital Product Passport feature.

## Files

- `supabase.ts` - Supabase client utilities for server and client components
- `types.ts` - TypeScript type definitions for database schema
- `env.ts` - Environment variable validation

## Usage

### Server Components
```typescript
import { supabase } from '@/lib/supabase'

// Use in server components for data fetching
const { data, error } = await supabase
  .from('products')
  .select('*')
  .eq('id', productId)
```

### Client Components
```typescript
import { createClientClient } from '@/lib/supabase'

// Use in client components for interactive features
const supabase = createClientClient()
```

## Environment Variables

Required environment variables in `.env`:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

## Type Generation

In production, types should be generated using:
```bash
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/lib/types.ts
```

## Security

The client is configured for public read access without authentication, suitable for the Digital Product Passport public pages. Row-Level Security (RLS) policies should be configured in Supabase to allow public SELECT operations only.