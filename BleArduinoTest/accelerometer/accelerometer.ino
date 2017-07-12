/*
   Copyright (c) 2016 Intel Corporation.  All rights reserved.
   See the bottom of this file for the license terms.

   This is just for testing a Notify characteristic.
   Modified by Aapo Rista @ Forum Virium Helsinki / Vekotinverstas (Gadget factory)
   This sketch has been tested in Genuino 101 device.
*/

#include <CurieBLE.h>
#include "CurieIMU.h"

//#define EVENT_DRIVEN

/*
   This sketch example partially implements the standard Bluetooth Low-Energy Battery service.
   For more information: https://developer.bluetooth.org/gatt/services/Pages/ServicesHome.aspx
*/


BLEPeripheral blePeripheral;  // BLE Peripheral Device (the board you're programming)

// Some random accel Service (hopefully it does not exist already):
BLEService accelService("19B10010-E8F2-537E-4F6C-D104768A1214");   

// Create characteristics for uptime and XYZ values of accelerometer
// BLECharacteristic accepts char arrays.
BLECharacteristic uptimeChar("19B10011-E8F2-537E-4F6C-D104768A1214", BLERead | BLENotify, 10);
BLECharacteristic accelCharX("19B10012-E8F2-537E-4F6C-D104768A1214", BLERead | BLENotify, 10);
BLECharacteristic accelCharY("19B10013-E8F2-537E-4F6C-D104768A1214", BLERead | BLENotify, 10);
BLECharacteristic accelCharZ("19B10014-E8F2-537E-4F6C-D104768A1214", BLERead | BLENotify, 10);

// default min and max values, they must be creater than what is set in setAccelerometerRange()
float minmax = 100.0;  

int oldBatteryLevel = 0;  // last battery level reading from analog input
unsigned long previousMillis = 0;  // last time the battery level was checked, in ms
unsigned long previousMillis_acc = 0;  // last time the battery level was checked, in ms

void setup() {
  Serial.begin(115200);    // initialize serial communication
  pinMode(13, OUTPUT);   // initialize the LED on pin 13 to indicate when a central is connected
  Serial.println("Setup IMU");
  CurieIMU.begin();

#ifdef EVENT_DRIVEN
  /* Enable Shock Detection */
  CurieIMU.attachInterrupt(eventCallback);
  CurieIMU.setDetectionThreshold(CURIE_IMU_SHOCK, 2000); // 1.5g = 1500 mg
  CurieIMU.setDetectionDuration(CURIE_IMU_SHOCK, 50);   // 50ms
  CurieIMU.interrupts(CURIE_IMU_SHOCK);
  Serial.println("IMU initialisation complete, waiting for events...");
#else
  // Set the accelerometer range to 2, 4, 8 or 16 G
  CurieIMU.setAccelerometerRange(16);
#endif

  Serial.println("Setup BLE");

  /* Set a local name for the BLE device
     This name will appear in advertising packets
     and can be used by remote devices to identify this BLE device
     The name can be changed but maybe be truncated based on space left in advertisement packet */
  blePeripheral.setLocalName("Accelerometer (Genuino 101)");
  blePeripheral.setAdvertisedServiceUuid(accelService.uuid());  // add the service UUID
  blePeripheral.addAttribute(accelService);    // Add the BLE accel service
  blePeripheral.addAttribute(uptimeChar);      // add the uptime characteristic
  blePeripheral.addAttribute(accelCharX);      // add the accel characteristic
  blePeripheral.addAttribute(accelCharY);      // add the accel characteristic
  blePeripheral.addAttribute(accelCharZ);      // add the accel characteristic
  accelCharX.setValue("0");
  accelCharY.setValue("0");
  accelCharZ.setValue("0");

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

#ifndef EVENT_DRIVEN
    float ax, ay, az;   // scaled accelerometer values
    float ax_old = 0, ay_old = 0, az_old = 0;  // previous values
    float ax_min = minmax, ay_min = minmax, az_min = minmax; 
    float ax_max = -minmax, ay_max = -minmax, az_max = -minmax;
    float ax_vol = 0, ay_vol = 0, az_vol = 0; // volatility
    float vol = 0;
#endif
    // send accel data every 5000ms
    // as long as the central is still connected:
    while (central.connected()) {
#ifndef EVENT_DRIVEN
      CurieIMU.readAccelerometerScaled(ax, ay, az);
      
      // Save the biggest X, Y and Z change between 2 readings
      vol = abs(ax-ax_old);
      if (vol > ax_vol) { ax_vol = vol;}
      vol = abs(ay-ay_old);
      if (vol > ay_vol) { ay_vol = vol;}
      vol = abs(az-az_old);
      if (vol > az_vol) { az_vol = vol;}
      
      // Save min value for X, Y, Z during measuring period
      if (ax < ax_min) { ax_min = ax;}
      if (ay < ay_min) { ay_min = ay;}
      if (az < az_min) { az_min = az;}

      // Save max value for X, Y, Z during measuring period
      if (ax > ax_max) { ax_max = ax;}
      if (ay > ay_max) { ay_max = ay;}
      if (az > az_max) { az_max = az;}

      // Save values for next read
      ax_old = ax, ay_old = ay, az_old = az;
      
      if ((previousMillis_acc + 1000) < millis()) {
        previousMillis_acc = millis();
        updateAccel(ax_min, ay_min, az_min, ax_max, ay_max, az_max, ax_vol, ay_vol, az_vol);
        ax_min = ax_min = minmax, ay_min = minmax, az_min = minmax;
        ax_max = ax_max = -minmax, ay_max = -minmax, az_max = -minmax;
        ax_vol = 0, ay_vol = 0, az_vol = 0;
      }
#endif
      if ((previousMillis + 10000) < millis()) {
        previousMillis = millis();
        updateUptime();
      }

    }
    // when the central disconnects, turn off the LED:
    digitalWrite(13, LOW);
    Serial.print("Disconnected from central: ");
    Serial.println(central.address());
  }
}

