; Optional NASM-style prediction practice. This file is not build evidence.
bits 32
section .text
global _start
_start:
    mov eax, -3
    mov ebx, 2
    cmp eax, ebx
    jge failed
    add eax, 5
    hlt
failed:
    mov eax, -1
    hlt
