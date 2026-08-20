TITLE Iterative Binary Search Practice (BinarySearchIterative.asm)

; Original CIS 310 practice example. EAX returns the zero-based index of
; targetValue in the sorted array, or -1 when the value is absent.

.386
.model flat,stdcall
.stack 4096
INCLUDE Irvine32.inc

.data
sortedValues DWORD 3, 7, 12, 18, 25, 31, 44
targetValue  DWORD 25

.code
main PROC
    mov edi,targetValue
    mov ebx,0
    mov ecx,LENGTHOF sortedValues
    dec ecx

binary_loop:
    cmp ebx,ecx
    jg binary_not_found
    mov edx,ebx
    add edx,ecx
    shr edx,1
    mov eax,sortedValues[edx * TYPE sortedValues]
    cmp eax,edi
    je binary_found
    jl binary_move_right
    mov ecx,edx
    dec ecx
    jmp binary_loop

binary_move_right:
    mov ebx,edx
    inc ebx
    jmp binary_loop

binary_found:
    mov eax,edx
    jmp binary_done

binary_not_found:
    mov eax,-1

binary_done:
    call DumpRegs
    exit
main ENDP
END main
