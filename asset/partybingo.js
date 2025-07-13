 (function () {
     // Element References
     const pingoNumber = $('#pingo-number');
     const startButton = $('#start-button');
     const resetButton = $('#reset-button');
     const historiesDiv = $('#histories');
     const numberCheckForm = $('#number-check-form');
     const numberCheckInput = $('#number-check-input');
     const numberCheckResult = $('#number-check-result');
     const drumAudio = $('#drum').get(0);
     const tuschAudio = $('#tusch').get(0);

     // Constants
     const maxNumber = 90;
     const listKey = 'partybingo.numberlist';
     const removedKey = 'partybingo.removedlist';

     // Utility Functions
     const toBingoString = (n) => (n > 9 ? n.toString() : n < 0 ? '00' : `0${n}`);

     const addHistory = (n) => {
         historiesDiv.append(
             `<div class="col-md-1"><p class="history-number" data-number="${n}">${toBingoString(n)}</p></div>`
         );
     };
     
     // Highlight a number in the history
     const highlightNumber = (num) => {
         // Remove previous highlights
         $('.history-number').removeClass('highlighted');
         
         // Find and highlight the number
         $(`.history-number[data-number="${num}"]`).addClass('highlighted');
     };

     // Initialize Number List
     const numberListAll = Array.from({ length: maxNumber }, (_, i) => i + 1);

     // Storage Handlers
     const storage = localStorage;
     const setNumberList = (list) => storage.setItem(listKey, JSON.stringify(list));
     const getNumberList = () => JSON.parse(storage.getItem(listKey)) || [];
     const setRemovedList = (list) => storage.setItem(removedKey, JSON.stringify(list));
     const getRemovedList = () => JSON.parse(storage.getItem(removedKey)) || [];
     
     // Check if a number has been drawn
     const isNumberDrawn = (num) => {
         const removedList = getRemovedList();
         return removedList.includes(parseInt(num, 10));
     };

     const resetLists = () => {
         setNumberList([...numberListAll]);
         setRemovedList([]);
     };

     // Load History or Initialize Lists
     const loadedNumberList = getNumberList();
     const loadedRemovedList = getRemovedList();

     if (loadedNumberList.length && loadedRemovedList.length) {
         loadedRemovedList.forEach((num) => addHistory(num));
     } else {
         resetLists();
     }

     // Bingo Number Logic
     const getRandomNumber = () => {
         const numberList = getNumberList();
         return numberList[Math.floor(Math.random() * numberList.length)];
     };

     const removeRandomNumber = () => {
         const numberList = getNumberList();
         if (numberList.length === 0) return -1;

         const index = Math.floor(Math.random() * numberList.length);
         const removed = numberList.splice(index, 1)[0];

         setNumberList(numberList);
         const removedList = getRemovedList();
         removedList.push(removed);
         setRemovedList(removedList);

         return removed;
     };

     // Game Control
     let isStarted = false;

     const roulette = () => {
         if (isStarted) {
             pingoNumber.text(toBingoString(getRandomNumber()));
             setTimeout(roulette, 60);
         }
     };

     const stopGame = () => {
         isStarted = false;
         
         // Change button text to 'Nächste Zahl' after first number is drawn
         const removedList = getRemovedList();
         startButton.text(removedList.length > 0 ? 'Nächste Zahl' : 'Start');

         const number = removeRandomNumber();
         pingoNumber.text(toBingoString(number));
         addHistory(number);

         drumAudio.pause();
         tuschAudio.play();
     };

     const startGame = () => {
         isStarted = true;
         startButton.text('Stop');

         drumAudio.currentTime = 0;
         drumAudio.play();

         roulette();
     };

     // Button Handlers
     const handleStartClick = () => {
         isStarted ? stopGame() : startGame();
     };

     const handleResetClick = () => {
         if (confirm('Möchten Sie wirklich zurücksetzen?')) {
             resetLists();
             pingoNumber.text('00');
             historiesDiv.empty();
             drumAudio.pause();
             startButton.text('Start').focus();
             numberCheckResult.removeClass('text-success text-danger text-warning').empty();
             // Remove any highlights
             $('.history-number').removeClass('highlighted');
         }
     };

     // Number Check Handler
     const handleNumberCheck = (e) => {
         e.preventDefault();
         const numberToCheck = numberCheckInput.val().trim();
         
         // Validate input
         if (!numberToCheck || isNaN(numberToCheck) || numberToCheck < 1 || numberToCheck > maxNumber) {
             numberCheckResult.removeClass('text-success text-danger').addClass('text-warning')
                 .html(`<i class="fas fa-exclamation-triangle"></i> Bitte geben Sie eine gültige Zahl zwischen 1 und ${maxNumber} ein.`);
             // Remove previous highlights when input is invalid
             $('.history-number').removeClass('highlighted');
             return;
         }
         
         // Check if number was drawn
         const wasDrawn = isNumberDrawn(numberToCheck);
         if (wasDrawn) {
             numberCheckResult.removeClass('text-warning text-danger').addClass('text-success')
                 .html(`<i class="fas fa-check-circle"></i> Ja, die Nummer ${numberToCheck} wurde bereits gezogen!`);
             
             // Highlight the number in the history
             highlightNumber(numberToCheck);
         } else {
             numberCheckResult.removeClass('text-warning text-success').addClass('text-danger')
                 .html(`<i class="fas fa-times-circle"></i> Nein, die Nummer ${numberToCheck} wurde noch nicht gezogen.`);
             
             // Remove previous highlights when number not found
             $('.history-number').removeClass('highlighted');
         }
         
         // Clear input
         numberCheckInput.val('');
     };

     // Handle click on history number
     const handleHistoryNumberClick = function() {
         // Check if this number is highlighted
         if ($(this).hasClass('highlighted')) {
             // Remove highlight
             $(this).removeClass('highlighted');
         }
     };
     
     // Event Listeners
     startButton.click(handleStartClick).focus();
     resetButton.click(handleResetClick);
     numberCheckForm.submit(handleNumberCheck);
     
     // Use event delegation for dynamically added history numbers
     historiesDiv.on('click', '.history-number', handleHistoryNumberClick);
 })();
