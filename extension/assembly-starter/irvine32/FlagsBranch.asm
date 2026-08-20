TITLE Flags and Signed Branching (FlagsBranch.asm)

; Guided practice: predict the path before stepping CMP and JL.
; Change only firstValue to reverse the comparison, then rebuild.

.386
.model flat,stdcall
.stack 4096
INCLUDE Irvine32.inc

firstValue  = -3
secondValue = 5

.code
main PROC
    mov eax,firstValue
    mov edx,secondValue
    mov ebx,0

    cmp eax,edx
    jl first_is_smaller
    mov ebx,2
    jmp show_state

first_is_smaller:
    mov ebx,1

show_state:
    call DumpRegs
    exit
main ENDP
END main
