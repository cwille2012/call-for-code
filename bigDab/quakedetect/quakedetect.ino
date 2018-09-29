

int Led = 13; // define LED Interface
int buttonpin = 8; // define the tilt switch sensor interfaces
int val; // define numeric variables val
int shake = 0;
int prev = 0;
int zsum = 0;
int ssum = 0;

void setup () {
pinMode(Led, OUTPUT); // define LED as output interface
pinMode(buttonpin, INPUT); // define the output interface tilt switch sensor
Serial.begin(115200);
}

void loop () {
val = digitalRead(buttonpin); // digital interface will be assigned a value of 3 to read val

delay(50);

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

  Serial.print(" quake detected ");
  if (ssum > 10) 
  { Serial.print(" yes ");
  }
  else {
    Serial.print(" no ");
  }
  Serial.println(" ");
  Serial.print(" shake value ");
  Serial.print(shake);
  Serial.println(" ");


}
