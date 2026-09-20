
let selectedSquare = null;
let turn = 'W';
let isBotMode = false;
let botColor ='G';

// 1. مصفوفة أماكن القطع
const board = [
  ["GR", "GN", "GB", "GQ", "GK", "GB", "GN", "GR"],
  ["GP", "GP", "GP", "GP", "GP", "GP", "GP", "GP"],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  ["WP", "WP", "WP", "WP", "WP", "WP", "WP", "WP"],
  ["WR", "WN", "WB", "WQ", "WK", "WB", "WN", "WR"]
];

// 2. أسماء الصور
const pieceImages = {
  'G': {
    'R': 'gold_rook.jpg',
    'N': 'gold_knight.jpg',
    'B': 'gold_bishop.jpg',
    'Q': 'gold_queen.jpg',
    'K': 'gold_king.jpg',
    'P': 'gold_pawn.jpg'
  },
  'W': {
    'R': 'white_rook.jpg',
    'N': 'white_knight.jpg',
    'B': 'white_bishop.jpg',
    'Q': 'white_queen.jpg',
    'K': 'white_king.jpg',
    'P': 'white_pawn.jpg'
  }
};

// 3. كائن الأصوات (تأكد من وجود اسم ملف صوت العسكري2 المجهز عندك)
const sounds = {
  'P': new Audio('sounds/askare.aac'),
  'lastPawn': new Audio('sounds/askare2.aac'), // صوت العسكري الثاني/الأخير
  'N': new Audio('sounds/hors.mpeg'),
  'B': new Audio('sounds/elefant.aac'),
  'R': new Audio('sounds/tabea.aac'),
  'Q': new Audio('sounds/wazer.mp3'),
  'K': new Audio('sounds/king.aac'),
  'capture': new Audio('sounds/darb.mpeg'),
  'kash': new Audio('sounds/kash.aac')
};

// دالة عد العساكر المتبقية للاعب
function countPawns(color) {
  let count = 0;
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      if (board[r][c] === color + 'P') {
        count++;
      }
    }
  }
  return count;
}

// دالة تشغيل الأصوات الذكية
function playPieceSound(pieceType, isCapture, color) {
  let audioToPlay;

  if (isCapture) {
    audioToPlay = sounds['capture'];
  } else if (pieceType === 'P') {
    const pawnsLeft = countPawns(color);
    if (pawnsLeft === 1) {
      audioToPlay = sounds['lastPawn']; // تشغيل صوت العسكري الأخير لو فاضل واحد بس
    } else {
      audioToPlay = sounds['P'];
    }
  } else {
    audioToPlay = sounds[pieceType];
  }

  if (audioToPlay) {
    audioToPlay.currentTime = 0;
    audioToPlay.play().catch(e => console.log("خطأ صوت:", e));
  }
}

// 4. دالة بناء الرقعة
function createChessBoard() {
  clearDots();
  const boardContainer = document.getElementById('board');

  if (!boardContainer) {
    console.error("لم يتم العثور على id='board'");
    return;
  }

  boardContainer.innerHTML = '';

  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const square = document.createElement('div');
      square.classList.add('square');
      square.addEventListener('click', () => handleSquareClick(row, col));
      square.dataset.row = row;
      square.dataset.col = col;

      if ((row + col) % 2 === 0) {
        square.classList.add('light-square');
      } else {
        square.classList.add('dark-square');
      }

      const pieceCode = board[row][col];
      if (pieceCode) {
        const color = pieceCode[0];
        const type = pieceCode[1];
        const imgElement = document.createElement('img');
        imgElement.src = pieceImages[color][type];
        imgElement.classList.add('piece-img');
        square.appendChild(imgElement);
      }

      boardContainer.appendChild(square);
    }
  }
}

