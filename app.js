const express=require('express');
const app=express();
const socket=require('socket.io');
const path=require("path");
const http=require('http');
const {Chess}=require('chess.js');
const server=http.createServer(app);
const io=socket(server);
const chess=new Chess();

let players={};
let currentPlayer="W";

app.set("view engine","ejs");
app.use(express.static(path.join(__dirname,"public")));

app.get("/",function(req,res){
    res.render("index", {title: "Chess Game"});
});

io.on("connection", function(uniquesocket){
    console.log("connected");

    if(!players.white){
        players.white=uniquesocket.id;
        uniquesocket.emit("PlayerRole", "w");
    }
    else if(!players.black){
        players.black=uniquesocket.id;
        uniquesocket.emit("PlayerRole","b");
    }
    else{
        uniquesocket.emit("SpectatorRole");
    }
    uniquesocket.on("disconnect", function(){
        if(uniquesocket.id === players.white.id){
            delete players.white;
        }
        else if(uniquesocket.id === players.black.id){
            delete players.black;
        }
    });
    uniquesocket.on("move", function(move){
        try{
            if(chess.turn() === "W" && uniquesocket.id != players.white.id){
                return;
            }
            if(chess.turn() === "B" && uniquesocket.id != players.players.id){
                return;
            }
            const result=chess.move(move);
            if(result){
                currentPlayer=chess.turn();
                io.emit("move", move);
                io.emit("boardState", chess.fen());
            }
            else{
                console.log("Invalid Move");
                uniquesocket.emit("Invalidmove", move);
            }
        }
        catch(err){
            console.log(err);
            uniquesocket.emit("Invalidmove", move);
        }
    });
});

server.listen(3000, function(){
    console.log("Listening on port 3000");
});