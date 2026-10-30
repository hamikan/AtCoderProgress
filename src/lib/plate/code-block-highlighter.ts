import { all, createLowlight } from 'lowlight';

type Lowlight = ReturnType<typeof createLowlight>;
type CacheEntry = Readonly<{
  value: string;
  result: ReturnType<Lowlight['highlightAuto']>;
}>;

export const CODE_BLOCK_AUTO_LANGUAGES = Object.freeze([
  'cpp',
  'python',
  'java',
  'javascript',
  'typescript',
  'rust',
  'go',
  'csharp',
]);

export const CODE_BLOCK_HIGHLIGHT_CACHE_MAX_ENTRIES = 8;
export const CODE_BLOCK_HIGHLIGHT_CACHE_MAX_CHARACTERS = 64 * 1024;

export function createCodeBlockHighlighter(
  createInstance: () => Lowlight = () => createLowlight(all)
): Lowlight {
  const lowlight = createInstance();
  let cache: readonly CacheEntry[] = [];

  const highlightAuto: Lowlight['highlightAuto'] = (value, options) => {
    // Custom prefixes/subsets must never reuse a default detection result.
    if (options) {
      return lowlight.highlightAuto(value, { subset: CODE_BLOCK_AUTO_LANGUAGES, ...options });
    }

    const cached = cache.find((entry) => entry.value === value);
    if (cached) {
      cache = [cached, ...cache.filter((entry) => entry !== cached)];
      return cached.result;
    }

    const result = lowlight.highlightAuto(value, { subset: CODE_BLOCK_AUTO_LANGUAGES });
    if (value.length <= CODE_BLOCK_HIGHLIGHT_CACHE_MAX_CHARACTERS) {
      cache = [{ value, result }, ...cache].slice(0, CODE_BLOCK_HIGHLIGHT_CACHE_MAX_ENTRIES);
    }
    return result;
  };

  return { ...lowlight, highlightAuto };
}
