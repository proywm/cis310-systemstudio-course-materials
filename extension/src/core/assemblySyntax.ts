export type AssemblySyntax = 'masm' | 'nasm' | 'ambiguous';

/** Uses distinctive source forms only; ambiguity must be resolved by the student. */
export function detectAssemblySyntax(source: string): AssemblySyntax {
  const masm = [
    /^\s*TITLE\b/im,
    /^\s*\.(?:386|model|stack|code|data)\b/im,
    /^\s*INCLUDE\s+(?:Irvine32|SmallWin)\.inc\b/im,
    /\b(?:PROC|ENDP|INVOKE|OFFSET|DUP)\b/im,
    /\b(?:BYTE|WORD|DWORD)\s+PTR\b/im,
    /^\s*END\s+[A-Za-z_.$?@][\w.$?@]*\s*$/im
  ].some((pattern) => pattern.test(source));
  const nasm = [
    /^\s*bits\s+(?:16|32|64)\b/im,
    /^\s*section\s+\.(?:text|data|bss)\b/im,
    /^\s*global\s+[A-Za-z_.$?][\w.$?]*\b/im,
    /^\s*(?:extern|struc|endstruc)\b/im
  ].some((pattern) => pattern.test(source));
  if (masm === nasm) return 'ambiguous';
  return masm ? 'masm' : 'nasm';
}
