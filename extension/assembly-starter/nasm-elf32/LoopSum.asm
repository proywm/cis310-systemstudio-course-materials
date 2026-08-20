; Actual NASM/ELF32: sum an array through indirect addressing and a loop.
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

inspect_sum:
    cmp eax, 15
    jne failed
    xor edx, edx
    mov ebx, 10
    div ebx
    add al, '0'
    add dl, '0'
    mov [result + 6], al
    mov [result + 7], dl
    mov ecx, result
    mov edx, result_len
    xor esi, esi
    jmp report

failed:
    mov esi, 1

report:
    mov eax, 4
    mov ebx, 1
    int 0x80
    mov eax, 1
    mov ebx, esi
    int 0x80