void updateUptime() {
  /* Read the current voltage level on the A0 analog input pin.
     This is used here to simulate the charge level of a battery.
  */
  int ms = millis();  // Read current "uptime"
  // Weird conversions from weird Arduino / C variable types to another :)
  char accelCharArray[10] = { 0, (char)ms };
  String str_acc = String(ms);
  str_acc.toCharArray(accelCharArray, 10);    // setValue wants char array
  uptimeChar.setValue(accelCharArray);       // and update the accel characteristic  
  Serial.print("setValue: ");
  Serial.println(str_acc);
}

// Update all accel characteristic values
void updateAccel(float ax_min, float ay_min, float az_min, 
                 float ax_max, float ay_max, float az_max,
                 float ax_vol, float ay_vol, float az_vol) {

  char accelCharArray[20] = { 0, (char)ax_min };

  // Please advice me how to do this without Strings and with plain char arrays?
  String str_acc = String(String(ax_min, 2) + String(";") + String(ax_max, 2) + String(";") + String(ax_vol, 2));
  str_acc.toCharArray(accelCharArray, 20);    // setValue wants char array
  accelCharX.setValue(accelCharArray);        // and update the accel characteristic  
  Serial.print("setValue X: ");
  Serial.println(str_acc);

  str_acc = String(String(ay_min, 2) + String(";") + String(ay_max, 2) + String(";") + String(ay_vol, 2));
  str_acc.toCharArray(accelCharArray, 20);    // setValue wants char array
  accelCharY.setValue(accelCharArray);        // and update the accel characteristic  
  Serial.print("setValue Y: ");
  Serial.println(str_acc);

  str_acc = String(String(az_min, 2) + String(";") + String(az_max, 2) + String(";") + String(az_vol, 2));
  str_acc.toCharArray(accelCharArray, 20);    // setValue wants char array
  accelCharZ.setValue(accelCharArray);        // and update the accel characteristic  
  Serial.print("setValue Z: ");
  Serial.println(str_acc);
}

#ifdef EVENT_DRIVEN
static void eventCallback(void)
{
  if (CurieIMU.getInterruptStatus(CURIE_IMU_SHOCK)) {    
    if (CurieIMU.shockDetected(X_AXIS, POSITIVE))
      Serial.println("Negative shock detected on X-axis");
      accelCharX.setValue("-X");
    if (CurieIMU.shockDetected(X_AXIS, NEGATIVE))
      Serial.println("Positive shock detected on X-axis");
      accelCharX.setValue("+X");
    if (CurieIMU.shockDetected(Y_AXIS, POSITIVE))
      Serial.println("Negative shock detected on Y-axis");
      accelCharY.setValue("-Y");
    if (CurieIMU.shockDetected(Y_AXIS, NEGATIVE))
      Serial.println("Positive shock detected on Y-axis");
      accelCharY.setValue("+Y");
    if (CurieIMU.shockDetected(Z_AXIS, POSITIVE))
      Serial.println("Negative shock detected on Z-axis");
      accelCharZ.setValue("-Z");
    if (CurieIMU.shockDetected(Z_AXIS, NEGATIVE))
      Serial.println("Positive shock detected on Z-axis");
      accelCharZ.setValue("+Z");
  }
}
#endif

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
