TITLE CIS 310 embedded MASM-style example
.386
.model flat,stdcall
.stack 4096
INCLUDE Irvine32.inc

.data
message BYTE "CIS 310 sum: ",0
value1  DWORD 10000h
value2  DWORD 40000h

.code
main PROC
    lea edx, message
    call WriteString

    mov eax, value1
    add eax, value2
    call WriteHex
    call Crlf
    call DumpRegs
    exit
main ENDP
END main
