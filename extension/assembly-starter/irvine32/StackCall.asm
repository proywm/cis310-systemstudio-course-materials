TITLE Stack and Procedure Trace (StackCall.asm)

; Guided practice: EAX returns the result while EBX is preserved.
; Step CALL, PUSH, MOV, ADD, POP, LEAVE, and RET one at a time.

.386
.model flat,stdcall
.stack 4096
INCLUDE Irvine32.inc

.code
main PROC
    mov eax,10
    mov ebx,32
    call add_preserving_ebx
    call DumpRegs
    exit
main ENDP

add_preserving_ebx PROC
    push ebp
    mov ebp,esp
    push ebx
    add eax,ebx
    pop ebx
    leave
    ret
add_preserving_ebx ENDP
END main
