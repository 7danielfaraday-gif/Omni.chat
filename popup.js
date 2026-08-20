document.addEventListener('DOMContentLoaded', () => {
  const btnStart = document.getElementById('btnStart');
  const btnStop = document.getElementById('btnStop');
  const statusText = document.getElementById('statusText');
  const progressText = document.getElementById('progressText');
  const personaSelect = document.getElementById('personaSelect');

  function atualizarStatus() {
    chrome.runtime.sendMessage({ action: "GET_STATUS" }, (response) => {
      if (response && response.isRunning) {
        btnStart.style.display = 'none';
        btnStop.style.display = 'block';
        statusText.textContent = "▶ RPA em Execução Contínua";
        progressText.textContent = `Progresso: Site ${response.currentIndex + 1} de ${response.total}`;
      } else {
        btnStart.style.display = 'block';
        btnStop.style.display = 'none';
        statusText.textContent = "Pronto para iniciar.";
        progressText.textContent = "";
      }
    });
  }

  atualizarStatus();
  setInterval(atualizarStatus, 3000);

  btnStart.addEventListener('click', () => {
    const persona = personaSelect.value;
    chrome.runtime.sendMessage({ action: "START_RPA", persona: persona }, (response) => {
      btnStart.style.display = 'none';
      btnStop.style.display = 'block';
      statusText.textContent = "🚀 Longa Sessão Iniciada!";
      progressText.textContent = `Total de sites agendados: ${response.total}`;
    });
  });

  btnStop.addEventListener('click', () => {
    chrome.runtime.sendMessage({ action: "STOP_RPA" }, (response) => {
      btnStart.style.display = 'block';
      btnStop.style.display = 'none';
      statusText.textContent = "⏹ RPA Interrompido.";
      progressText.textContent = "";
    });
  });
});
