const generateShortenedURLBtn = document.querySelector('.shorten-link');
const copyShortenedURLBtn = document.querySelector('.copy-link');
const copyCard = document.querySelector('.copy-card');
const urlInput = document.querySelector('.url-input');
const copyOutput = document.querySelector('.copy-output');
const infoWarning = document.querySelector('.info-warning');
const loadingIndicator = document.querySelector('.loading-indicator'); // Add a loading element in your HTML
const userId = "Cooler";
document.addEventListener("DOMContentLoaded", function() {
  copyCard.style.display = 'none';
  infoWarning.style.display = "none";
  loadingIndicator.style.display = "none"; // Ensure loading indicator is hidden initially
});
var shortID;
const API_URL = 'https://short-xish.onrender.com/api/url';
async function getHelperUrlFunction(){
  fetch(`${API_URL}/${shortID}`)
    .then(response => response.json())
    .then(data => {
      console.log(data.destination); // Logs the destination URL
    })
    .catch(error => console.error('Error:', error.message));
}
async function generateShortenedURL() {
  try {
    loadingIndicator.style.display = "block";
    generateShortenedURLBtn.disabled = true;

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ destination: urlInput.value}),
    });

    if (!response.ok) {
      console.log(response.status, response.text())
      throw new Error('Failed to shorten URL')
    };
    const data = await response.json();
    shortID = data.newUrl.shortId;
    console.log(data.newUrl._id);
    await storeLinkInFirestore(userId, urlInput.value, data.newUrl.destination);
    getHelperUrlFunction();
    copyOutput.value = `${window.location.origin}/${data.newUrl.shortId}`;
    copyCard.style.display = 'flex';
  } catch (error) {
    console.error('Error:', error.message);
  }finally {
    loadingIndicator.style.display = "none"; // Hide loading indicator
    generateShortenedURLBtn.disabled = false; // Re-enable button
  }
}

generateShortenedURLBtn.addEventListener('click', (event) => {
  event.preventDefault();
  if (urlInput.value.length >= 8) {
    infoWarning.style.display = "none"; // Hide warning if valid
    generateShortenedURL();
  } else {
    infoWarning.style.display = "block"; // Show warning if invalid
  }
});
copyShortenedURLBtn.addEventListener('click',async (event) =>{
  event.preventDefault();
  try{
    await navigator.clipboard.writeText(copyOutput.value.trim());
  }catch(error){
    console.log(error.message);
  }
})


async function storeLinkInFirestore(userId, originalUrl, shortenedUrl) {
  try {
    // Reference to the user's document
    const userDocRef = doc(db, "users", userId);

    // Update the "links" array in the user's document using `arrayUnion`
    await updateDoc(userDocRef, {
      links: arrayUnion({
        originalUrl,
        shortenedUrl,
        createdAt: new Date().toISOString(), // Timestamp for tracking
      }),
    });

    console.log("Link stored successfully!");
  } catch (error) {
    if (error.code === "not-found") {
      console.error("User document not found. Ensure the user exists in Firestore.");
    }
    console.error("Error storing link:", error.message);
    alert("Failed to store the link. Please try again.");
  }
}