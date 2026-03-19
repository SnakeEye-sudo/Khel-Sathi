"use strict";
(() => {
  // src/app.ts
  (() => {
    const root = document.getElementById("appRoot");
    if (!root) return;
    const state = {
      board: Array(9).fill(""),
      current: "X",
      mode: "friend",
      score: { X: 0, O: 0, draws: 0 },
      locked: false
    };
    root.innerHTML = `
    <section class="section-stack">
      <article class="tool-card">
        <div class="toolbar">
          <div>
            <p class="eyebrow">Game board</p>
            <h3>Tic tac toe in family style</h3>
          </div>
          <div class="button-row">
            <button class="mode-btn active" data-mode="friend" type="button">Vs friend</button>
            <button class="mode-btn" data-mode="bot" type="button">Vs bot</button>
          </div>
        </div>
        <div class="board" id="board"></div>
        <div class="result-panel">
          <p class="mini-label">Turn update</p>
          <strong class="result-number" id="statusText">Player X ki baari</strong>
          <div class="button-row">
            <button class="action-btn primary" id="restartBtn" type="button">Restart round</button>
          </div>
        </div>
      </article>
    </section>

    <aside class="section-stack">
      <article class="info-card">
        <p class="eyebrow">Scoreboard</p>
        <div class="score-row"><span>X wins</span><strong id="scoreX">0</strong></div>
        <div class="score-row"><span>O wins</span><strong id="scoreO">0</strong></div>
        <div class="score-row"><span>Draws</span><strong id="scoreD">0</strong></div>
      </article>
      <article class="info-card">
        <p class="eyebrow">Quick rules</p>
        <div class="history-grid">
          <div class="history-card"><strong>3 in a row</strong><span class="muted">Line, column, ya diagonal.</span></div>
          <div class="history-card"><strong>Vs bot</strong><span class="muted">Bot immediate win aur block dono check karta hai.</span></div>
        </div>
      </article>
    </aside>
  `;
    const wins = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6]
    ];
    const boardEl = document.getElementById("board");
    const statusText = document.getElementById("statusText");
    const scoreX = document.getElementById("scoreX");
    const scoreO = document.getElementById("scoreO");
    const scoreD = document.getElementById("scoreD");
    function checkWinner(mark) {
      return wins.some((combo) => combo.every((idx) => state.board[idx] === mark));
    }
    function availableMoves() {
      return state.board.map((cell, idx) => cell ? null : idx).filter((value) => value !== null);
    }
    function updateScore() {
      scoreX.textContent = String(state.score.X);
      scoreO.textContent = String(state.score.O);
      scoreD.textContent = String(state.score.draws);
    }
    function renderBoard() {
      if (!boardEl) return;
      boardEl.innerHTML = state.board.map((mark, idx) => `<button class="grid-btn ${mark ? "primary" : ""}" data-index="${idx}" type="button">${mark}</button>`).join("");
    }
    function setStatus(text) {
      statusText.textContent = text;
    }
    function finishRound(message) {
      state.locked = true;
      setStatus(message);
      updateScore();
      renderBoard();
    }
    function aiMove() {
      if (state.mode !== "bot" || state.locked) return;
      const moves = availableMoves();
      if (!moves.length) return;
      const tryMark = (mark) => {
        for (const move2 of moves) {
          state.board[move2] = mark;
          const won = checkWinner(mark);
          state.board[move2] = "";
          if (won) return move2;
        }
        return null;
      };
      const winning = tryMark("O");
      const blocking = tryMark("X");
      const preferred = [4, 0, 2, 6, 8, 1, 3, 5, 7];
      const move = winning ?? blocking ?? preferred.find((item) => moves.includes(item)) ?? moves[0];
      playMove(move);
    }
    function playMove(index) {
      if (state.locked || state.board[index]) return;
      state.board[index] = state.current;
      if (checkWinner(state.current)) {
        state.score[state.current] += 1;
        finishRound(`Player ${state.current} jeet gaya`);
        return;
      }
      if (!availableMoves().length) {
        state.score.draws += 1;
        finishRound("Round draw ho gaya");
        return;
      }
      state.current = state.current === "X" ? "O" : "X";
      renderBoard();
      setStatus(state.mode === "bot" && state.current === "O" ? "Bot soch raha hai..." : `Player ${state.current} ki baari`);
      if (state.mode === "bot" && state.current === "O") {
        window.setTimeout(aiMove, 420);
      }
    }
    function restartRound() {
      state.board = Array(9).fill("");
      state.current = "X";
      state.locked = false;
      renderBoard();
      setStatus("Player X ki baari");
    }
    boardEl?.addEventListener("click", (event) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;
      const index = Number(target.dataset.index);
      if (Number.isInteger(index)) playMove(index);
    });
    document.querySelectorAll("[data-mode]").forEach((button) => {
      button.addEventListener("click", () => {
        const mode = button.getAttribute("data-mode") || "friend";
        state.mode = mode;
        document.querySelectorAll("[data-mode]").forEach((node) => node.classList.toggle("active", node === button));
        restartRound();
      });
    });
    document.getElementById("restartBtn")?.addEventListener("click", restartRound);
    renderBoard();
    updateScore();
  })();
})();
