import * as messaging from "messaging";

const API_URL = "https://finans.truncgil.com/today.json";

messaging.peerSocket.onmessage = function(evt) {
  if (evt.data && evt.data.command === "update") {
    fetchMarkets();
  }
}

function fetchMarkets() {
  fetch(API_URL)
  .then(response => {
    if (!response.ok) {
      throw new Error("Sunucu Hatası: " + response.status);
    }
    return response.json();
  })
  .then(data => {
    // Veri geldi, işle
    let usd = data["ABD DOLARI"] ? data["ABD DOLARI"].Satis : "0";
    let eur = data["EURO"] ? data["EURO"].Satis : "0";
    let gold = data["GRAM ALTIN"] ? data["GRAM ALTIN"].Satis : "0";
    let silver = data["GÜMÜŞ"] ? data["GÜMÜŞ"].Satis : "0";

    sendToDevice({
      success: true,
      usd: usd,
      eur: eur,
      gold: gold,
      silver: silver
    });
  })
  .catch(err => {
    console.error("Fetch Hatası:", err);
    // Hatayı saate bildir
    sendToDevice({
      success: false,
      error: "API/İnternet Yok"
    });
  });
}

function sendToDevice(data) {
  if (messaging.peerSocket.readyState === messaging.peerSocket.OPEN) {
    messaging.peerSocket.send(data);
  } else {
    console.error("Hata: Saat bağlantısı yok.");
  }
}
