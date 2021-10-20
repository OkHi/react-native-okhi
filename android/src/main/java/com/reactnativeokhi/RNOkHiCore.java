package com.reactnativeokhi;

import android.content.Context;

import androidx.annotation.NonNull;

import io.okhi.android_core.OkHiCore;
import io.okhi.android_core.models.OkHiAuth;
import io.okhi.android_core.models.OkHiException;

public class RNOkHiCore extends OkHiCore {
  public RNOkHiCore(@NonNull Context context) throws OkHiException {
    super(context);
  }
  public OkHiAuth getAuth() {
    return auth;
  }
}
