import { writable } from 'svelte/store';
import type { CharacterDetailsType } from '../types/CharacterDetailsType';

export const query = writable<string>(null);
export const total = writable<number>(null);
export const details = writable<CharacterDetailsType>(null);

const createOffset = () => {
    const { subscribe, set, update } = writable<number>(0);

    return {
        subscribe,
        set,
        increment: () => update(n => n + 20),
        decrement: () => update(n => n - 20),
    };
}

export const offset = createOffset();