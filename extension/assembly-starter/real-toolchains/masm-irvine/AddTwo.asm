TITLE Real Microsoft MASM / Irvine32 AddTwo

; This file is for the full Windows toolchain path. SystemStudio invokes the
; real Microsoft ml.exe and link.exe and links the official Irvine32 library.
INCLUDE Irvine32.inc

.386
.model flat,stdcall
.stack 4096

.code
main PROC
    mov eax,17
    add eax,25
    call DumpRegs
    exit
main ENDP
END main
