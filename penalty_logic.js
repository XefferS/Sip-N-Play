function setupPenaltyPage(config) {
    const { correctCode, nextPage, penaltyTime, inputType = 'code' } = config;

    const codeInput = document.getElementById('code-input');
    const checkButton = document.getElementById('check-button');
    const errorMessage = document.getElementById('error-message');
    const timerMessage = document.getElementById('timer-message');
    const penaltyContainer = document.getElementById('penalty-container');

    let countdownInterval;

    function checkLockout() {
        const lockoutUntil = localStorage.getItem('lockoutUntil');
        if (!lockoutUntil) return;
        const remainingTime = lockoutUntil - Date.now();
        if (remainingTime > 0) {
            disableInputsAndShowPenalty();
            startCountdown(remainingTime);
        } else {
            clearLockout(false); // Ne mutasson üzenetet újratöltéskor
        }
    }

    function disableInputsAndShowPenalty() {
        codeInput.disabled = true;
        checkButton.disabled = true;
        if (penaltyContainer) penaltyContainer.style.display = 'flex';
    }

    function setLockout() {
        const lockoutUntil = Date.now() + penaltyTime;
        localStorage.setItem('lockoutUntil', lockoutUntil);
        disableInputsAndShowPenalty();
        startCountdown(penaltyTime);
    }

    function clearLockout(showTryAgain = true) {
        localStorage.removeItem('lockoutUntil');
        codeInput.disabled = false;
        checkButton.disabled = false;
        if (penaltyContainer) penaltyContainer.style.display = 'none';
        clearInterval(countdownInterval);
        timerMessage.textContent = '';
        if (showTryAgain) errorMessage.textContent = 'Lejárt a büntetés, próbáld újra!';
        codeInput.value = '';
        codeInput.focus();
    }

    function startCountdown(duration) {
        let remaining = Math.ceil(duration / 1000);
        const updateTimer = () => {
            const minutes = Math.floor(remaining / 60);
            const seconds = remaining % 60;
            timerMessage.textContent = `Próbálkozz újra ${minutes}:${seconds.toString().padStart(2, '0')} múlva.`;
            remaining--;
            if (remaining < 0) clearLockout();
        };
        updateTimer();
        countdownInterval = setInterval(updateTimer, 1000);
    }

    checkButton.addEventListener('click', () => {
        errorMessage.textContent = '';
        const isCorrect = inputType === 'text' 
            ? codeInput.value.trim().toLowerCase() === correctCode.toLowerCase()
            : codeInput.value === correctCode;

        if (isCorrect) {
            localStorage.removeItem('lockoutUntil');
            window.location.href = nextPage;
        } else {
            errorMessage.textContent = 'Sikertelen próbálkozás!';
            setLockout();
        }
    });

    codeInput.addEventListener('keyup', e => e.key === 'Enter' && checkButton.click());
    checkLockout();
}