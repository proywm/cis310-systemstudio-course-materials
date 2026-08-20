; Actual NASM/ELF32 regression example: recursive binary search.
bits 32

section .data
sorted_values dd 3, 7, 12, 18, 25, 31, 44
value_count equ ($ - sorted_values) / 4
pass_message db "recursive binary search: PASS", 10
pass_length equ $ - pass_message
fail_message db "recursive binary search: FAIL", 10
fail_length equ $ - fail_message

section .text
global _start
_start:
    push value_count - 1
    push 0
    push 3
    call binary_search_recursive
    add esp, 12
    cmp eax, 0
    jne failed
    push value_count - 1
    push 0
    push 25
    call binary_search_recursive
    add esp, 12
    cmp eax, 4
    jne failed
    push value_count - 1
    push 0
    push 44
    call binary_search_recursive
    add esp, 12
    cmp eax, 6
    jne failed
    push value_count - 1
    push 0
    push 20
    call binary_search_recursive
    add esp, 12
    cmp eax, -1
    jne failed
    mov ecx, pass_message
    mov edx, pass_length
    xor ebx, ebx
    jmp report

; Arguments: target, low, high. Return EAX = index or -1.
binary_search_recursive:
    push ebp
    mov ebp, esp
    push ebx
    push ecx
    push edx
inspect_recursive_frame:
    mov ebx, [ebp + 12]
    mov ecx, [ebp + 16]
    cmp ebx, ecx
    jg recursive_not_found
    mov edx, ebx
    add edx, ecx
    shr edx, 1
    mov eax, [sorted_values + edx * 4]
    cmp eax, [ebp + 8]
    je recursive_found
    jl recursive_right
    dec edx
    push edx
    push ebx
    push dword [ebp + 8]
    call binary_search_recursive
    add esp, 12
    jmp recursive_done
recursive_right:
    inc edx
    push ecx
    push edx
    push dword [ebp + 8]
    call binary_search_recursive
    add esp, 12
    jmp recursive_done
recursive_found:
    mov eax, edx
    jmp recursive_done
recursive_not_found:
    mov eax, -1
recursive_done:
    pop edx
    pop ecx
    pop ebx
    leave
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
