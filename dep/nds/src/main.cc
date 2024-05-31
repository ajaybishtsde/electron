#include "main.h"
#include "desktop_session_status.h"

void DesktopSessionStatus::GetIsLockedOrOnScreensaver(const Nan::FunctionCallbackInfo<v8::Value>& info) {
    Nan::HandleScope scope;
    bool res = IsLockedOrOnScreensaver();
    info.GetReturnValue().Set(res);
}

void DesktopSessionStatus::Init(v8::Local<v8::Object> exports, v8::Local<v8::Object> module) {
    Nan::SetMethod(exports, "isLockedOrOnScreensaver", DesktopSessionStatus::GetIsLockedOrOnScreensaver);    
}

NODE_MODULE(desktop_session_status, DesktopSessionStatus::Init)