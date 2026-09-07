let leaderboardModalInstance;

document.addEventListener('DOMContentLoaded', () => {
  const leaderboardModalEl = document.getElementById('leaderboardModal');
  if (leaderboardModalEl) {
    leaderboardModalInstance = new bootstrap.Modal(leaderboardModalEl);
  }

  const btn = document.getElementById('leaderboard-btn');
  if (btn) {
    btn.addEventListener('click', handleLeaderboardClick);
  }
});

async function handleLeaderboardClick() {
  if (window.isPremiumUser !== true) {
    return;
  }

  const token = localStorage.getItem('token');
  leaderboardModalInstance.show();
  await loadLeaderboard(token);
}

async function loadLeaderboard(token) {
  const listEl = document.getElementById('leaderboard-list');
  setLoading(listEl);

  try {
    const response = await axios.get('/premium/showleaderboard', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const users = response.data && response.data.data ? response.data.data : [];
    renderLeaderboard(users);
  } catch (error) {
    if (error.response && error.response.status === 403) {
      leaderboardModalInstance.hide();
      window.isPremiumUser = false;
      const btn = document.getElementById('leaderboard-btn');
      if (btn) btn.disabled = true;
      return;
    }
    console.error('Failed to load leaderboard:', error);
    setError(listEl);
  }
}

function renderLeaderboard(users) {
  const listEl = document.getElementById('leaderboard-list');
  listEl.innerHTML = '';

  if (!users || users.length === 0) {
    const empty = document.createElement('p');
    empty.className = 'empty-state';
    empty.textContent = 'No expenses recorded yet.';
    listEl.appendChild(empty);
    return;
  }

  users.forEach((user, index) => {
    listEl.appendChild(buildLeaderboardRow(user, index + 1));
  });
}

function buildLeaderboardRow(user, rank) {
  const row = document.createElement('div');
  row.className = 'leaderboard-row';

  const rankEl = document.createElement('span');
  rankEl.className = 'lb-rank';
  rankEl.textContent = `#${rank}`;


  const nameEl = document.createElement('span');
  nameEl.className = 'lb-name';
  nameEl.textContent = user.name || 'Unknown user';

  const totalEl = document.createElement('span');
  totalEl.className = 'lb-total';
  const total = Number(user.totalExpense) || 0;
  totalEl.textContent = `$${total.toFixed(2)}`;

  row.append(rankEl, nameEl, totalEl);
  return row;
}

function setLoading(listEl) {
  listEl.innerHTML = '<p class="empty-state">Loading leaderboard...</p>';
}

function setError(listEl) {
  listEl.innerHTML = '<p class="empty-state">Could not load leaderboard. Please try again.</p>';
}