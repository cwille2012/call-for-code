/*
 * --------------------------------------------------------------------------------------------------------------------
 * Example sketch/program showing how to read data from a PICC to serial.
 * --------------------------------------------------------------------------------------------------------------------
 * This is a MFRC522 library example; for further details and other examples see: https://github.com/miguelbalboa/rfid
 * 
 * Example sketch/program showing how to read data from a PICC (that is: a RFID Tag or Card) using a MFRC522 based RFID
 * Reader on the Arduino SPI interface.
 * 
 * When the Arduino and the MFRC522 module are connected (see the pin layout below), load this sketch into Arduino IDE
 * then verify/compile and upload it. To see the output: use Tools, Serial Monitor of the IDE (hit Ctrl+Shft+M). When
 * you present a PICC (that is: a RFID Tag or Card) at reading distance of the MFRC522 Reader/PCD, the serial output
 * will show the ID/UID, type and any data blocks it can read. Note: you may see "Timeout in communication" messages
 * when removing the PICC from reading distance too early.
 * 
 * If your reader supports it, this sketch/program will read all the PICCs presented (that is: multiple tag reading).
 * So if you stack two or more PICCs on top of each other and present them to the reader, it will first output all
 * details of the first and then the next PICC. Note that this may take some time as all data blocks are dumped, so
 * keep the PICCs at reading distance until complete.
 * 
 * @license Released into the public domain.
 * 
 * Typical pin layout used:
 * -----------------------------------------------------------------------------------------
 *             MFRC522      Arduino       Arduino   Arduino    Arduino          Arduino
 *             Reader/PCD   Uno/101       Mega      Nano v3    Leonardo/Micro   Pro Micro
 * Signal      Pin          Pin           Pin       Pin        Pin              Pin
 * -----------------------------------------------------------------------------------------
 * RST/Reset   RST          9             5         D9         RESET/ICSP-5     RST
 * SPI SS      SDA(SS)      10            53        D10        10               10
 * SPI MOSI    MOSI         11 / ICSP-4   51        D11        ICSP-4           16
 * SPI MISO    MISO         12 / ICSP-1   50        D12        ICSP-1           14
 * SPI SCK     SCK          13 / ICSP-3   52        D13        ICSP-3           15
 */

#include <SPI.h>
#include <MFRC522.h>
#include <Keypad.h>

#define RST_PIN         5          // Configurable, see typical pin layout above
#define SS_PIN          53         // Configurable, see typical pin layout above

MFRC522 mfrc522(SS_PIN, RST_PIN);  // Create MFRC522 instance

// NeoPixel

#include <Adafruit_NeoPixel.h>

// Which pin on the Arduino is connected to the NeoPixels?
// On a Trinket or Gemma we suggest changing this to 1
#define NEOPIXEL_PIN            6

// How many NeoPixels are attached to the Arduino?
#define NUMPIXELS      24

// When we setup the NeoPixel library, we tell it how many pixels, and which pin to use to send signals.
// Note that for older NeoPixel strips you might need to change the third parameter--see the strandtest
// example for more information on possible values.
Adafruit_NeoPixel pixels = Adafruit_NeoPixel(NUMPIXELS, NEOPIXEL_PIN, NEO_GRB + NEO_KHZ800);

const byte ROWS = 4; //four rows
const byte COLS = 3; //four columns
char keys[ROWS][COLS] = {
  {'1','2','3'},
  {'4','5','6'},
  {'7','8','9'},
  {'*','0','#'}
};

byte rowPins[ROWS] = {13, 12, 11, 10}; //connect to the row pinouts of the keypad
byte colPins[COLS] = {9, 8, 7}; //connect to the column pinouts of the keypad

Keypad keypad = Keypad( makeKeymap(keys), rowPins, colPins, ROWS, COLS );
int count;
char code[5];
char incode[5];
int incomingByte = 0;
char incomingchar;
int incount;


void setup() {
  pixels.begin(); // This initializes the NeoPixel library.

  count = 0;
  incount = 0;
  
  Serial.begin(115200);   // Initialize serial communications with the PC
  while (!Serial);    // Do nothing if no serial port is opened (added for Arduinos based on ATMEGA32U4)
  SPI.begin();      // Init SPI bus
  mfrc522.PCD_Init();   // Init MFRC522
  mfrc522.PCD_DumpVersionToSerial();  // Show details of PCD - MFRC522 Card Reader details
  Serial.println(F("Scan PICC to see UID, SAK, type, and data blocks..."));
}

void blinkRing() {
   for(int i=0;i<NUMPIXELS;i++){
    // pixels.Color takes RGB values, from 0,0,0 up to 255,255,255
    pixels.setPixelColor(i, pixels.Color(0,20,0)); // Moderately bright green color.
  }
   pixels.show(); // This sends the updated pixel color to the hardware.
   delay(500);
  for(int i=0;i<NUMPIXELS;i++){
    pixels.setPixelColor(i, pixels.Color(0,0,0)); // Moderately bright green color.
  }
   pixels.show(); // This sends the updated pixel color to the hardware.
}

void loop() {
    char key = keypad.getKey();
  
  if (key){
    if (key!='#') {
      //Serial.println(key);
    }
    if (key=='#') {
      count = 0;
      //strcpy(code, 'AAAAAA');
      for (int i = 0; i < 4; i++) {
        code[i] = "A"; 
      }
    } else {
      if (key=='*') {
        Serial.print('$');
        Serial.println(code);
        count = 0;
        //strcpy(code, 'AAAAAA');                    //reset the code
         for (int i = 0; i < 4; i++) {
           code[i] = "A"; 
      }
      }
      else {
        code[count] = key;
        count++;
      }
    }
    //code[count] = key;
    //count ++;
  }
  if(count==4) {
    //Serial.print('$');
    //Serial.println(code);
    for (int i = 0; i <4; i++) {
      if(code[i]!=incode[i]) {
        //Serial.println("incorrect code. try again");     //incorrect code, counter reset
        //Serial.println("#fail");
        //pulseWhite(5); 
        //break;
      }
      if (i==3) {
        //Serial.println("correct code. access granted");  //correct code, counter reset
        Serial.print('#');
        Serial.print(code[0]);
        Serial.print(code[1]);
        Serial.print(code[2]);
        Serial.println(code[3]);
        //Serial.println("#pass");
        //rainbowFade2White(3,3,1);
        if (code[0]=='7' && code[1]=='3' && code[2]=='3' && code[3]=='1') {
          blinkRing();
        }
      }
    }
    count = 0;
  }
  
  
  
  
  
  // Look for new cards
  
  if ( ! mfrc522.PICC_IsNewCardPresent()) {
    return;
  }

  // Select one of the cards
  if ( ! mfrc522.PICC_ReadCardSerial()) {
    return;
  }

  // Dump debug info about the card; PICC_HaltA() is automatically called
  mfrc522.PICC_DumpToSerial(&(mfrc522.uid));
  Serial.println(mfrc522.uid.uidByte[0]);
//  Serial.println(mfrc522.uid.uidByte[1]);
//  Serial.println(mfrc522.uid.uidByte[2]);
//  Serial.println(mfrc522.uid.uidByte[3]);

  if (mfrc522.uid.uidByte[0]==8) {
      blinkRing();
      Serial.println("#NFC");
  }
//  blinkRing();
//  Serial.println("#NFC");
   

  
}
