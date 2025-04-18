// Not Needed #define LOG_LOCAL_LEVEL ESP_LOG_VERBOSE
// Doesn't seem to work#define CONFIG_LOG_DEFAULT_LEVEL ESP_LOG_VERBOSE
// Not in this version -- CONFIG_LOG_MASTER_LEVEL 1
// Not in this version -- #define CONFIG_LOG_TAG_LEVEL_IMPL CONFIG_LOG_TAG_LEVEL_IMPL_NONE 
#include "globals.h"
#include <esp_log.h>
#include <stdio.h>
#include <stdarg.h>
#include <Arduino.h> // Include Arduino for Serial

#define USE_ESP_IDF_LOG 1
// Custom vprintf function to write directly using Serial.print
int customLogFunction(const char *fmt, va_list args) {
Serial.println("cLF");
    char buffer[256]; // Buffer to hold the formatted log message
    int charsWritten = vsnprintf(buffer, sizeof(buffer), fmt, args); // Format the message

    if (charsWritten > 0) {
        Serial.print(buffer); // Write the formatted message to the serial port
    }

    // Create another thread to write to file and rotate files if needed

//Serial.print("pk");
    return charsWritten; // Return the number of characters written
}

void loggerSetup() {
    // Initialize Serial if not already initialized
    Serial.begin(115200); // Set baud rate to 115200
    delay(3000); // Wait for Serial to initialize 

    Serial.println("pk");
    // Set log level to ERROR for all components (global setting)
    // https://docs.espressif.com/projects/esp-idf/en/latest/esp32/api-reference/system/log.html#log-level-control
    // https://docs.espressif.com/projects/esp-idf/en/latest/esp32/api-reference/kconfig-reference.html#config-log-tag-level-impl
    // CONFIG_LOG_TAG_LEVEL_IMPL
    esp_log_level_set("*", ESP_LOG_VERBOSE);

    // Set log level to WARNING for the WiFi component (module-specific setting)
    //esp_log_level_set("wifi", ESP_LOG_INFO);

    // Set log level to INFO for the DHCP client (module-specific setting)
    //esp_log_level_set("dhcpc", ESP_LOG_INFO);
    //esp_log_level_set(TAG, ESP_LOG_INFO);
    //esp_log_set_level_master( ESP_LOG_INFO);
    //esp_log_get_default_level();

    ESP_LOGI(TAG, "Rerouting custom logger!");

    /*
    #define ESP_LOGI( tag, format, ... ) ESP_LOG_LEVEL_LOCAL(ESP_LOG_INFO,    tag, format, ##__VA_ARGS__)
    #define ESP_LOG_LEVEL_LOCAL(level, tag, format, ...) do {               \
        if ( LOG_LOCAL_LEVEL >= level ) ESP_LOG_LEVEL(level, tag, format, ##__VA_ARGS__); \
    } while(0)
    else                                { esp_log_write(ESP_LOG_INFO,       tag, LOG_FORMAT(I, format), esp_log_timestamp(), tag, ##__VA_ARGS__); } \
    */

    //Serial.println("pk");

    // Set the custom vprintf function
    esp_log_set_vprintf(customLogFunction);

    // Example log message
    ESP_LOGI(TAG, "Custom logger initialized!");
}

/*
// This function will be called by the ESP log library every time ESP_LOG needs to be performed.
//      @important Do NOT use the ESP_LOG* macro's in this function ELSE recursive loop and stack overflow! So use printf() instead for debug messages.
int _log_vprintf(const char *fmt, va_list args) {
    static bool static_fatal_error = false;
    static const uint32_t WRITE_CACHE_CYCLE = 5;
    static uint32_t counter_write = 0;
    int iresult;

    // #1 Write to SPIFFS
    if (_log_remote_fp == NULL) {
        printf("%s() ABORT. file handle _log_remote_fp is NULL\n", __FUNCTION__);
        return -1;
    }
    if (static_fatal_error == false) {
        iresult = vfprintf(_log_remote_fp, fmt, args);
        if (iresult < 0) {
            printf("%s() ABORT. failed vfprintf() -> disable future vfprintf(_log_remote_fp) \n", __FUNCTION__);
            // MARK FATAL
            static_fatal_error = true;
            return iresult;
        }

        // #2 Smart commit after x writes
        counter_write++;
        if (counter_write % WRITE_CACHE_CYCLE == 0) {
            /////printf("%s() fsync'ing log file on SPIFFS (WRITE_CACHE_CYCLE=%u)\n", WRITE_CACHE_CYCLE);
            fsync(fileno(_log_remote_fp));
        }
    }

    // #3 ALWAYS Write to stdout!
    return vprintf(fmt, args);
}
    */