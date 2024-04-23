document.addEventListener("DOMContentLoaded", function () {
    // Initialize the webcam video stream
    const video = document.getElementById('webcam');

    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then(function(stream) {
          video.srcObject = stream;
        })
        .catch(function(error) {
          console.error("Error accessing the webcam: ", error);
        });
    } else {
      console.error('getUserMedia not supported in this browser.');
    }
  // Initialization
  let isRunning = false;
  let timerDuration = 25 * 60; // 25 minutes
  let currentTimer = 0;
  let interval = null;

  // DOM Elements
  const timerElement = document.getElementById("timer");
  const startButton = document.getElementById("start");
  const resetButton = document.getElementById("reset");
  const modal = document.getElementById("pomodoroModal");
  const timerBtn = document.getElementById("timerButton");
  const closeSpan = document.getElementsByClassName("close")[0];
  const spotifyModal = document.getElementById("spotifyModal");
  const spotifyBtn = document.getElementById("spotifyButton");
  const closeSpotifySpan = document.getElementsByClassName("closeSpotify")[0];
  const setTimerButton = document.getElementById("set-timer");
  const inputMinutes = document.getElementById("timer-minutes");
  const inputSeconds = document.getElementById("timer-seconds");
  const noteButton = document.getElementById("noteButton");
  const stickyNotesContainer = document.getElementById("stickyNotesContainer");
  const linkModal = document.getElementById("linkModal");
  const linkButton = document.getElementById("linkButton");
  const closeLinkSpan = document.getElementsByClassName("closeLink")[0];
  const linkInput = document.getElementById("linkInput");
  const openLinkButton = document.getElementById("openLink");
  const iframeContainer = document.getElementById("iframeContainer");
// Initialize the ChatGPT modal button and modal
const chatGPTBtn = document.getElementById('chatGPTButton');
const chatGPTModal = document.getElementById('chatGPTModal');
const closeChatGPTSpan = document.getElementsByClassName('closeChatGPT')[0];
const chatInput = document.getElementById('chatInput');
const chatOutput = document.getElementById('chatOutput');
const sendMessageButton = document.getElementById('sendMessage');

// Function to send a message to OpenAI's API
async function sendMessage(message) {
  try {
    if (!message.trim()) {
      throw new Error('The message is empty.');
    }

    const responseOutput = document.createElement('div');
    responseOutput.textContent = "You: " + message;
    chatOutput.appendChild(responseOutput);

    // Adjust the API call to match the expected structure for chat completions
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer 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' // Make sure to use your actual API key here
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo", // Specify the model. Adjust according to your access.
        messages: [{
          role: "user", 
          content: message
        }],
        max_tokens: 150 // Adjust this value based on your needs
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    // Check if there are completions and handle appropriately
    if (!data.choices || data.choices.length === 0 || !data.choices[0].message || !data.choices[0].message.content) {
      throw new Error('No response from OpenAI.');
    }

    const aiResponse = document.createElement('div');
    aiResponse.textContent = "ChatGPT: " + data.choices[0].message.content.trim();
    chatOutput.appendChild(aiResponse);
  } catch (error) {
    console.error('Error sending message:', error);
    const errorMessage = document.createElement('div');
    errorMessage.textContent = "ChatGPT: " + (error.message || "I'm having trouble understanding. Please try again.");
    chatOutput.appendChild(errorMessage);
  }
}



// Event listener for the send message button
sendMessageButton.addEventListener('click', () => {
  const message = chatInput.value;
  chatInput.value = ''; // Clear the input
  sendMessage(message);
});
// Adding keypress event to trigger sending message on pressing 'Enter'
chatInput.addEventListener('keypress', function(event) {
  if (event.key === "Enter") {
    event.preventDefault(); // Prevent the default action to stop from any form submission
    sendMessageButton.click(); // Trigger click on send button
  }
});
// ChatGPT Modal toggles
chatGPTBtn.onclick = () => (chatGPTModal.style.display = chatGPTModal.style.display === "block" ? "none" : "block");
closeChatGPTSpan.onclick = () => (chatGPTModal.style.display = "none");

// Make the ChatGPT modal draggable
makeElementDraggable(document.getElementById("draggableChatGPT"));
  // Link Modal Toggles
  linkButton.onclick = () =>
    (linkModal.style.display =
      linkModal.style.display === "block" ? "none" : "block");
  closeLinkSpan.onclick = () => (linkModal.style.display = "none");

  openLinkButton.addEventListener("click", function () {
    let url = linkInput.value;
    // Check if it's a YouTube URL and modify it for embedding
    if (url.includes("youtube.com/watch?v=")) {
      const videoId = url.split("v=")[1].split("&")[0];
      url = `https://www.youtube.com/embed/${videoId}`;
    }

    iframeContainer.innerHTML = `<iframe src="${url}" width="100%" 
    height="300px" frameborder="0" allowfullscreen></iframe>`;
  });

  // Make Link Modal Draggable
  makeElementDraggable(document.getElementById("draggableLink"));

  // Timer Display Update Function
  function updateTimerDisplay() {
    const minutes = Math.floor((timerDuration - currentTimer) / 60);
    const seconds = (timerDuration - currentTimer) % 60;
    timerElement.textContent = `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  }

  // Timer Control Functions
  function startTimer() {
    interval = setInterval(() => {
      currentTimer++;
      updateTimerDisplay();
      if (currentTimer >= timerDuration) {
        pauseTimer();
        alert("Pomodoro finished. Time for a break!");
        resetTimer();
      }
    }, 1000);
    startButton.textContent = "Pause";
  }

  function pauseTimer() {
    clearInterval(interval);
    startButton.textContent = "Start";
  }

  function resetTimer() {
    clearInterval(interval);
    currentTimer = 0;
    updateTimerDisplay();
    isRunning = false;
    startButton.textContent = "Start";
  }

  // Event Listeners
  startButton.addEventListener("click", function () {
    isRunning = !isRunning;
    isRunning ? startTimer() : pauseTimer();
  });

  resetButton.addEventListener("click", resetTimer);

  setTimerButton.addEventListener("click", function () {
    const minutes = parseInt(inputMinutes.value, 10);
    const seconds = parseInt(inputSeconds.value, 10);
    timerDuration = minutes * 60 + seconds;
    resetTimer();
  });

  // Modal Toggles
  timerBtn.onclick = () =>
    (modal.style.display = modal.style.display === "block" ? "none" : "block");
  closeSpan.onclick = () => (modal.style.display = "none");

  spotifyBtn.onclick = () =>
    (spotifyModal.style.display =
      spotifyModal.style.display === "block" ? "none" : "block");
  closeSpotifySpan.onclick = () => (spotifyModal.style.display = "none");

  // Make Elements Draggable
  makeElementDraggable(document.getElementById("draggableSpotify"));
  makeElementDraggable(document.getElementById("draggable"));

  // Sticky Note Functionality
  noteButton.addEventListener("click", createStickyNote);

  function createStickyNote() {
    const stickyNote = document.createElement("div");
    stickyNote.className = "sticky-note";
    const header = document.createElement("div");
    header.className = "sticky-note-header";
    stickyNote.appendChild(header);
    const textarea = document.createElement("textarea");
    stickyNote.appendChild(textarea);
    stickyNotesContainer.appendChild(stickyNote);
    makeElementDraggable(stickyNote, header);
  }

  // Draggable Element Function
  function makeElementDraggable(element, handle) {
    let pos1 = 0,
      pos2 = 0,
      pos3 = 0,
      pos4 = 0;

    const dragMouseDown = function (e) {
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") {
        // If the target is an input or textarea, don't start the drag
        return;
      }

      e.preventDefault();
      pos3 = e.clientX;
      pos4 = e.clientY;
      document.onmouseup = closeDragElement;
      document.onmousemove = elementDrag;
    };

    const elementDrag = function (e) {
      e.preventDefault();
      pos1 = pos3 - e.clientX;
      pos2 = pos4 - e.clientY;
      pos3 = e.clientX;
      pos4 = e.clientY;
      element.style.top = element.offsetTop - pos2 + "px";
      element.style.left = element.offsetLeft - pos1 + "px";
    };

    const closeDragElement = function () {
      document.onmouseup = null;
      document.onmousemove = null;
    };

    if (handle) {
      handle.onmousedown = dragMouseDown;
    } else {
      element.onmousedown = dragMouseDown;
    }
  }
});
