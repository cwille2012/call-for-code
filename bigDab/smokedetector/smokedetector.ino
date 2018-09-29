
int buzz =10;
int smokeA0 = A0;
// Your threshold value
int sensorThres = 400;

void setup() {
  pinMode(smokeA0, INPUT);
  Serial.begin(115200);
}

void loop() {
  int analogSensor = analogRead(smokeA0);

  Serial.print("Pin A0: ");
  Serial.println(analogSensor);
  // Checks if it has reached the threshold value
  if (analogSensor > sensorThres)
  {
    tone(buzz, 1000, 200);
  }
  else
  {
    noTone(buzz);
  }
  delay(100);
}
