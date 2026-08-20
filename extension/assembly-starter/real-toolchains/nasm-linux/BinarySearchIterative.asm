; Real NASM/ELF32 regression example: iterative binary search.
bits 32

section .data
sorted_values dd 3, 7, 12, 18, 25, 31, 44
value_count equ ($ - sorted_values) / 4
pass_message db "iterative binary search: PASS", 10
pass_length equ $ - pass_message
fail_message db "iterative binary search: FAIL", 10
fail_length equ $ - fail_message

section .text
global _start
_start:
    mov edi, 3
    call binary_search_iterative
    cmp eax, 0
    jne failed

    mov edi, 25
    call binary_search_iterative
    cmp eax, 4
    jne failed

    mov edi, 44
    call binary_search_iterative
    cmp eax, 6
    jne failed

    mov edi, 20
    call binary_search_iterative
    cmp eax, -1
    jne failed

    mov ecx, pass_message
    mov edx, pass_length
    xor ebx, ebx
    jmp report

; Input: EDI = target. Output: EAX = zero-based index, or -1.
binary_search_iterative:
    xor ebx, ebx
    mov ecx, value_count - 1

binary_loop:
    cmp ebx, ecx
    jg binary_not_found
    mov edx, ebx
    add edx, ecx
    shr edx, 1
    mov eax, [sorted_values + edx * 4]
    cmp eax, edi
    je binary_found
    jl binary_move_right
    lea ecx, [edx - 1]
    jmp binary_loop

binary_move_right:
    lea ebx, [edx + 1]
    jmp binary_loop

binary_found:
    mov eax, edx
    jmp binary_done

binary_not_found:
    mov eax, -1

binary_done:
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
