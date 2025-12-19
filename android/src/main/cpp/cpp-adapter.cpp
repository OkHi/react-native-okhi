#include <jni.h>
#include "OkhiOnLoad.hpp"

JNIEXPORT jint JNICALL JNI_OnLoad(JavaVM* vm, void*) {
  return margelo::nitro::okhi::initialize(vm);
}
