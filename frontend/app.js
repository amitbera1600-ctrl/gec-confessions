async function submitConfession() {
  const text = document.getElementById("confessionInput").value;

  if (!text.trim()) return alert("Type something!");

  await fetch("https://YOUR_BACKEND_URL/confess", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ confession: text })
  });

  document.getElementById("confessionInput").value = "";
  loadConfessions();
}

async function loadConfessions() {
  const res = await fetch("https://YOUR_BACKEND_URL/confessions");
  const data = await res.json();

  let html = "";
  data.forEach(item => {
    html += `<div class="confession">${item.text}</div>`;
  });
  document.getElementById("feed").innerHTML = html;
}

loadConfessions();
