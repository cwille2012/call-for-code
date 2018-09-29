import requests,sys,os,time

text=sys.argv[1]

com = 'curl -X POST -u 2c8c85da-00e5-4be3-95f2-924913f5175e:NPsIIBP52cmz --header "Content-Type: application/json" --header "Accept: audio/wav" --data "{\"text\":\"' + text + '\"}" --output out1.wav "https://stream.watsonplatform.net/text-to-speech/api/v1/synthesize"'

print(com)

os.system(com)
time.sleep(1)
com = 'sox out1.wav out2.wav channels 2'
os.system(com)
com = 'aplay -Dhw:1 out2.wav'
os.system(com)
