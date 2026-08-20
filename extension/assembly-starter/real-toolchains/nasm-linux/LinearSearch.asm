; Real NASM/ELF32 regression example: iterative linear search.
bits 32

section .data
values dd 4, 12, 7, 19, 3
value_count equ ($ - values) / 4
pass_message db "linear search: PASS", 10
pass_length equ $ - pass_message
fail_message db "linear search: FAIL", 10
fail_length equ $ - fail_message

section .text
global _start
_start:
    mov edi, 4
    call linear_search
    cmp eax, 0
    jne failed

    mov edi, 7
    call linear_search
    cmp eax, 2
    jne failed

    mov edi, 3
    call linear_search
    cmp eax, 4
    jne failed

    mov edi, 99
    call linear_search
    cmp eax, -1
    jne failed

    mov ecx, pass_message
    mov edx, pass_length
    xor ebx, ebx
    jmp report

; Input: EDI = target. Output: EAX = zero-based index, or -1.
linear_search:
    mov esi, values
    mov ecx, value_count
    xor ebx, ebx
    mov eax, -1

search_loop:
    test ecx, ecx
    jz search_done
    cmp [esi], edi
    je search_found
    add esi, 4
    inc ebx
    dec ecx
    jmp search_loop

search_found:
    mov eax, ebx

search_done:
    ret

failed:
    mov ecx, fail_message
    mov edx, fail_length
    mov ebx, 1

report:
    push ebx
    mov eax, 4
    mov ebx, 1
    int 0x80
    mov eax, 1
    pop ebx
    int 0x80
