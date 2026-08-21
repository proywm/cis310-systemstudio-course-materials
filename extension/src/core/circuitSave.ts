export interface PreparedSaveParent<T> {
  readonly parent: T;
  readonly usedFallback: boolean;
  readonly reason?: string;
}

/** Prepare a preferred save parent without creating the student's circuit. */
export async function prepareSaveParent<T>(
  preferred: T,
  fallback: T,
  createDirectory: (target: T) => PromiseLike<void>
): Promise<PreparedSaveParent<T>> {
  try {
    await createDirectory(preferred);
    return { parent: preferred, usedFallback: false };
  } catch (error) {
    return {
      parent: fallback,
      usedFallback: true,
      reason: error instanceof Error ? error.message : String(error)
    };
  }
}
