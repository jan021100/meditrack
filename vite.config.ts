import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import adapter from '@sveltejs/adapter-vercel';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

// A Vercel preview must never connect colleagues to the production patient database.
if (process.env.VERCEL_ENV === 'preview' || (process.env.VERCEL && process.env.VERCEL_ENV !== 'production')) {
	throw new Error('Preview deployment disabled: configure a separate staging Firebase project first.');
}

export default defineConfig({
	plugins: [sveltekit({ preprocess: vitePreprocess(), adapter: adapter({ regions: ['fra1'] }) })]
});
