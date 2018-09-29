
#include "DHT.h"

#define DHTPIN 9     // what digital pin we're connected to

// Uncomment whatever type you're using!
#define DHTTYPE DHT11   // DHT 11
//#define DHTTYPE DHT22   // DHT 22  (AM2302), AM2321
//#define DHTTYPE DHT21   // DHT 21 (AM2301)

int d; //delay counter
float h, t, f, hif, hic;

DHT dht(DHTPIN, DHTTYPE);


int Led = 13; // define LED Interface
int buttonpin = 8; // define the tilt switch sensor interfaces
int val; // define numeric variables val
int shake = 0;
int prev = 0;
int zsum = 0;
int ssum = 0;

int waterPin = A5;
int wthresholdValue = 929;
int waterValue = 0;

int flamePin = A5; // select the input pin for the LDR

int flameValue = 0; // variable to store the value coming from the sensor

int buzz =10;
int smokeA0 = A0;
// Your threshold value
int sensorThres = 400;
int smokeSensor = 0;


int trigPin = 11;    //Trig - green Jumper
int echoPin = 12;    //Echo - yellow Jumper
long duration, cm;

void setup() {

  h = 0.0;
  f = 0.0;
  t = 0.0;
  hic = 0.0;
  hif = 0.0;
  d = 0;
  pinMode(Led, OUTPUT); // define LED as output interface
  pinMode(buttonpin, INPUT); // define the output interface tilt switch sensor
  pinMode(waterPin, INPUT);

  pinMode(flamePin, INPUT);

  pinMode(smokeA0, INPUT);

  pinMode(trigPin, OUTPUT);
  pinMode(echoPin, INPUT);
  cm = 0.0;
  
  Serial.begin(115200);
  Serial.println("Sensor Begin");

  dht.begin();
}

void loop() {
  delay(50);
  d += 50;

  if (d==2000) {
    d = 0; //reset delay
  }

  val = digitalRead(buttonpin);


  if (d%500 == 0) {
     waterValue = analogRead(waterPin);
  }

  if (d%200 == 0) {
    flameValue = analogRead(flamePin);
  }

  if (d%200 == 0) {
    smokeSensor = analogRead(smokeA0);
  }

  if (d%250 == 0) {
    digitalWrite(trigPin, LOW);
  delayMicroseconds(5);
  digitalWrite(trigPin, HIGH);
  delayMicroseconds(10);
  digitalWrite(trigPin, LOW);
 
  // Read the signal from the sensor: a HIGH pulse whose
  // duration is the time (in microseconds) from the sending
  // of the ping to the reception of its echo off of an object.
  pinMode(echoPin, INPUT);
  duration = pulseIn(echoPin, HIGH);
 
  // convert the time into a distance
  cm = (duration/2) / 29.1;
  }
  

  if (d%2000 == 0) {
  // Wait a few seconds between measurements.
  
  // Reading temperature or humidity takes about 250 milliseconds!
  // Sensor readings may also be up to 2 seconds 'old' (its a very slow sensor)
  h = dht.readHumidity();
  // Read temperature as Celsius (the default)
  t = dht.readTemperature();
  // Read temperature as Fahrenheit (isFahrenheit = true)
  f = dht.readTemperature(true);

  // Check if any reads failed and exit early (to try again).
  if (isnan(h) || isnan(t) || isnan(f)) {
    Serial.println("Failed to read from DHT sensor!");
    return;
  }

  // Compute heat index in Fahrenheit (the default)
  hif = dht.computeHeatIndex(f, h);
  // Compute heat index in Celsius (isFahreheit = false)
  hic = dht.computeHeatIndex(t, h, false);
  }


  Serial.print("Humidity: ");
  Serial.print(h);
//  Serial.print(" %\t");
  Serial.print("#Temperature: ");
  Serial.print(t);
//  Serial.print(" *C ");
//  Serial.print(f);
//  Serial.print(" *F\t");
  Serial.print("#Heat index: ");
  Serial.print(hic);
//  Serial.print(" *C ");
//  Serial.print(hif);
//  Serial.println(" *F");

// When the tilt sensor detects a signal when the switch, LED flashes
if (val == HIGH) {
digitalWrite(Led, HIGH);

if (prev == 0) {
  shake = 1;
} else {
  shake = 0;
}

prev = 1;

}
else {
digitalWrite(Led, LOW);
if (prev == 1) {
  shake = 1;
} else {
  shake = 0;
}
prev = 0;
}

if (shake == 0) {
  zsum++;
} else {
  zsum = 0;
  ssum++;
}

if (zsum == 50) {
  ssum = 0;
  zsum = 0;
}

  Serial.print("#quake : ");
  if (ssum > 10) 
  { Serial.print(1);
  }
  else {
    Serial.print(0);
  }
  Serial.print("#");
  Serial.print("shake : ");
  Serial.print(shake);
  Serial.print("#watervalue : ");
  Serial.print(waterValue);

  if(waterValue > wthresholdValue){
    Serial.print("#flood : 1 ");
  }
  else {
    Serial.print("#flood : 0 ");
  }

  Serial.print("#flamevalue : ");
  Serial.print(flameValue);
  
  if (flameValue < 100)

{

Serial.print("#fire : 1");
} else {
  Serial.print("#fire : 0");
}


  Serial.print("#smokeValue: ");
  Serial.print(smokeSensor);
  // Checks if it has reached the threshold value
  if (smokeSensor > sensorThres)
  {
    Serial.print("#smoke : 1");
  }
  else
  {
    Serial.print("#smoke : 0");
  }
  
  Serial.print("#distance: ");
  Serial.print(cm);
  
  
  Serial.println(" ");
  


  
}
