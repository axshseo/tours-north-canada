@echo off
setlocal enabledelayedexpansion

set "regions=alberta british-columbia manitoba new-brunswick newfoundland-labrador nova-scotia nunavut ontario pei quebec saskatchewan yukon"

for %%r in (%regions%) do (
    set "dir=tours/%%r-hub"
    mkdir "!dir!" 2>nul
    copy index.html "!dir!\index.html"

    set "title="
    if "%%r"=="alberta" set "title=Alberta Tours & Adventures - Tours North"
    if "%%r"=="british-columbia" set "title=British Columbia Tours & Adventures - Tours North"
    if "%%r"=="manitoba" set "title=Manitoba Tours & Adventures - Tours North"
    if "%%r"=="new-brunswick" set "title=New Brunswick Tours & Adventures - Tours North"
    if "%%r"=="newfoundland-labrador" set "title=Newfoundland Labrador Tours & Adventures - Tours North"
    if "%%r"=="nova-scotia" set "title=Nova Scotia Tours & Adventures - Tours North"
    if "%%r"=="nunavut" set "title=Nunavut Tours & Adventures - Tours North"
    if "%%r"=="ontario" set "title=Ontario Tours & Adventures - Tours North"
    if "%%r"=="pei" set "title=PEI Tours & Adventures - Tours North"
    if "%%r"=="quebec" set "title=Quebec Tours & Adventures - Tours North"
    if "%%r"=="saskatchewan" set "title=Saskatchewan Tours & Adventures - Tours North"
    if "%%r"=="yukon" set "title=Yukon Tours & Adventures - Tours North"

    powershell -Command "(Get-Content '!dir!\index.html') -replace '<title>.*?</title>', '<title>!title!</title>' | Set-Content '!dir!\index.html'"
)

echo Done.
