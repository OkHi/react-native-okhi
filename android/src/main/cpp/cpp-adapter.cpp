#include <jni.h>
#include "OkhiNitroOnLoad.hpp"

JNIEXPORT jint JNICALL JNI_OnLoad(JavaVM* vm, void*) {
  return margelo::nitro::okhinitro::initialize(vm);
}
