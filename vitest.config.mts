import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/unit/**/*.test.ts'],
    clearMocks: true,
    env: {
      NEXT_PUBLIC_SUPABASE_URL: 'https://example-project.supabase.co',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: 'test-anon-key-placeholder',
      NEXT_PUBLIC_SITE_URL: 'https://argandhi.dev',
      ADMIN_EMAIL: 'admin@argandhi.dev',
    },
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
});
