# design
## front end
### landing page
- ask user for name
### room select
- user will select or create a room
- send data to express server to handle creation of room
## backend
- endpoints
    - POST /create-room - create a room with name
        - req.body = 
        {
            "roomName": _
        }
    - GET /room-info - returns room's messages, # active, and expiration date
        - ?roomName=

# features
## minimum
- [] select name when login
- [] create chat rooms
- [] enter chat rooms
- [] send messages
- [] receive message in real time with sockets
- [] blinking cursor sound

## extra
- [] change to predefined themes
- [] received messages will be displayed one word at a time