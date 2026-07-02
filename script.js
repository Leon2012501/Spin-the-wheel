let items = [];
let colors = [];
let currentRotation = 0;
let spinning = false;

const canvas = document.getElementById("wheelCanvas");
const ctx = canvas.getContext("2d");

const spinButton = document.getElementById("spinButton");
const resultDiv = document.getElementById("result");

const settingsModal = document.getElementById("settingsModal");
const openSettingsBtn = document.getElementById("openSettings");
const closeSettingsBtn = document.getElementById("closeSettings");
const addItemBtn = document.getElementById("addItem");
const saveSettingsBtn = document.getElementById("saveSettings");
const itemsTableBody = document.getElementById("itemsTableBody");

// Load saved data
function loadFromStorage() {
    const raw = localStorage.getItem("spinWheelItems");
    if (raw) items = JSON.parse(raw);
    else items = [
        { name: "Navn 1", weight: 25 },
        { name: "Navn 2", weight: 25 },
        { name: "Navn 3", weight: 25 },
        { name: "Navn 4", weight: 25 }
    ];
}

function saveToStorage() {
    localStorage.setItem("spinWheelItems", JSON.stringify(items));
}

// Unique colors
function makeColors() {
    colors = [];
    const n = items.length;
    for (let i = 0; i < n; i++) {
        const hue = (360 / n) * i;
        colors.push(`hsl(${hue}, 80%, 60%)`);
    }
}

// Draw wheel
function drawWheel() {
    const n = items.length;
    const radius = canvas.width / 2;
    const cx = radius;
    const cy = radius;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const angle = (2 * Math.PI) / n;

    for (let i = 0; i < n; i++) {
        const start = i * angle;
        const end = start + angle;

        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, radius, start, end);
        ctx.fillStyle = colors[i];
        ctx.fill();

        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(start + angle / 2);
        ctx.fillStyle = "#000";
        ctx.font = "16px system-ui";
        ctx.textAlign = "right";
        ctx.fillText(items[i].name, radius - 10, 5);
        ctx.restore();
    }
}

function refreshWheel() {
    makeColors();
    drawWheel();
}

// Settings UI
function openSettings() {
    settingsModal.classList.remove("hidden");
    renderSettingsTable();
}

function closeSettings() {
    settingsModal.classList.add("hidden");
}

function renderSettingsTable() {
    itemsTableBody.innerHTML = "";
    items.forEach((item, index) => {
        const tr = document.createElement("tr");

        const nameInput = document.createElement("input");
        nameInput.value = item.name;
        nameInput.oninput = () => items[index].name = nameInput.value;

        const weightInput = document.createElement("input");
        weightInput.type = "number";
        weightInput.value = item.weight;
        weightInput.oninput = () => items[index].weight = Number(weightInput.value);

        const delBtn = document.createElement("button");
        delBtn.textContent = "Slett";
        delBtn.onclick = () => {
            items.splice(index, 1);
            renderSettingsTable();
        };

        tr.innerHTML = `
            <td></td>
            <td></td>
            <td></td>
        `;
        tr.children[0].appendChild(nameInput);
        tr.children[1].appendChild(weightInput);
        tr.children[2].appendChild(delBtn);

        itemsTableBody.appendChild(tr);
    });
}

function addItem() {
    items.push({ name: "Nytt navn", weight: 10 });
    renderSettingsTable();
}

function normalizeWeights() {
    let sum = items.reduce((a, b) => a + b.weight, 0);
    if (sum === 0) {
        const equal = 100 / items.length;
        items.forEach(i => i.weight = equal);
        return;
    }
    items.forEach(i => i.weight = (i.weight / sum) * 100);
}

// Weighted winner
function chooseWinnerIndex() {
    let total = items.reduce((a, b) => a + b.weight, 0);
    let r = Math.random() * total;

    for (let i = 0; i < items.length; i++) {
        r -= items[i].weight;
        if (r <= 0) return i;
    }
    return items.length - 1;
}

// Spin
function spin() {
    if (spinning) return;
    spinning = true;
    spinButton.disabled = true;

    const winner = chooseWinnerIndex();
    const n = items.length;
    const slice = 360 / n;

    const targetAngle = 360 * 5 + (360 - (winner * slice + slice / 2));
    const finalAngle = currentRotation + targetAngle;

    canvas.style.transform = `rotate(${finalAngle}deg)`;

    setTimeout(() => {
        currentRotation = finalAngle % 360;
        spinning = false;
        spinButton.disabled = false;
        resultDiv.textContent = `Vinner: ${items[winner].name} 🎉`;
    }, 4000);
}

// Events
openSettingsBtn.onclick = openSettings;
closeSettingsBtn.onclick = closeSettings;
addItemBtn.onclick = addItem;

saveSettingsBtn.onclick = () => {
    normalizeWeights();
    saveToStorage();
    refreshWheel();
    closeSettings();
};

spinButton.onclick = spin;

// Start
loadFromStorage();
refreshWheel();
