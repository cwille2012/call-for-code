int flamePin = A5; // select the input pin for the LDR

int flameValue = 0; // variable to store the value coming from the sensor



void setup() {

// declare the ledPin and buzzer as an OUTPUT:
  pinMode(flamePin, INPUT);

Serial.begin(115200);

}

void loop()

{

Serial.println("Flame Sensor");

flameValue = analogRead(flamePin);

Serial.println(flameValue);

if (flameValue < 100)

{

Serial.println("Fire Detected");
} else {
  Serial.println("Fire Not Detected");
}

delay(200);


}
