# Websockets

## Events

All messages are sent as stringified JSON

| For?           | Mesasge sent   | Content                         | Additional keys                      |
|----------------|----------------|---------------------------------|--------------------------------------|
| section update | section_update | HTML of section                 | `section`: which section was updated |
| changed video  | video          | 11 base64 character ID of video |                                      |
| new T0         | time           | unix timestamp (in ms) of T0    |                                      |
