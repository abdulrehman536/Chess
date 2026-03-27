const socket=io();
const chess=new Chess();

let boardElement=document.querySelector(".chesscontainer");

let draggedPiece=null;
let sourceSquare=null;
let PlayerRole=null;

const renderBoard=()=>{
    
    const board=chess.board();
    boardElement.innerHTML="";
    board.forEach((row, rowindex)=>{
        row.forEach((square, squareindex)=>{
            const squareElement=document.createElement("div");
            squareElement.classList.add("square",
                (rowindex + squareindex) % 2 === 0 ? "Light" : "Dark"
            );
            squareElement.dataset.row=rowindex;
            squareElement.dataset.col=squareindex;
            if(square){
                const pieceElement=document.createElement("div");
                pieceElement.classList.add("piece", square.color === "w" ? "white" : "black");
                pieceElement.innerText=getPiceUniCode(square);
                console.log(PlayerRole);
                console.log(square.color);
                pieceElement.draggable = PlayerRole === square.color;
                pieceElement.addEventListener("dragstart", (e)=>{
                    if(pieceElement.draggable){
                        console.log("Yes");
                        draggedPiece = pieceElement;
                        sourceSquare={row: rowindex, col: squareindex};
                        e.dataTransfer.setData("text/plain", "");
                    }
                });
                pieceElement.addEventListener("dragend", (e)=>{
                    draggedPiece=null;
                    sourceSquare=null;
                });
                squareElement.appendChild(pieceElement);
            }
            squareElement.addEventListener("dragover", (e)=>{
                e.preventDefault();
            });
            squareElement.addEventListener("drop", (e)=>{
                e.preventDefault();
                if(draggedPiece){
                    const targetsquare={
                        row: parseInt(squareElement.dataset.row),
                        col: parseInt(squareElement.dataset.col)
                    }
                    handleMove(sourceSquare,targetsquare);
                }
            });
            boardElement.appendChild(squareElement);
        });
    });
    if(PlayerRole === "b"){
        boardElement.classList.add("flipped");
    }
    boardElement.classList.remove("flipped");
}

const handleMove=(source, target)=>{
    const move={
        from: `${String.fromCharCode(97+source.col)}${8-source.row}`,
        to: `${String.fromCharCode(97+target.col)}${8-target.row}`,
        promotion: 'q'
    };
    socket.emit("move", move);
}

socket.on("PlayerRole", function(role){
    PlayerRole=role;
    renderBoard();
});

socket.on("SpectatorRole", function(){
    PlayerRole=null;
    renderBoard();
});

socket.on("boardState", function(fen){
    chess.load(fen);
    renderBoard();
});

socket.on("move", function(move){
    chess.move(move);
    renderBoard();
});

const getPiceUniCode=(piece)=>{
    const unicodePieces={
        p: "♟",
        r: "♜",
        n: "♞",
        b: "♝",
        q: "♛",
        k: "♚",
        P: "♙",
        R: "♖",
        N: "♘",
        B: "♗",
        Q: "♕",
        K: "♔",
    };
    return unicodePieces[piece.type] || "";
}

renderBoard();