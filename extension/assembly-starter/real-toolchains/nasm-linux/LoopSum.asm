; Real NASM + GNU ld example for the SystemStudio full toolchain path.
; This source is assembled to an ELF32 object, linked, and executed as IA-32
; machine code. It does not use the instructional trace simulator.
bits 32

section .data
values dd 1, 2, 3, 4, 5
result db "Sum = 00", 10
result_len equ $ - result

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

    ; Convert the known two-digit exercise result (15) to ASCII.
    xor edx, edx
    mov ebx, 10
    div ebx
    add al, '0'
    add dl, '0'
    mov [result + 6], al
    mov [result + 7], dl

    mov eax, 4              ; Linux IA-32 sys_write
    mov ebx, 1
    mov ecx, result
    mov edx, result_len
    int 0x80

    mov eax, 1              ; Linux IA-32 sys_exit
    xor ebx, ebx
    int 0x80
