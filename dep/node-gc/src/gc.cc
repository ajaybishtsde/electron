#include <nan.h>

NAN_METHOD(Collect) {
  info.GetIsolate()->IdleNotificationDeadline(0.5);
}

void Init(v8::Local<v8::Object> target){
  Nan::SetMethod(target, "collect", Collect);
}

NODE_MODULE(gc, Init);
