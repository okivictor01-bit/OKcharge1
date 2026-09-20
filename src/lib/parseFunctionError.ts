// Supabase's functions.invoke() puts the real error message inside
// error.context (the raw HTTP response), not in error.message or data.
// This helper reads it correctly, with a safe fallback if parsing fails.
export async function parseFunctionError(error: any): Promise<string> {
  if (!error) return 'Something went wrong. Please try again.';
  try {
    const errorBody = await error.context.json();
    if (errorBody?.error) return errorBody.error;
  } catch {
    // ignore parse failure, fall back below
  }
  return error.message || 'Something went wrong. Please try again.';
}
