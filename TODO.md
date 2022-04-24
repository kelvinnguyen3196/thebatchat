# design
## front end
## backend
## database
- collections
    - rooms // stores room information
        - document schema:
        {
            name: string,
            expiration: date,
            messages: [{    // stores messages
                username,   // user who sent the message
                message     // message
            }, etc],
            users: [{   // stores users in this room
                name    // name of user
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