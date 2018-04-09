@echo off
cls
:Beginning
echo
cls
title Casper Spawner
Echo Casper Spawner
echo.
color 2f
cls
setlocal EnableDelayedExpansion
set /A @appears=1
Echo Test1 (1)
Echo Test2 (2)

set /p choice=Which one?
if '%choice%'=='1' goto :Test1
if '%choice%'=='2' goto :Test2

::This only runs test1::
:Test1
cls
echo This has been run !@appears! times!
Echo Test1
node spawn.js JS\instantiate.js --cookies-file="cookies.txt" --ignore-ssl-errors=yes --web-security=no --ssl-protocol=any --jsfile="test1.js"
set /A @appears=@appears+1
Goto Test1

::This only runs test2::
:Test2
cls
echo This has been run !@appears! times!
Echo Test1
node spawn.js  JS\instantiate.js --cookies-file="cookies.txt" --ignore-ssl-errors=yes --web-security=no --ssl-protocol=any --jsfile="test2.js"
set /A @appears=@appears+1
pause
Goto Test2

:End
Exit