function handleSquareClick(row, col) {
  document.querySelectorAll('#board .square').forEach(sq => {
    sq.classList.remove('highlight', 'selected');
    sq.querySelectorAll('div, span, button').forEach(child => child.remove());
  });

  if (!selectedSquare) {
          // باقي كودك كمل بيه عادي..
    if (board[row][col] && board[row][col][0] === turn) {
      selectedSquare = { row, col };
      highlightSquare(row, col);
      showPossibleMoves(row, col);
    }
  } else {
    const fromRow = selectedSquare.row;
    const fromCol = selectedSquare.col;

    if (board[row][col] && board[row][col][0] === turn) {
      selectedSquare = { row, col };
      highlightSquare(row, col);
      showPossibleMoves(row, col);
      return;
    }

    if (isSafeMove(fromRow, fromCol, row, col)) {
      const isCapture = board[row][col] !== null;
      const movedPiece = board[fromRow][fromCol];
      const movedPieceType = movedPiece[1];
      const movedPieceColor = movedPiece[0];

      // نقل القطعة
      board[row][col] = movedPiece;
      board[fromRow][fromCol] = null;

      // 👑 الترقية لوزير
      if (movedPieceType === 'P') {
        if ((movedPieceColor === 'W' && row === 0) || (movedPieceColor === 'G' && row === 7)) {
          board[row][col] = movedPieceColor + 'Q';
        }
      }

      // تشغيل الصوت
      playPieceSound(movedPieceType, isCapture, turn);
      const nextPlayer = (turn === 'W') ? 'G' : 'W';

    try {
      if (typeof isCheckmateStatus === 'function' && isCheckmateStatus(nextPlayer)) {
        if (sounds['kash']) {
          sounds['kash'].play();
        }
      }
    } catch (e) {
      console.log(e);
    }

    turn = nextPlayer;
    selectedSquare = null;
    createChessBoard();
 
console.log ("isBotMode:",isBotMode,"turn:", turn, "botColor:" , botColor);

    if (isBotMode && turn === botColor) {
      makeBotMove();
    }
    
    } else {
      selectedSquare = null;
      document.querySelectorAll('.square').forEach(sq => sq.classList.remove('selected'));
      document.querySelectorAll('.move-dot').forEach(dot => dot.remove());
    }
  }
}


// 6. دالة تحديد المربع الذهبي
function highlightSquare(row, col) {
  document.querySelectorAll('.square').forEach(sq => sq.classList.remove('selected'));
  const squares = document.querySelectorAll('.square');
  const index = row * 8 + col;
  if (squares[index]) {
    squares[index].classList.add('selected');
  }
}

// 7. إظهار النقط الرمادية
function showPossibleMoves(fromRow, fromCol) {
  const squares = document.querySelectorAll('.square');
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      if (isSafeMove(fromRow, fromCol, r, c)) {
        const index = r * 8 + c;
        if (squares[index]) {
          const dot = document.createElement('div');
          dot.classList.add('move-dot');
          squares[index].appendChild(dot);
        }
      }
    }
  }
}

// 8. مسح النقط الرمادية
function clearDots() {
  document.querySelectorAll('.move-dot').forEach(dot => dot.remove());
}

// 9. قواعد الحركة الأساسية
function checkBasicMove(fromRow, fromCol, toRow, toCol) {
  const piece = board[fromRow][fromCol];
  const target = board[toRow][toCol];
  if (!piece) return false;

  const type = piece[1];
  const rowDiff = toRow - fromRow;
  const colDiff = toCol - fromCol;
  const absRow = Math.abs(rowDiff);
  const absCol = Math.abs(colDiff);

  if (target !== null && target[0] === piece[0]) return false;

  switch (type) {
    case 'P':
      const direction = (piece[0] === 'W') ? -1 : 1;
      const startRow = (piece[0] === 'W') ? 6 : 1;
      if (colDiff === 0 && rowDiff === direction && target === null) return true;
      if (colDiff === 0 && rowDiff === 2 * direction && fromRow === startRow && target === null && board[fromRow + direction][fromCol] === null) return true;
      if (absCol === 1 && rowDiff === direction && target !== null) return true;
      return false;

    case 'R':
      if (fromRow !== toRow && fromCol !== toCol) return false;
      return isPathClear(fromRow, fromCol, toRow, toCol);

    case 'B':
      if (absRow !== absCol) return false;
      return isPathClear(fromRow, fromCol, toRow, toCol);

    case 'Q':
      if (fromRow !== toRow && fromCol !== toCol && absRow !== absCol) return false;
      return isPathClear(fromRow, fromCol, toRow, toCol);

    case 'K':
      return absRow <= 1 && absCol <= 1;

    case 'N':
      return (absRow === 2 && absCol === 1) || (absRow === 1 && absCol === 2);

    default:
      return false;
  }
}

