import os

Import("env") # type: ignore

# pio run -t buildfs

def after_build(source, target, env):
    env.Execute("pio run -t buildfs")

    print("XXXXXXXXXXXXXXXXXXXXXXXXXXXX in after build")

env.AddPostAction("$BUILD_DIR/${PROGNAME}.elf", after_build) # type: ignore
print("XXXXXXXXXXXXXXXXXXXXXXXXXXXX in main")
