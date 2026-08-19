; NASM-style source executed by the same embedded 32-bit teaching machine.
bits 32

section .data
values dd 1, 2, 3, 4, 5

section .text
global _start
_start:
    mov esi, values
    mov ecx, 5
    xor eax, eax

sum_loop:
    add eax, [esi]
    add esi, 4
    loop sum_loop

    call double_result
    call WriteDec
    call Crlf
    hlt

double_result:
    add eax, eax
    ret
