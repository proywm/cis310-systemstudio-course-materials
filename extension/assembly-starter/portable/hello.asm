global _start

section .data
    message db "Hello from the CIS 310 Portable Assembly Lab!", 10
    message_length equ $ - message

section .text
_start:
    mov eax, 1                  ; Linux x86-64: write
    mov edi, 1                  ; stdout
    lea rsi, [rel message]
    mov edx, message_length
    syscall

    mov eax, 60                 ; Linux x86-64: exit
    xor edi, edi                ; status 0
    syscall
