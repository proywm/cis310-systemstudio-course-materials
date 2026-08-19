TITLE Virtual Console Input (ConsoleInput.asm)

; Enter two lines in the Assembly Lab's Virtual console input box:
; -42
; Ada Lovelace

.386
.model flat,stdcall
.stack 4096
INCLUDE Irvine32.inc

MAX_NAME = 40

.data
numberPrompt BYTE "Enter a signed integer: ",0
namePrompt   BYTE "Enter your name: ",0
resultLabel  BYTE "You entered ",0
nameBuffer   BYTE MAX_NAME + 1 DUP(?)

.code
main PROC
    mWriteString numberPrompt
    call ReadInt
    jo badInput
    mov ebx,eax

    mWriteString namePrompt
    mov edx,OFFSET nameBuffer
    mov ecx,MAX_NAME
    call ReadString

    mWriteString resultLabel
    mov eax,ebx
    call WriteInt
    mWrite "; name="
    mov edx,OFFSET nameBuffer
    call WriteString
    call Crlf
    exit

badInput:
    mWriteLn "Please provide a signed 32-bit integer."
    exit
main ENDP
END main
