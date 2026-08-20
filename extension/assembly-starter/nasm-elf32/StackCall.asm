; Actual NASM/ELF32: stack arguments, frame pointer, CALL, and RET.
bits 32

section .data
pass_message db "stack and call: PASS", 10
pass_length equ $ - pass_message
fail_message db "stack and call: FAIL", 10
fail_length equ $ - fail_message

section .text
global _start
_start:
    push dword 9
    push dword 4
inspect_before_call:
    call add_two
    add esp, 8
    cmp eax, 13
    jne failed
    mov ecx, pass_message
    mov edx, pass_length
    xor esi, esi
    jmp report

; int add_two(int left, int right)
add_two:
    push ebp
    mov ebp, esp
inspect_stack_frame:
    mov eax, [ebp + 8]
    add eax, [ebp + 12]
    pop ebp
    ret

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
