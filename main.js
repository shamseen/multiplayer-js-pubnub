console.log("JS linked!");

/* We're gonna pretend this is lobby.js */
// tutorial keeps all logic in anon function ¯\_(ツ)_/¯

// upon player entering the lobby:
(function () {
    // TO DO: lobby code
    // PubNub
    let lobby = prompt("Enter name of lobby");
    let game = lobby; // game is the channel where the game takes places
    lobby = lobby + 'Lobby'; // separate channel for lobby
    const newUUID = PubNub.generateUUID();
    let isHost = false;
    let ChatEngine = '';
    let GuessWordChatEngine = '';

    console.log(newUUID);


})(); // the end (); calls the anon function :o