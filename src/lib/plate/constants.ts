import { KEYS as PLATE_KEYS } from 'platejs';

export const KEYS = {
    ...PLATE_KEYS,
    codeDrawing: 'code_drawing',
} as typeof PLATE_KEYS & { codeDrawing: string };
