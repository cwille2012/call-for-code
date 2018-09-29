int waterPin = A5;
int greenLED = 6;
int redLED = 7;
// can adjust the threshold value
int wthresholdValue = 929;

void setup(){
  pinMode(waterPin, INPUT);
  Serial.begin(115200);
}

void loop() {
  // read the input on analog pin 0:
  int waterValue = analogRead(waterPin);
  Serial.print(waterValue);
  if(waterValue > wthresholdValue){
    Serial.println(" significant water detected");
  }
  else {
    Serial.println(" minimal water detected");
  }
  delay(500);
}
