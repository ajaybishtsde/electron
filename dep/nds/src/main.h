#include "nan.h" 

class DesktopSessionStatus {
public:
    static void Init(v8::Local<v8::Object> exports, v8::Local<v8::Object> module);
    static void GetIsLockedOrOnScreensaver(const Nan::FunctionCallbackInfo<v8::Value>& info);
};