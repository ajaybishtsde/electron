#include <windows.h>
#include <shlobj.h>
#pragma comment(lib, "shell32.lib")

#include "desktop_session_status.h"

bool IsLockedOrOnScreensaver() {
    QUERY_USER_NOTIFICATION_STATE state;
    HRESULT res = SHQueryUserNotificationState(&state);
    if (res != S_OK) {
        return false;
    }
    return state == QUNS_NOT_PRESENT;
}