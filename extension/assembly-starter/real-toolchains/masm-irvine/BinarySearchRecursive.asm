TITLE Recursive Binary Search Practice (BinarySearchRecursive.asm)

; Original CIS 310 practice example. binary_search_recursive receives
; target, low, and high as stack arguments and returns the zero-based index
; in EAX, or -1. This is intentionally separate from graded coursework.

.386
.model flat,stdcall
.stack 4096
INCLUDE Irvine32.inc

.data
sortedValues DWORD 3, 7, 12, 18, 25, 31, 44
targetValue  DWORD 25

.code
main PROC
    mov ecx,LENGTHOF sortedValues
    dec ecx
    push ecx
    push 0
    push targetValue
    call binary_search_recursive
    add esp,12
    call DumpRegs
    exit
main ENDP

binary_search_recursive PROC
    push ebp
    mov ebp,esp
    push ebx
    push ecx
    push edx

    mov ebx,DWORD PTR [ebp+12]
    mov ecx,DWORD PTR [ebp+16]
    cmp ebx,ecx
    jg recursive_not_found

    mov edx,ebx
    add edx,ecx
    shr edx,1
    mov eax,sortedValues[edx * TYPE sortedValues]
    cmp eax,DWORD PTR [ebp+8]
    je recursive_found
    jl recursive_right

    dec edx
    push edx
    push ebx
    mov eax,DWORD PTR [ebp+8]
    push eax
    call binary_search_recursive
    add esp,12
    jmp recursive_done

recursive_right:
    inc edx
    push ecx
    push edx
    mov eax,DWORD PTR [ebp+8]
    push eax
    call binary_search_recursive
    add esp,12
    jmp recursive_done

recursive_found:
    mov eax,edx
    jmp recursive_done

recursive_not_found:
    mov eax,-1

recursive_done:
    pop edx
    pop ecx
    pop ebx
    leave
    ret
binary_search_recursive ENDP
END main
