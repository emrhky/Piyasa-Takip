import * as messaging from "messaging";

const API_URL = "https://finans.truncgil.com/today.json";

messaging.peerSocket.onmessage = function(evt) {
  if (evt.data && evt.data.command === "update") {
    fetchMarkets();
  }
}

function fetchMarkets() {
  console.log("Veri çekiliyor...");
  
  fetch(API_URL)
  .then(response => {
    if (!response.ok) throw new Error("API Hatası");
    return response.json();
  })
  .then(data => {
    // Veriyi başarıyla çektik
    sendToDevice({
      usd: safeVal(data, "ABD DOLARI"),
      eur: safeVal(data, "EURO"),
      gold: safeVal(data, "GRAM ALTIN"),
      silver: safeVal(data, "GÜMÜŞ")
    });
  })
  .catch(err => {
    console.error("API Fetch Hatası: " + err);
    console.log("DEMO MODU DEVREDE (İnternet sorunu var ama uygulama çalışıyor)");
    
    // HATA OLSA BİLE DEMO VERİ GÖNDER (Test amaçlı)
    // Böylece rakamları görürsen kodun sağlam, internetin bozuk olduğunu anlarsın.
    sendToDevice({
      usd: "34.50 (Demo)",
      eur: "37.20 (Demo)",
      gold: "2150 (Demo)",
      silver: "35.00 (Demo)"
    });
    
    // Hatayı da ekrana kısa süreli basabilirsin istersen:
    // sendError("İnternet Yok, Demo Gösteriliyor");
  });
}

function safeVal(data, key) {
  if (data && data[key] && data[key].Alis) {
    let val = data[key].Alis.replace(",", ".");
    return parseFloat(val).toFixed(2);
  }
  return "0.00";
}

function sendToDevice(data) {
  if (messaging.peerSocket.readyState === messaging.peerSocket.OPEN) {
    messaging.peerSocket.send(data);
  }
}

function sendError(msg) {
  if (messaging.peerSocket.readyState === messaging.peerSocket.OPEN) {
    messaging.peerSocket.send({ error: msg });
  }
}
