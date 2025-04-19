#!/usr/bin/python3
#from this page: https://github.com/platformio/platform-espressif32/issues/1078

# Adds PlatformIO post-processing to merge all the ESP flash images into a single image.
import os

Import("env", "projenv") # type: ignore

# Need to run pio run -t buildfs
board_config = env.BoardConfig() # type: ignore
firmware_bin = "${BUILD_DIR}/${PROGNAME}.bin"
board_name = board_config.get("name", "unknownboard").replace(" ", "_")  # Replace spaces with underscores
merged_bin = os.environ.get("MERGED_BIN_PATH", "${BUILD_DIR}/" + board_name + "-merged.bin")


print("FLASH_EXTRA_IMAGES: %s\n" % env["FLASH_EXTRA_IMAGES"]) # type: ignore
print("ESP32_APP_OFFSET: %s\n" % env["ESP32_APP_OFFSET"]) # type: ignore
#print(env.Dump())

def merge_bin_action(source, target, env):
    env.Execute("pio run -t buildfs")
    
    print("XXXXXXXXX Sources:")
    for s in source:
        print(s.name)

    flash_images = [
        *env.Flatten(env.get("FLASH_EXTRA_IMAGES", [])),
        "$ESP32_APP_OFFSET",
        firmware_bin
        #source[0].get_abspath(),
    ]
    merge_cmd = " ".join(
        [
            '"$PYTHONEXE"',
            '"$OBJCOPY"',
            "--chip",
            board_config.get("build.mcu", "esp32"),
            "merge_bin",
            "-o",
            merged_bin,
            "--flash_mode",
            board_config.get("build.flash_mode", "dio"),
            "--flash_freq",
            "${__get_board_f_flash(__env__)}",
            "--flash_size",
            board_config.get("upload.flash_size", "4MB"),
            *flash_images,
            "0x210000 .pio/build/esp32-poe/spiffs.bin"
        ]
    )
    env.Execute(merge_cmd)

# /Users/paulkilroy/dev/JuanFi-Cleanups/.pio/build/esp32-poe/firmware.bin 
env.AddPostAction(firmware_bin, merge_bin_action) # type: ignore

env.AddCustomTarget( # type: ignore
    name="mergebin",
    dependencies=firmware_bin,
    actions=merge_bin_action,
    title="Merge binary",
    description="Build combined image",
    always_build=True,
)