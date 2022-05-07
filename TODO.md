# TODO
- [] room.js line 59 make it make negate if so that there is less nesting

# design
## front end
## server

## api endpoints
- GET /rooms            // gets all room information (names and expiration)
- GET /room             // gets room information for specific room
- POST /createRoom      // create a new room

## database
- collections
    - rooms // stores room information
        - document schema:
        {
            roomName: string,
            expiration: date,
            messages: [{    // stores messages
                username,   // user who sent the message
                message     // message
            }, etc]
        }

# features
## minimum
- [] select name when login
- [] create chat rooms
- [] enter chat rooms
- [] send messages
- [] receive message in real time with sockets

## extra
- [] change to predefined themes
- [] received messages will be displayed one word at a time
- [] blinking cursor sound