/**
 * Centralized image URLs for the app.
 * To hide an image everywhere it appears, set its value to an empty string ''.
 */
export const IMAGE_LINKS: Record<string, string> = {
  BANNER_IMAGE: 'https://kpyxtajhbmbtyyydjbdr.supabase.co/storage/v1/object/sign/Images/WhatsApp%20Image%202026-04-18%20at%203.02.32%20PM.jpeg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV84MmY2ZjI2My03MjY0LTQ5ODUtYjExYS05OTNhNWVlM2VhNTUiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJJbWFnZXMvV2hhdHNBcHAgSW1hZ2UgMjAyNi0wNC0xOCBhdCAzLjAyLjMyIFBNLmpwZWciLCJpYXQiOjE3NzY1MDQ4MzAsImV4cCI6MTgwODA0MDgzMH0.qbW9Z_PtbaUHtXQD2skocgNAATkWCBOjJHSfU-Vm9BI',
  SIDE_IMAGE: '',
};

/** Returns true only when a non-empty URL exists for the given key. */
export const hasImage = (key: keyof typeof IMAGE_LINKS): boolean =>
  typeof IMAGE_LINKS[key] === 'string' && IMAGE_LINKS[key].trim().length > 0;