// 10. التأكد من خلو المسار
function isPathClear(fromRow, fromCol, toRow, toCol) {
  const rowStep = Math.sign(toRow - fromRow);
  const colStep = Math.sign(toCol - fromCol);
  let currRow = fromRow + rowStep;
  let currCol = fromCol + colStep;

  while (currRow !== toRow || currCol !== toCol) {
    if (board[currRow][currCol] !== null) return false;
    currRow += rowStep;
    currCol += colStep;
  }
  return true;
}

// 11. نظام حماية الملك والأمان
function findKing(color) {
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      if (board[r][c] === color + 'K') return { row: r, col: c };
    }
  }
  return null;
}

function isKingInCheck(color) {
  const kingPos = findKing(color);
  if (!kingPos) return false;

  const enemyColor = (color === 'W') ? 'G' : 'W';

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      if (piece && piece[0] === enemyColor) {
        if (checkBasicMove(r, c, kingPos.row, kingPos.col)) {
          return true;
        }
      }
    }
  }
  return false;
}

function isSafeMove(fromRow, fromCol, toRow, toCol) {
  if (!checkBasicMove(fromRow, fromCol, toRow, toCol)) return false;

  const playerColor = board[fromRow][fromCol][0];
  const tempTarget = board[toRow][toCol];

  board[toRow][toCol] = board[fromRow][fromCol];
  board[fromRow][fromCol] = null;

  const inCheck = isKingInCheck(playerColor);

  board[fromRow][fromCol] = board[toRow][toCol];
  board[toRow][toCol] = tempTarget;

  return !inCheck;
}

// تشغيل اللعبة
// ربط زرار "جنب بعض" بتشغيل اللعبة وإخفاء القائمة
document.getElementById('btn-local').addEventListener('click', () => {
  document.getElementById('menu-screen').style.display = 'none'; // إخفاء القائمة
  document.getElementById('game-screen').style.display = 'block'; // إظهار شاشة اللعبة
  createChessBoard(); // بناء رقعة الشطرنج وبداية اللعب
});

// ربط زرار "ضد كمبيوتر" بتشغيل اللعبة والتمكين للبوت
document.getElementById('btn-bot').addEventListener('click', () => {
  isBotMode = true;
  document.getElementById('menu-screen').style.display = 'none';
  document.getElementById('game-screen').style.display = 'block';
  createChessBoard();
});


// دالة تفحص هل اللاعب عليه كش وهل معندوش أي حركة آمنة متبقية
function isCheckmateStatus(playerColor) {
  // أولاً: التأكد أن الملك عليه كش حالياً
  if (typeof isKingInCheck === 'function' && !isKingInCheck(playerColor)) {
    return false; // لو الملك مش عليه كش اصلاً يبقى مش كش مات
  }

  // ثانياً: التأكد هل فيه أي حركة آمنة تقدر تنهي الكش
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      if (board[r][c] && board[r][c][0] === playerColor) {
        for (let toR = 0; toR < 8; toR++) {
          for (let toC = 0; toC < 8; toC++) {
            if (typeof isSafeMove === 'function' && isSafeMove(r, c, toR, toC)) {
              return false; // لقيناله حركة تنجيه من الكش!
            }
          }
        }
      }
    }
  }

  return true; // الملك عليه كش ومعندوش ولا حركة يهرب بيها (كش مات)
}
 
// 1. دالة حساب قيمة القطعة الأساسية
function getPieceValue(piece) {
  if (!piece) return 0;
  const type = piece.charAt(1);
  switch (type) {
      case 'P': return 10;
      case 'N': return 30;
      case 'B': return 30;
      case 'R': return 50;
      case 'Q': return 90;
      case 'K': return 900;
      default: return 0;
  }
}

// 2. دالة تقييم الرقعة بالكامل (حساب نقاط البوت - نقاط اللاعب)
function evaluateBoard(currentBoard) {
  let totalScore = 0;
  for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
          const piece = currentBoard[r][c];
          if (piece) {
              let value = getPieceValue(piece);
              
              // إضافة بونص خفيف للسيطرة على منتصف الرقعة (السنتر)
              if ((r >= 2 && r <= 5) && (c >= 2 && c <= 5)) {
                  value += 2;
              }

              if (piece.startsWith(botColor)) {
                  totalScore += value;
              } else {
                  totalScore -= value;
              }
          }
      }
  }
  return totalScore;
}

