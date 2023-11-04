import { db } from "../config.js";
import { collection, query, orderBy, onSnapshot, addDoc } from "https://www.gstatic.com/firebasejs/10.5.2/firebase-firestore.js";

$(document).ready(function () {
  
    // Reference to the Firestore collection
    const chatRef = collection(db, "messages");

    // Function to add a new prompt to Firestore
    const sendPrompt = async (promptText) => {
    var docID;
    try {
        // Adding document to Firestore with a prompt and server-side timestamp
        await addDoc(chatRef, {
        prompt: promptText,
        }).then((docRef) => {
            console.log("Document written with ID: ", docRef.id);
            docID = docRef.id;
        }); 

            // Immediately add a loading bubble for this message
            const loadingElement = document.createElement('div');
            loadingElement.classList.add('d-flex', 'justify-content-start', 'mb-2');
            loadingElement.innerHTML = `
            <div class="ai-message bg-light rounded px-3 py-2 shadow-sm w-50">
                <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
                </div>
            </div>
            `;
            // Give the loading element a unique ID using the docRef.id
            loadingElement.setAttribute('id', `loading-${docID}`);
            chatBox.appendChild(loadingElement);
            chatBox.scrollTop = chatBox.scrollHeight;

        // Clear the input field after sending
        document.getElementById('message-input').value = '';
    } catch (error) {
        console.error("Error adding document: ", error);
    }
    };

    // Event listener for the send button
    document.getElementById('send-button').addEventListener('click', () => {
    const promptInput = document.getElementById('message-input').value;
    if (promptInput.trim() !== '') { // Check if the input is not just whitespace
        sendPrompt(promptInput);
    }
    });

    const chatBox = document.getElementById('chat-box');
    const loadMessages = () => {
        const q = query(chatRef, orderBy("createTime"));
      
        onSnapshot(q, (snapshot) => {
          snapshot.docChanges().forEach((change) => {
            const messageData = change.doc.data();
      
            if (change.type === "added" || (change.type === "modified" && messageData.status?.state === "COMPLETED")) {
                const loadingElement = document.getElementById(`loading-${change.doc.id}`);
                if (loadingElement) {
                  // Remove the loading spinner
                  loadingElement.remove();
                }

                // Check if the message element already exists
              let messageElement = document.querySelector(`#msg-${change.doc.id}`);
      
              // If the message element does not exist, create it (for new messages)
              if (!messageElement) {
                messageElement = document.createElement('div');
                messageElement.setAttribute('id', `msg-${change.doc.id}`);
                chatBox.appendChild(messageElement);
              }
      
              // Clear the previous content (important for modified messages)
              messageElement.innerHTML = '';
      
              // Create a user message bubble
              const userMessageElement = document.createElement('div');
              userMessageElement.classList.add('d-flex', 'justify-content-end', 'mb-2');
              userMessageElement.innerHTML = `
                <div class="user-message bg-primary text-white rounded px-3 py-2 shadow-sm w-50">
                  <p class="m-0">${messageData.prompt}</p>
                </div>
              `;
      
              // Create an AI message bubble if a response exists
              const aiMessageElement = document.createElement('div');
              aiMessageElement.classList.add('d-flex', 'justify-content-start', 'mb-2');
              aiMessageElement.innerHTML = `
                <div class="ai-message bg-light rounded px-3 py-2 shadow-sm w-50">
                  <p class="m-0">${messageData.response || ''}</p>
                </div>
              `;
      
              // Append both elements to the message element
              messageElement.appendChild(userMessageElement);
              // Only append the AI response if it exists and the state is COMPLETED
              if (messageData.response && messageData.status?.state === "COMPLETED") {
                messageElement.appendChild(aiMessageElement);
              }
      
              // Scroll to the bottom of the chat box
              chatBox.scrollTop = chatBox.scrollHeight;
            }
          });
        });
      };
      
      // Call the function to load messages
      loadMessages();
      
    
  
});