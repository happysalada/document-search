import { writable} from 'svelte/store'

export const user = writable<User | undefined>();

export const searchQuery = writable<string>("");
export const properties = writable<Property[]>([]);
export const selectedProperty = writable<Property | null>(null);
export const displayProperties = writable<Property[]>([]);
