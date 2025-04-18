
#include <IPAddress.h>
#include <SPIFFS.h> 
#include <Arduino.h>

#define AP_SSID "EllaFi-setup"

extern bool InSimulator;
extern bool FirstTimeSetup;

void networkSetup();
bool ethUp();
bool wifiUp();
bool hotspotUp();
String getSSID();
String getPSK();
bool networkUp();
const char* activeHostname();
IPAddress activeLocalIP();
IPAddress activeSubnetMask();
IPAddress activeGatewayIP();

void loggerSetup();
bool webSetup();
bool webLoop();
