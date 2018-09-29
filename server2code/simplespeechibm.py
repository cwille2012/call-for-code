import json
from watson_developer_cloud import SpeechToTextV1

IBM_USERNAME = "1059ec50-962a-4d22-9c72-bb56c1cda9c9"
IBM_PASSWORD = "iwr61enGer1J"

stt = SpeechToTextV1(username=IBM_USERNAME, password=IBM_PASSWORD)
audio_file = open("test1.wav", "rb")


with open('transcript_result.json', 'w') as fp:
    result = stt.recognize(audio_file, content_type="audio/wav",
                           continuous=True, timestamps=False,
                           max_alternatives=1)
    json.dump(result, fp, indent=2)

    print(result)