// 3. دالة تجلب كل التحركات المتاحة للون معين
function getAllValidMovesForColor(currentBoard, color) {
  let moves = [];
  for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
          const piece = currentBoard[r][c];
          if (piece && piece.startsWith(color)) {
              for (let targetR = 0; targetR < 8; targetR++) {
                  for (let targetC = 0; targetC < 8; targetC++) {
                      if (typeof isSafeMove === 'function' && isSafeMove(r, c, targetR, targetC)) {
                          moves.push({
                              fromR: r, fromC: c,
                              toR: targetR, toC: targetC,
                              piece: piece
                          });
                      }
                  }
              }
          }
      }
  }
  return moves;
}

// 4. خوارزمية Minimax لتوقع الخطوات المستقبليّة
function minimax(currentBoard, depth, isMaximizing) {
  if (depth === 0) {
      return evaluateBoard(currentBoard);
  }

  const opponentColor = (botColor === 'G') ? 'W' : 'G'; // تحديد لون المنافس تلقائياً

  if (isMaximizing) {
      let maxEval = -Infinity;
      let moves = getAllValidMovesForColor(currentBoard, botColor);
      
      for (let move of moves) {
          // محاكاة الحركة افتراضياً
          let originalTarget = currentBoard[move.toR][move.toC];
          currentBoard[move.toR][move.toC] = move.piece;
          currentBoard[move.fromR][move.fromC] = null;

          let evaluation = minimax(currentBoard, depth - 1, false);

          // التراجع عن الحركة
          currentBoard[move.fromR][move.fromC] = move.piece;
          currentBoard[move.toR][move.toC] = originalTarget;

          maxEval = Math.max(maxEval, evaluation);
      }
      return maxEval;
  } else {
      let minEval = Infinity;
      let moves = getAllValidMovesForColor(currentBoard, opponentColor);

      for (let move of moves) {
          // محاكاة حركة اللاعب
          let originalTarget = currentBoard[move.toR][move.toC];
          currentBoard[move.toR][move.toC] = move.piece;
          currentBoard[move.fromR][move.fromC] = null;

          let evaluation = minimax(currentBoard, depth - 1, true);

          // التراجع عن الحركة
          currentBoard[move.fromR][move.fromC] = move.piece;
          currentBoard[move.toR][move.toC] = originalTarget;

          minEval = Math.min(minEval, evaluation);
      }
      return minEval;
  }
}

// 5. الدالة الرئيسية لتحريك البوت
function makeBotMove() {
  if (!isBotMode || turn !== botColor) return;

  let validMoves = getAllValidMovesForColor(board, botColor);
  if (validMoves.length === 0) return;

  let bestMove = null;
  let bestValue = -Infinity;

  // البوت يجرب كل حركة ويشوف أسطر المستقبل بـ Minimax
  for (let move of validMoves) {
      let originalTarget = board[move.toR][move.toC];
      board[move.toR][move.toC] = move.piece;
      board[move.fromR][move.fromC] = null;

      // عمق التفكير = 2 (بيحسب حركته ورَدّك أنت)
      let boardValue = minimax(board, 2, false);

      board[move.fromR][move.fromC] = move.piece;
      board[move.toR][move.toC] = originalTarget;

      if (boardValue > bestValue) {
          bestValue = boardValue;
          bestMove = move;
      }
  }

  // تنفيذ أفضل حركة واقعياً على الرقعة
  if (bestMove) {
      setTimeout(() => {
          let targetPiece = board[bestMove.toR][bestMove.toC];
          board[bestMove.toR][bestMove.toC] = bestMove.piece;
          board[bestMove.fromR][bestMove.fromC] = null;

          // تشغيل الصوت الخاص بالحركة أو الأكل
          if (typeof playPieceSound === 'function') {
            let isCapture = targetPiece !== null;
            let opponentColor = (turn === 'G') ? 'W' : 'G';

            if (typeof isCheckmateStatus === 'function' && isCheckmateStatus(opponentColor)) {
                if (sounds['kash']) {
                    sounds['kash'].currentTime = 0;
                    sounds['kash'].play();
                }
            } else {
                playPieceSound(bestMove.piece.charAt(1), isCapture, turn);
            }
          }
          turn = (botColor === 'G') ? 'W' : 'G';
          if (typeof createChessBoard === 'function') createChessBoard();
      }, 300);
  }
}





