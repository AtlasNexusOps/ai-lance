# Default ProGuard rules for Trusted Web Activity
-keepattributes *Annotation*
-keepattributes SourceFile,LineNumberTable
-keep public class * extends android.app.Activity
-keep public class * extends android.app.Application
-keep public class * extends android.app.Service
-keep public class * extends android.content.BroadcastReceiver
-keep public class * extends android.content.ContentProvider

# Keep the TWA launcher activity
-keep class com.google.androidbrowserhelper.** { *; }
-dontwarn com.google.androidbrowserhelper.**
