/*
   Copyright (c) 2016 Intel Corporation.  All rights reserved.
   See the bottom of this file for the license terms.

   This is just for testing a Notify characteristic.
   Modified by Aapo Rista @ Forum Virium Helsinki / Vekotinverstas (Gadget factory)
   This sketch has been tested in Genuino 101 device.
*/

#include <CurieBLE.h>

/*
   This sketch example partially implements the standard Bluetooth Low-Energy Battery service.
   For more information: https://developer.bluetooth.org/gatt/services/Pages/ServicesHome.aspx
*/

/*  */
BLEPeripheral blePeripheral;       // BLE Peripheral Device (the board you're programming)
BLEService dummyService("6665");   // Some random dummy Service (hopefully it does not exist already)

// BLECharacteristic accepts char arrays.
BLECharacteristic dummyChar("6666",  // standard 16-bit characteristic UUID
    BLERead | BLENotify, 10);             // remote clients will be able to
                                          // get notifications if this characteristic changes

int oldBatteryLevel = 0;  // last battery level reading from analog input
long previousMillis = 0;  // last time the battery level was checked, in ms

void setup() {
  Serial.begin(115200);    // initialize serial communication
  pinMode(13, OUTPUT);   // initialize the LED on pin 13 to indicate when a central is connected
  Serial.println("Setup()");

  /* Set a local name for the BLE device
     This name will appear in advertising packets
     and can be used by remote devices to identify this BLE device
     The name can be changed but maybe be truncated based on space left in advertisement packet */
  blePeripheral.setLocalName("DummyChar");
  blePeripheral.setAdvertisedServiceUuid(dummyService.uuid());  // add the service UUID
  blePeripheral.addAttribute(dummyService);   // Add the BLE Dummy service
  blePeripheral.addAttribute(dummyChar);      // add the dummy characteristic
  dummyChar.setValue("0");


  /* Now activate the BLE device.  It will start continuously transmitting BLE
     advertising packets and will be visible to remote BLE central devices
     until it receives a new connection */
  blePeripheral.begin();
  Serial.println("Bluetooth device active, waiting for connections...");
}

void loop() {
  // listen for BLE peripherals to connect:
  BLECentral central = blePeripheral.central();

  // if a central is connected to peripheral:
  if (central) {
    Serial.print("Connected to central: ");
    // print the central's MAC address:
    Serial.println(central.address());
    // turn on the LED to indicate the connection:
    digitalWrite(13, HIGH);

    // send dummy data every 5000ms
    // as long as the central is still connected:
    while (central.connected()) {
      updateBatteryLevel();
      delay(5000);
    }
    // when the central disconnects, turn off the LED:
    digitalWrite(13, LOW);
    Serial.print("Disconnected from central: ");
    Serial.println(central.address());
  }
}

void updateBatteryLevel() {
  /* Read the current voltage level on the A0 analog input pin.
     This is used here to simulate the charge level of a battery.
  */
  int ms = millis();  // Read current "uptime"
  // Weird conversions from weird Arduino variable types to another :)
  char dummyCharArray[10] = { 0, (char)ms };
  String str_ms = String(ms);
  str_ms.toCharArray(dummyCharArray, 10);    // setValue wants char array
  dummyChar.setValue(dummyCharArray);        // and update the dummy characteristic  
  Serial.print("setValue: ");
  Serial.println(str_ms);
}

/*
   Copyright (c) 2016 Intel Corporation.  All rights reserved.

   This library is free software; you can redistribute it and/or
   modify it under the terms of the GNU Lesser General Public
   License as published by the Free Software Foundation; either
   version 2.1 of the License, or (at your option) any later version.

   This library is distributed in the hope that it will be useful,
   but WITHOUT ANY WARRANTY; without even the implied warranty of
   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
   Lesser General Public License for more details.

   You should have received a copy of the GNU Lesser General Public
   License along with this library; if not, write to the Free Software
   Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301  USA
*/
