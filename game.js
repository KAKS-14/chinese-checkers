const canvas = document.getElementById('board');
const ctx = canvas.getContext('2d');
const difficultySelect = document.getElementById('difficulty');
const restartBtn = document.getElementById('restart');

// Simple 2-player mini Chinese Checkers (family-friendly, stable)
// Board is a reduced star to keep gameplay smooth

const RADIUS = 12;
let selected = null;
let currentPlayer = 1; // 1 = human, 2 = AI

const positions = [
  {x:300,y:60},{x:270,y:90},{x:330,y:90},
  {x:240,y:120},{x:300,y:120},{x:360,y:120},
  {x:210,y:150},{x:270,y:150},{x:330,y:150},{x:390,y:150},
  {x:240,y:180},{x:300,y:180},{x:360,y:180},
  {x:270,y:210},{x:330,y:210},

  {x:270,y:310},{x:330,y:310},
  {x:240,y:340},{x:300,y:340},{x:360,y:340},
  {x:210,y:370},{x:270,y:370},{x:330,y:370},{x:390,y:370},
  {x:240,y:400},{x:300,y:400},{x:360,y:400},
  {x:270,y:430},{x:330,y:430},
  {x:300,y:460}
];

let pieces;

function resetGame() {
  pieces = positions.map((p,i)=>({
    ...p,
    owner: i < 10 ? 1 : i > positions.length-11 ? 2 : 0
  }));
  currentPlayer = 1;
  selected = null;
  draw();
}

function draw() {
  ctx.clearRect(0,0,canvas.width,canvas.height);

  pieces.forEach((p,i)=>{
    ctx.beginPath();
    ctx.arc(p.x,p.y,RADIUS,0,Math.PI*2);

    if (p.owner === 1) ctx.fillStyle = '#8b2e2e'; // dark red wood marble
    else if (p.owner === 2) ctx.fillStyle = '#2e4f8b'; // blue wood marble
    else ctx.fillStyle = '#cbbfa3'; // empty hole

    ctx.fill();
    ctx.strokeStyle = '#5a4a2f';
    ctx.stroke();

    if (selected === i) {
      ctx.strokeStyle = '#ffd700';
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.lineWidth = 1;
    }
  });
}

function getMoves(index) {
  const moves = [];
  const a = pieces[index];
  pieces.forEach((b,j)=>{
    if (b.owner !== 0) return;
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    const dist = Math.hypot(dx,dy);
    if (dist < 35) moves.push(j); // simple step
  });
  return moves;
}

canvas.addEventListener('click', e => {
  if (currentPlayer !== 1) return;
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  pieces.forEach((p,i)=>{
    if (Math.hypot(p.x-x,p.y-y) < RADIUS) {
      if (p.owner === 1) selected = i;
      else if (selected !== null && p.owner === 0) {
        const moves = getMoves(selected);
        if (moves.includes(i)) {
          p.owner = 1;
          pieces[selected].owner = 0;
          selected = null;
          currentPlayer = 2;
          draw();
          setTimeout(aiMove, 400);
        }
      }
    }
  });
  draw();
});

function aiMove() {
  const level = difficultySelect.value;
  const aiPieces = pieces.map((p,i)=>({...p,index:i})).filter(p=>p.owner===2);

  let best;

  aiPieces.forEach(p=>{
    const moves = getMoves(p.index);
    moves.forEach(m=>{
      const score = level==='easy' ? Math.random() :
                    level==='medium' ? pieces[m].y :
                    pieces[m].y + Math.random()*50;
      if (!best || score > best.score) best = {from:p.index,to:m,score};
    });
  });

  if (best) {
    pieces[best.to].owner = 2;
    pieces[best.from].owner = 0;
  }

  currentPlayer = 1;
  draw();
}

restartBtn.onclick = resetGame;
resetGame();
