import '@platejs/utils';

declare module '@platejs/utils' {
  export const KEYS: {
    readonly [key: string]: string;
    readonly codeDrawing: 'code_drawing';
  }
}
