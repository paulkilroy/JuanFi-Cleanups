#include "globals.h"

#include <WiFi.h>

bool InSimulator = false;
bool FirstTimeSetup = false;

void setup() {
    /*  
    Serial.begin(9600);
    Serial.print("Connecting to WiFi");
    WiFi.begin("Wokwi-GUEST", "", 6);
    while (WiFi.status() != WL_CONNECTED) {
      delay(100);
      Serial.print(".");
    }
    Serial.println(" Connected!");

*/
    loggerSetup();
    log_i("Setup started");

    // Initialize the components
    if(!SPIFFS.begin()){
        log_e("FATAL: Error has occurred while mounting SPIFFS");
        return;
    }  
    networkSetup();
    if( !webSetup() ) {
        log_e("FATAL: Error has occurred while setting up web server");
        return;
    }

    log_i("Setup completed - Running webLoop()");
}

void loop() {
  webLoop();
}
