@IF EXIST "%~dp0\node.exe" (
  "%~dp0\node.exe"  "%~dp0\server" %*
) ELSE (
  node  "%~dp0\server" %*
)