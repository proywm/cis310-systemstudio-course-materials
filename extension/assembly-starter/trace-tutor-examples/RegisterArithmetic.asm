; Optional NASM-style prediction practice. This file is not build evidence.
bits 32
section .text
global _start
_start:
    mov eax, 7
    mov ebx, 5
    add eax, ebx
    cmp eax, 12
    hlt
