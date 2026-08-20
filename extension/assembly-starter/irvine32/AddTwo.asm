TITLE SystemStudio Register Addition (AddTwo.asm)

; Formative trace-tutor example: it models selected source-level effects only.
; It is not assembled or linked by the tutor. For exact MASM/Irvine32 execution,
; use real-toolchains/masm-irvine/AddTwo.asm on Windows with the real toolchain.

.386
.model flat,stdcall
.stack 4096
ExitProcess PROTO, dwExitCode:DWORD

.code
main PROC
    mov eax,17
    add eax,25
    call DumpRegs

    invoke ExitProcess,0
main ENDP
END main
