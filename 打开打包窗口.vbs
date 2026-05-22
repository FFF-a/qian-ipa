Set fso = CreateObject("Scripting.FileSystemObject")
Set shell = CreateObject("WScript.Shell")
folder = fso.GetParentFolderName(WScript.ScriptFullName)
shell.CurrentDirectory = folder
' 1 = normal window, True = wait
shell.Run "cmd.exe /k """ & folder & "\build-apk.bat""", 1, False
