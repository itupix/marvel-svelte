import { writable } from 'svelte/store';

export const query = writable(null);
export const offset = writable(0);
export const total = writable(null);
export const details = writable(null);