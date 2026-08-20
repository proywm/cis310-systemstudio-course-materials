TITLE Linear Search Practice (LinearSearch.asm)

; Original CIS 310 practice example. EAX returns the zero-based index of
; targetValue, or -1 when the value is absent. This is not assignment code.

.386
.model flat,stdcall
.stack 4096
INCLUDE Irvine32.inc

.data
values      DWORD 4, 12, 7, 19, 3
targetValue DWORD 19

.code
main PROC
    mov edi,targetValue
    mov esi,OFFSET values
    mov ecx,LENGTHOF values
    xor ebx,ebx
    mov eax,-1

search_loop:
    cmp ecx,0
    je search_done
    cmp [esi],edi
    je search_found
    add esi,TYPE values
    inc ebx
    dec ecx
    jmp search_loop

search_found:
    mov eax,ebx

search_done:
    call DumpRegs
    exit
main ENDP
END main
