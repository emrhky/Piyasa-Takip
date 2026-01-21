import { document } from "document";

// Uygulama başlar başlamaz çalışacak basit kod
try {
  console.log("JS Başladı!");
  const statusText = document.getElementById("TXT_STATUS");
  
  if (statusText) {
    statusText.text = "JS ÇALIŞTI!";
    statusText.style.fill = "#00FF00"; // Yeşil renk
  }
} catch (e) {
  console.log("Hata: " + e);
}
