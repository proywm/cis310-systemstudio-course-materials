; Optional NASM-style prediction practice. This file is not build evidence.
bits 32
section .text
global _start
_start:
    push 9
    push 4
    call add_two
    add esp, 8
    hlt
add_two:
    push ebp
    mov ebp, esp
    mov eax, [ebp + 8]
    add eax, [ebp + 12]
    pop ebp
    ret
