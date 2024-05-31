#include <ApplicationServices/ApplicationServices.h>

#include "desktop_session_status.h"

bool IsLockedOrOnScreensaver() {
    CFDictionaryRef sessionDict = CGSessionCopyCurrentDictionary();
    if (sessionDict == NULL) {
        return false;
    }
    CFBooleanRef sessionScreenIsLockedRef = (CFBooleanRef)CFDictionaryGetValue(sessionDict, CFSTR("CGSSessionScreenIsLocked"));
    bool sessionScreenIsLocked = sessionScreenIsLockedRef ? CFBooleanGetValue(sessionScreenIsLockedRef) : false;
    CFBooleanRef sessionOnConsoleKeyRef = (CFBooleanRef)CFDictionaryGetValue(sessionDict, CFSTR("kCGSSessionOnConsoleKey"));
    bool sessionOnConsoleKey = sessionOnConsoleKeyRef ? CFBooleanGetValue(sessionOnConsoleKeyRef) : false;
    CFRelease(sessionDict);
    return sessionScreenIsLocked || !sessionOnConsoleKey;
}