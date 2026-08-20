; Actual NASM/ELF32: registers and arithmetic.
bits 32

section .data
pass_message db "register arithmetic: PASS", 10
pass_length equ $ - pass_message
fail_message db "register arithmetic: FAIL", 10
fail_length equ $ - fail_message

section .text
global _start
_start:
    mov eax, 7
    mov ebx, 5
    add eax, ebx
inspect_after_add:
    cmp eax, 12
    jne failed
    mov ecx, pass_message
    mov edx, pass_length
    xor esi, esi
    jmp report

failed:
    mov ecx, fail_message
    mov edx, fail_length
    mov esi, 1

report:
    mov eax, 4
    mov ebx, 1
    int 0x80
    mov eax, 1
    mov ebx, esi
    int 0x80
