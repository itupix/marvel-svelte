import App from './components/App.svelte';
import { worker } from './mocks/browser';

// worker.start()

const app = new App({
	target: document.body
});

export default app;