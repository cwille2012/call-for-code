from flask import Flask
from twilio.twiml.voice_response import Record, VoiceResponse, Say

app = Flask(__name__)


@app.route("/answer", methods=['GET', 'POST'])
def answer_call():
    """Respond to incoming phone calls with a brief message."""
    # Start our TwiML response
    resp = VoiceResponse()

    # Read a message aloud to the caller
    resp.say("Thank you for calling the alert hotline. Please record your alert message at the beep. Press the star key to end.", voice='alice')
    resp.record(
    action='http://859b7b5f.ngrok.io/data',
    method='GET',
    max_length=20,
    finish_on_key='*')

    return str(resp)

if __name__ == "__main__":
    app.run(debug=True, port = 8001)
