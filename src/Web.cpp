#include "globals.h"
#include <SSLCert.hpp>
#include <HTTPSServer.hpp>
#include <HTTPRequest.hpp>
#include <HTTPResponse.hpp>
#include <ArduinoJson.h>
#include <SPIFFS.h>
#include <FS.h>
//#include <Base64.h>

// use https://github.com/fhessel/esp32_https_server if I want security
// https://github.com/Ant2000/CustomJWT


//AsyncWebServer httpsServer(443);
//AsyncAuthenticationMiddleware auth;
// The HTTPS Server comes in a separate namespace. For easier use, include it here.
using namespace httpsserver;
SSLCert cert;
HTTPSServer * secureServer;

void handleRoot(HTTPRequest * req, HTTPResponse * res) {
    //res->send(SPIFFS, "/admin/system-config.html", "text/html");
	// We want to deliver an HTML page, so we set the content type
	res->setHeader("Content-Type", "text/html");
	// The response implements the Print interface, so you can use it just like
	// you would write to Serial etc.
	res->println("<!DOCTYPE html>");
	res->println("<html>");
	res->println("<head><title>Hello World!</title></head>");
	res->println("<body>");
	res->println("<h1>Hello World!</h1>");
	res->print("<p>... from your ESP32!</p>");
	res->println("</body>");
	res->println("</html>");}

void handle404(HTTPRequest * req, HTTPResponse * res) {
    res->setHeader("Content-Type", "text/html");

    res->print("Not found");
}
    // Now, we use the function createSelfSignedCert to create private key and certificate.
  // The function takes the following paramters:
  // - Key size: 1024 or 2048 bit should be fine here, 4096 on the ESP might be "paranoid mode"
  //   (in generel: shorter key = faster but less secure)
  // - Distinguished name: The name of the host as used in certificates.
  //   entry pointing to your ESP32. You can try to insert an IP there, but that's not really good style.
  // - Dates for certificate validity (optional, default is 2019-2029, both included)
  //   Format is YYYYMMDDhhmmss


    // If you're working on a serious project, this would be a good place to initialize some form of non-volatile storage
  // and to put the certificate and the key there. This has the advantage that the certificate stays the same after a reboot
  // so your client still trusts your server, additionally you increase the speed-up of your application.
  // Some browsers like Firefox might even reject the second run for the same issuer name (the distinguished name defined above).
  //
  // Storing:
  //   For the key:
  //     cert->getPKLength() will return the length of the private key in byte
  //     cert->getPKData() will return the actual private key (in DER-format, if that matters to you)
  //   For the certificate:
  //     cert->getCertLength() and ->getCertData() do the same for the actual certificate data.
  // Restoring:
  //   When your applications boots, check your non-volatile storage for an existing certificate, and if you find one
  //   use the parameterized SSLCert constructor to re-create the certificate and pass it to the HTTPSServer.
  //
  // A short reminder on key security: If you're working on something professional, be aware that the storage of the ESP32 is
  // not encrypted in any way. This means that if you just write it to the flash storage, it is easy to extract it if someone
  // gets a hand on your hardware. You should decide if that's a relevant risk for you and apply countermeasures like flash
  // encryption if neccessary
