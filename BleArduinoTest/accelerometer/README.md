# Accelerometer BLE service

This sketch runs on Genuino 101 (Arduino) and it creates
4 BLE characteristics notifying onboard accelerometers
X, Y, Z values and current uptime.

Values contain measured minimun and maximum values from X, Y and Z
and in addition the biggest change between 2 readings, e.g.:

```
Value X: 0.15;0.23;0.08
Value Y: -0.55;-0.21;0.09
Value Z: 0.19;1.78;0.30
```

