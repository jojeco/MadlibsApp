// lib/storage.js
// Thin AsyncStorage adapter. All the actual save/load/parse logic lives in
// persistence.js, which has zero imports so it can be tested without RN;
// this file just wires that logic to the real native storage backend.
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createGameStore } from './persistence';

export const gameStore = createGameStore(AsyncStorage);
