/*******************************************************
 * From here:
 * https://e2e.ti.com/support/sensor/inductive-sensing/f/938/t/518107
 * Tested with ESP8266 (Wemos D1 mini pro)
 */

#include <Wire.h>

int LDC = 0x2A;
int CH0MSB = 0x00;
int CH0LSB = 0x01;
int CH1MSB = 0x02;
int CH1LSB = 0x03;



unsigned long readChannel0()
{
  unsigned long val = 0;
  word c = 0;
  word d = 0;
  c = readValue(LDC, CH0MSB);
  d = readValue(LDC, CH0LSB);
  val = c;
  val <<= 16;
  val += d;
  return val;
}

 

unsigned long readChannel1()
{
  unsigned long val = 0;
  word c = 0;
  word d = 0;
  c = readValue(LDC, CH1MSB);
  d = readValue(LDC, CH1LSB);
  val = c;
  val <<= 16;
  val += d;
  return val;
}

 

word readValue (int LDC, int reg)
{
  int a = 0;
  int b = 0;
  word value = 0;
  Wire.beginTransmission(LDC);
  Wire.write(reg);
  Wire.endTransmission();
  Wire.requestFrom(LDC, 2);
  while (Wire.available())
  {
    a = Wire.read();
    b = Wire.read();
  }
  value = a;
  value <<= 8;
  value += b;
  return value;
}

 

void writeConfig(int LDC, int reg, int MSB, int LSB)
{
  Wire.beginTransmission(LDC);
  Wire.write(reg);
  Wire.write(MSB);
  Wire.write(LSB);
  Wire.endTransmission();
}

void Configuration()
{
  writeConfig(LDC, 0x14, 0x10, 0x02);//CLOCK_DIVIDERS_CH0
  writeConfig(LDC, 0x1E, 0x90, 0x00);//DRIVE_CURRENT_CH0
  writeConfig(LDC, 0x10, 0x00, 0x0A);//SETTLECOUNT_CH0
  writeConfig(LDC, 0x08, 0x04, 0xD6);//RCOUNT_CH0
  writeConfig(LDC, 0x15, 0x10, 0x02);//CLOCK_DIVIDERS_CH1
  writeConfig(LDC, 0x1F, 0x90, 0x00);//DRIVE_CURRENT_CH1
  writeConfig(LDC, 0x11, 0x00, 0x0A);//SETTLECOUNT_CH1
  writeConfig(LDC, 0x09, 0x04, 0xD6);//RCOUNT_CH1
  writeConfig(LDC, 0x19, 0x00, 0x00);//ERROR_CONFIG
  writeConfig(LDC, 0x1B, 0x82, 0x0C);//MUX_CONFIG
}

 

 

void setup()
{
  Wire.begin(D2, D1);
  Serial.begin(115200);
  Configuration();
  delay(500);
//  Calibrate();
}

 

void loop()
{
  unsigned long data0 = readChannel0();
  unsigned long data1 = readChannel1();
  Serial.print(data0);
  Serial.print(" ");
  Serial.println(data1);
  delay(100);
}


