TITLE SystemStudio Register Addition (AddTwo.asm)

; The program shape matches the introductory Visual Studio/MASM workflow.
; SystemStudio executes it in the embedded Irvine32 Classroom profile.
; No Microsoft or Irvine binary is bundled or loaded.

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
