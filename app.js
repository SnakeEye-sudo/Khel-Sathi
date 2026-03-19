"use strict";
(() => {
  // src/app.ts
  (() => {
    const root = document.getElementById("appRoot");
    if (!root) return;
    const STORAGE_KEY = "khel-sathi-state";
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
    const state = {
      board: Array(9).fill(""),
      current: "X",
      mode: saved?.mode || "friend",
      score: saved?.score || { X: 0, O: 0, draws: 0 },
      locked: false,
      names: saved?.names || { X: "Player 1", O: "Player 2" },
      history: saved?.history || []
    };
    root.innerHTML = `
    <section class="section-stack">
      <article class="tool-card arcade-shell">
        <div class="toolbar">
          <div>
            <p class="eyebrow">Arcade board</p>
            <h3>Naam ke saath proper match mode</h3>
          </div>
          <div class="button-row">
            <button class="mode-btn active" data-mode="friend" type="button">Vs friend</button>
            <button class="mode-btn" data-mode="bot" type="button">Vs bot</button>
          </div>
        </div>
        <div class="cards-grid player-setup">
          <div class="choice-card">
            <p class="mini-label">X player</p>
            <label class="field-label" for="nameX">Naam</label>
            <input class="text-input" id="nameX" type="text" placeholder="Player 1">
          </div>
          <div class="choice-card">
            <p class="mini-label">O player</p>
            <label class="field-label" for="nameO">Naam</label>
            <input class="text-input" id="nameO" type="text" placeholder="Player 2 / Bot Yoddha">
          </div>
        </div>
        <div class="board arcade-board" id="board"></div>
        <div class="result-panel arcade-status">
          <p class="mini-label">Match update</p>
          <strong class="result-number" id="statusText">Player 1 ki baari</strong>
          <p class="muted" id="statusNote">Best move socho aur board capture karo.</p>
          <div class="button-row">
            <button class="action-btn primary" id="restartBtn" type="button">Restart round</button>
            <button class="ghost-btn" id="resetScoreBtn" type="button">Reset score</button>
          </div>
        </div>
      </article>
    </section>

    <aside class="section-stack">
      <article class="info-card">
        <p class="eyebrow">Scoreboard</p>
        <div class="score-row"><span id="scoreLabelX">Player 1 wins</span><strong id="scoreX">0</strong></div>
        <div class="score-row"><span id="scoreLabelO">Player 2 wins</span><strong id="scoreO">0</strong></div>
        <div class="score-row"><span>Draws</span><strong id="scoreD">0</strong></div>
      </article>
      <article class="info-card">
        <p class="eyebrow">Recent rounds</p>
        <div class="history-grid" id="historyList"></div>
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
    const statusNote = document.getElementById("statusNote");
    const scoreX = document.getElementById("scoreX");
    const scoreO = document.getElementById("scoreO");
    const scoreD = document.getElementById("scoreD");
    const nameXInput = document.getElementById("nameX");
    const nameOInput = document.getElementById("nameO");
    const scoreLabelX = document.getElementById("scoreLabelX");
    const scoreLabelO = document.getElementById("scoreLabelO");
    const historyList = document.getElementById("historyList");
    function save() {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        mode: state.mode,
        score: state.score,
        names: state.names,
        history: state.history
      }));
    }
    function playerName(mark) {
      return state.names[mark];
    }
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
      scoreLabelX.textContent = `${playerName("X")} wins`;
      scoreLabelO.textContent = `${playerName("O")} wins`;
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
      statusNote.textContent = "Next round ke liye restart dabao ya mode switch karo.";
      updateScore();
      renderBoard();
      save();
      renderHistory();
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
        const winnerName = playerName(state.current);
        state.history.unshift(`${winnerName} (${state.current}) ne round jeeta`);
        state.history = state.history.slice(0, 6);
        finishRound(`${winnerName} jeet gaya`);
        return;
      }
      if (!availableMoves().length) {
        state.score.draws += 1;
        state.history.unshift("Round draw gaya");
        state.history = state.history.slice(0, 6);
        finishRound("Round draw ho gaya");
        return;
      }
      state.current = state.current === "X" ? "O" : "X";
      renderBoard();
      const currentName = playerName(state.current);
      setStatus(state.mode === "bot" && state.current === "O" ? `${currentName} soch raha hai...` : `${currentName} ki baari`);
      statusNote.textContent = state.current === "X" ? "Opening ko strong rakho." : "Block ya win dono check karo.";
      if (state.mode === "bot" && state.current === "O") {
        window.setTimeout(aiMove, 420);
      }
    }
    function restartRound() {
      state.board = Array(9).fill("");
      state.current = "X";
      state.locked = false;
      renderBoard();
      setStatus(`${playerName("X")} ki baari`);
      statusNote.textContent = "Best move socho aur board capture karo.";
      save();
    }
    function renderHistory() {
      historyList.innerHTML = state.history.length ? state.history.map((entry) => `<div class="history-card"><strong>${entry}</strong><span class="muted">Recent match update</span></div>`).join("") : '<div class="history-card"><strong>Abhi history khaali hai</strong><span class="muted">Ek round complete hote hi yahan result aayega.</span></div>';
    }
    function syncNames() {
      if (nameXInput) nameXInput.value = state.names.X;
      if (nameOInput) {
        nameOInput.disabled = state.mode === "bot";
        nameOInput.value = state.mode === "bot" ? "Bot Yoddha" : state.names.O;
      }
      if (state.mode === "bot") {
        state.names.O = "Bot Yoddha";
      }
      updateScore();
      renderHistory();
      save();
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
        if (mode === "bot") {
          state.names.O = "Bot Yoddha";
        }
        syncNames();
        restartRound();
      });
    });
    document.getElementById("restartBtn")?.addEventListener("click", restartRound);
    document.getElementById("resetScoreBtn")?.addEventListener("click", () => {
      state.score = { X: 0, O: 0, draws: 0 };
      state.history = [];
      updateScore();
      renderHistory();
      save();
    });
    nameXInput?.addEventListener("input", () => {
      state.names.X = nameXInput.value.trim() || "Player 1";
      updateScore();
      if (state.current === "X" && !state.locked) setStatus(`${playerName("X")} ki baari`);
      save();
    });
    nameOInput?.addEventListener("input", () => {
      if (state.mode === "bot") return;
      state.names.O = nameOInput.value.trim() || "Player 2";
      updateScore();
      if (state.current === "O" && !state.locked) setStatus(`${playerName("O")} ki baari`);
      save();
    });
    renderBoard();
    syncNames();
    restartRound();
  })();
})();