bool webSetup() {
    const char *certPath = "/server.crt";
    const char *keyPath = "/server.key";

    // Check if certificate and private key files exist in SPIFFS
    if (SPIFFS.exists(certPath) && SPIFFS.exists(keyPath)) {
        Serial.println("Certificate and private key found in SPIFFS. Reading...");

        File certFile = SPIFFS.open(certPath, "r");
        File keyFile = SPIFFS.open(keyPath, "r");

        if (certFile && keyFile) {
            size_t certLen = certFile.size();
            size_t keyLen = keyFile.size();

            Serial.printf("Certificate file size: %d bytes\n", certLen);
            Serial.printf("Private key file size: %d bytes\n", keyLen);

            // Make sure they are null terminated
            // NOTE from esp idf header file:
            // Pointer to certificate data in PEM ... format for server verify (with SSL), default is NULL, not required to verify the server. PEM-format must have a terminating NULL-character. DER-format requires the length to be passed in cert_len.
            uint8_t *certData = new uint8_t[certLen + 1];
            uint8_t *keyData = new uint8_t[keyLen + 1];

            size_t certBytesRead = certFile.read(certData, certLen);
            size_t keyBytesRead = keyFile.read(keyData, keyLen);

            Serial.printf("Bytes read from certificate file: %d\n", certBytesRead);
            Serial.printf("Bytes read from private key file: %d\n", keyBytesRead);
/*
            // Encode certificate and key data to Base64 for readability
            String certBase64 = base64::encode(certData, certLen);
            String keyBase64 = base64::encode(keyData, keyLen);

            Serial.println("Loaded Certificate (Base64):");
            Serial.println(certBase64);
            Serial.println("Loaded Private Key (Base64):");
            Serial.println(keyBase64);
            */
           
            // Null-terminate the buffers
            certData[certLen] = '\0';
            keyData[keyLen] = '\0';

            certFile.close();
            keyFile.close();

            cert = SSLCert(certData, certLen, keyData, keyLen);

            /* Can't delete these, this memory is used my the webserver
            delete[] certData;
            delete[] keyData;
            */

            Serial.println("Certificate and private key loaded successfully.");
        } else {
            Serial.println("Failed to read certificate or private key from SPIFFS.");
            return false;
        }
    } else {
        Serial.println("Certificate and private key not found. Generating new ones...");

        // Generate a new self-signed certificate
        int createCertResult = createSelfSignedCert(
            cert,
            KEYSIZE_2048,
            "CN=ellafi.local,O=EllaFi,C=DE",
            "20190101000000",
            "20300101000000"
        );

        if (createCertResult != 0) {
            Serial.printf("Creating certificate failed. Error Code = 0x%02X, check SSLCert.hpp for details\n", createCertResult);
            return false;
        }

        Serial.println("Certificate created successfully. Saving to SPIFFS...");
/*
        // Debug: Print the generated certificate and private key
        String certBase64 = base64::encode(cert.getCertData(), cert.getCertLength());
        String keyBase64 = base64::encode(cert.getPKData(), cert.getPKLength());

        Serial.println("Generated Certificate (Base64):");
        Serial.println(certBase64);
        Serial.println("Generated Private Key (Base64):");
        Serial.println(keyBase64);
        */

        // Save the private key to SPIFFS
        File keyFile = SPIFFS.open(keyPath, "w");
        if (keyFile) {
            size_t keyBytesWritten = keyFile.write(cert.getPKData(), cert.getPKLength());
            Serial.printf("Bytes written to private key file: %d\n", keyBytesWritten);
            keyFile.close();
            Serial.println("Private key saved to SPIFFS.");
        } else {
            Serial.println("Failed to save private key to SPIFFS.");
        }

        // Save the certificate to SPIFFS
        File certFile = SPIFFS.open(certPath, "w");
        if (certFile) {
            size_t certBytesWritten = certFile.write(cert.getCertData(), cert.getCertLength());
            Serial.printf("Bytes written to certificate file: %d\n", certBytesWritten);
            certFile.close();
            Serial.println("Certificate saved to SPIFFS.");
        } else {
            Serial.println("Failed to save certificate to SPIFFS.");
        }
    }

    // Set up the HTTPS server
    secureServer = new HTTPSServer(&cert);

    // For every resource available on the server, we need to create a ResourceNode
    // The ResourceNode links URL and HTTP method to a handler function
    ResourceNode *nodeRoot = new ResourceNode("/", "GET", &handleRoot);
    ResourceNode *node404 = new ResourceNode("", "GET", &handle404);

    // Add the root node to the server
    secureServer->registerNode(nodeRoot);
    // Add the 404 not found node to the server.
    secureServer->setDefaultNode(node404);

    Serial.println("Starting server...");
    secureServer->start();
    if (!secureServer->isRunning()) {
        Serial.println("Server failed.");
        return false;
    }
    Serial.println("Server started successfully.");
    return true;
}

bool webLoop() {
    // This call will let the server do its work
    secureServer->loop();
  
    // Other code would go here...
    delay(1);
    return true;
  }