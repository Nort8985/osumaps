import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAyrzypGv648ySaHuJul7Rc8lnRDagmc2g",
  authDomain: "osu-95465.firebaseapp.com",
  projectId: "osu-95465",
  storageBucket: "osu-95465.appspot.com",
  messagingSenderId: "875056243293",
  appId: "1:875056243293:web:d433b80e7341fd993923b4"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function addMapLink(link) {
  try {
    const docRef = await addDoc(collection(db, "maps"), {
      link: link,
      createdAt: new Date()
    });
    console.log("Map added with ID: ", docRef.id);
    loadMapLinks(); 
  } catch (e) {
    console.error("Error adding map link: ", e);
  }
}

async function loadMapLinks() {
  try {
    const querySnapshot = await getDocs(collection(db, "maps"));
    const mapList = document.getElementById("mapList");
    mapList.innerHTML = ''; 
    let mapCounter = 1; 

    for (const doc of querySnapshot.docs) {
      const data = doc.data();
      const link = data.link;
      const mapId = link.split('/').pop(); // Extract map ID from the link
      const beatmapInfo = await fetchBeatmapInfo(mapId); // Fetch beatmap info

      const mapDiv = document.createElement("div");
      mapDiv.classList.add("map");
      mapDiv.innerHTML = `
        <a href="${link}" target="_blank">${beatmapInfo.title || `Map No. ${mapCounter}`}</a>
        <p>Stars: ${beatmapInfo.stars !== null ? beatmapInfo.stars.toFixed(1) : 'N/A'}</p>
        <button class="delete-button" id="delete-${doc.id}" onclick="deleteMapLink('${doc.id}')">Delete</button>
      `;
      mapList.appendChild(mapDiv);
      mapCounter++; 
    }
  } catch (e) {
    console.error("Error loading map links: ", e);
  }
}

async function fetchBeatmapInfo(mapId) {
  const apiKey = "877327e22308953f6ceb7c516f14ae9a86a3e290"; // Your osu! API key
  const url = `https://osu.ppy.sh/api/get_beatmaps?k=${apiKey}&b=${mapId}`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    if (data.length > 0) {
      return {
        title: data[0].title,
        stars: parseFloat(data[0].difficultyrating)
      };
    }
  } catch (error) {
    console.error("Error fetching beatmap info:", error);
  }
  return { title: null, stars: null }; 
}

window.deleteMapLink = async function(id) {
  const mapRef = doc(db, "maps", id);
  try {
    await deleteDoc(mapRef);
    console.log("Map deleted with ID: ", id);
    loadMapLinks(); 
  } catch (e) {
    console.error("Error deleting map link: ", e);
  }
}

document.getElementById("submitButton").addEventListener("click", function() {
  const linkInput = document.getElementById("mapLink");
  const link = linkInput.value.trim();

  if (link === "Наш слон") {
    return; 
  }

  if (link.startsWith("https://osu.ppy.sh") && link.includes("#osu")) {
    addMapLink(link); 
    linkInput.value = ''; 
  } else {
    alert("Неверный формат ссылки. Она должна выглядеть примерно так: https://osu.ppy.sh/beatmapsets/1218819#osu/2535904");
  }
});

let deleteButtonVisible = false;

document.getElementById("mapLink").addEventListener("input", function() {
  const link = this.value;
  const deleteButtons = document.querySelectorAll(".delete-button");

  if (link.includes("Наш слон")) {
    deleteButtonVisible = !deleteButtonVisible; 
    deleteButtons.forEach(button => {
      button.style.display = deleteButtonVisible ? "block" : "none"; 
    });
    this.value = ''; 
  }
});

window.addEventListener("load", function() {
  loadMapLinks();
});
