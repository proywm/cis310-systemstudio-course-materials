; Formative self-test template for the SystemStudio Testing view.
; Build target: actual NASM ELF32. Exit 0 = pass; any other exit code = fail.
; Replace the example operation with a small test of your own procedure.

BITS 32
GLOBAL _start

SECTION .text
_start:
    mov eax, 6
    add eax, 7
    cmp eax, 13
    jne .fail

    mov eax, 1              ; Linux IA-32 sys_exit
    xor ebx, ebx            ; status 0: pass
    int 0x80

.fail:
    mov eax, 1
    mov ebx, 1              ; status 1: fail
    int 0x80
