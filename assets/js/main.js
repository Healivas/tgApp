document.addEventListener("DOMContentLoaded", function () {
  const switchBlocks = document.querySelectorAll(".switch");
  if (!switchBlocks.length) return;

  document.addEventListener("click", async function (event) {
    const clickedSwitch = event.target.closest(".switch");

    if (!clickedSwitch) {
      document.querySelectorAll(".currency.active").forEach((c) => c.classList.remove("active"));
      return;
    }

    const currencyBlock = clickedSwitch.querySelector(".currency");
    if (!currencyBlock) return;

    const isCurrencyButton = event.target.closest(".currency button");

    if (isCurrencyButton && currencyBlock.classList.contains("active")) {
      const newCurrency = isCurrencyButton.classList.contains("usd") ? "usd" : "ruble";

      await API.setCurrentCurrency(newCurrency);

      document.querySelectorAll(".currency").forEach((currency) => {
        currency.classList.remove("usd", "ruble", "active");
        currency.querySelectorAll("button").forEach((btn) => btn.classList.remove("active"));

        currency.classList.add(newCurrency);
        const btn = currency.querySelector(`button.${newCurrency}`);
        if (btn) btn.classList.add("active");
      });

      await updateCurrencyDisplays();
      await updateCardSums();
    } else {
      document.querySelectorAll(".currency").forEach((c) => c.classList.remove("active"));
      currencyBlock.classList.add("active");
    }

    event.stopPropagation();
  });
});

document.addEventListener("click", () => {
  Telegram.WebApp.HapticFeedback.impactOccurred("medium");
});

document.addEventListener("DOMContentLoaded", () => {
  const buyButton = document.getElementById("buyButton");
  const giftButton = document.getElementById("giftButton");
  const payButton = document.getElementById("payButton");

  if (buyButton) {
    buyButton.addEventListener("click", () => {
      const value = parseInt(document.getElementById("buyInput").value.replace(/\D/g, ""), 10);
      if (value >= 50) {
        Telegram.WebApp.HapticFeedback.notificationOccurred("success");
      } else {
        Telegram.WebApp.HapticFeedback.notificationOccurred("error");
      }
    });
  }

  if (giftButton) {
    giftButton.addEventListener("click", async () => {
      const username = document.getElementById("userInput").value.trim().toLowerCase();
      const users = await API.getUsers();
      if (users.includes(username)) {
        Telegram.WebApp.HapticFeedback.notificationOccurred("success");
      } else {
        Telegram.WebApp.HapticFeedback.notificationOccurred("error");
      }
    });
  }

  if (payButton) {
    payButton.addEventListener("click", () => {
      const activeCard = document.querySelector(".card.active");
      if (activeCard) {
        Telegram.WebApp.HapticFeedback.notificationOccurred("success");
      } else {
        Telegram.WebApp.HapticFeedback.notificationOccurred("error");
      }
    });
  }
});

document.addEventListener("DOMContentLoaded", () => {
  const giftButton = document.getElementById("giftButton");
  const userInput = document.getElementById("userInput");
  const errorBlock = document.querySelector(".buy__gift-error");
  const giftWrapper = document.querySelector(".buy__gift");

  if (!giftButton || !userInput || !errorBlock || !giftWrapper) return;

  giftButton.addEventListener("click", async () => {
    const username = userInput.value.trim().toLowerCase();
    const users = await API.getUsers();

    if (users.includes(username)) {
      document.querySelector(".buy__gift-error").style.display = "none";
      document.querySelector(".buy__gift").classList.remove("error");

      goTo("purchase");

      setTimeout(() => {
        transferInputValueToSum();
        updateCardSums();
      }, 0);
    } else {
      document.querySelector(".buy__gift-error").style.display = "block";
      document.querySelector(".buy__gift").classList.add("error");
      document.querySelector(".blur").className = "blur blur__red";

      // Haptic Feedback on error
      if (Telegram?.WebApp?.HapticFeedback) {
        Telegram.WebApp.HapticFeedback.notificationOccurred("error");
      }
    }
  });
});

function updateInputWidth(input = null) {
  if (input) {
    const wrapper = input.closest(".buy__inner");
    const ruler = wrapper?.querySelector(".ruler");
    if (!ruler) return;

    const value = input.value || input.placeholder || "0";
    ruler.textContent = value;
    const width = ruler.offsetWidth;
    input.style.width = `${width}px`;
    return;
  }

  const activeWrapper = document.querySelector(".main.active");
  if (!activeWrapper) return;

  const inputs = activeWrapper.querySelectorAll(".buy__input");
  inputs.forEach((inp) => {
    const wrapper = inp.closest(".buy__inner");
    const ruler = wrapper?.querySelector(".ruler");
    if (!ruler) return;

    const value = inp.value || inp.placeholder || "0";
    ruler.textContent = value;
    const width = ruler.offsetWidth;
    inp.style.width = `${width}px`;
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const inputs = document.querySelectorAll(".buy__input");
  const ruler = document.querySelectorAll(".ruler");
  const helpButtons = document.querySelectorAll(".buy__help button");
  const wrappers = document.querySelectorAll(".buy__wrapper");
  const blur = document.querySelector(".blur");

  const buyInput = document.getElementById("buyInput");
  const buyButton = document.getElementById("buyButton");

  const MAX_VALUE = 1000000;
  const MIN_VALUE = 50;

  if (!buyInput || !buyButton) return;

  function checkBuyInput() {
    const rawValue = parseInt(buyInput.value.replace(/\D/g, ""), 10) || 0;

    if (rawValue >= MIN_VALUE && rawValue <= MAX_VALUE) {
      buyButton.removeAttribute("disabled");
    } else {
      buyButton.setAttribute("disabled", "");
    }
  }

  const giftInput = document.getElementById("giftInput");
  const giftButton = document.getElementById("giftButton");

  async function checkGiftInput() {
    const rawValue = parseInt(giftInput.value.replace(/\D/g, ""), 10) || 0;

    if (rawValue >= MIN_VALUE && rawValue <= MAX_VALUE) {
      giftButton?.removeAttribute("disabled");
    } else {
      giftButton?.setAttribute("disabled", "");
    }
  }

  buyInput.addEventListener("input", checkBuyInput);
  giftInput.addEventListener("input", checkGiftInput);

  checkBuyInput();
  checkGiftInput();
  if (!ruler || !wrappers.length) return;

  function formatNumberWithCommas(value) {
    const numeric = value.replace(/\D/g, "");
    return numeric.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  function updateWrapperSuccess(rawValue) {
    wrappers.forEach((wrapper) => {
      if (rawValue >= MIN_VALUE) {
        wrapper.classList.add("success");
        blur.classList.add("blur__blue");
        blur.classList.remove("blur__white");
      } else {
        wrapper.classList.remove("success");
        blur.classList.remove("blur__blue");
        blur.classList.add("blur__white");
      }
    });
  }

  inputs.forEach((input) => {
    input.setAttribute("type", "text");
    updateInputWidth(input);

    input.addEventListener("input", async () => {
      const rawString = input.value.replace(/\D/g, "");

      if (!rawString) {
        input.value = "";
        updateInputWidth(input);
        updateActiveButton(0);
        updateWrapperSuccess(0);
        await updateBuySumDisplay(0);
        await updateGiftSumDisplay(0);
        return;
      }

      let rawValue = parseInt(rawString, 10);
      if (rawValue > MAX_VALUE) rawValue = MAX_VALUE;

      input.value = formatNumberWithCommas(String(rawValue));
      updateInputWidth(input);
      updateActiveButton(rawValue);
      updateWrapperSuccess(rawValue);
      await updateBuySumDisplay(rawValue);
      await updateGiftSumDisplay(rawValue);
    });

    input.addEventListener("keydown", (e) => {
      const allowed = ["Backspace", "ArrowLeft", "ArrowRight", "Delete", "Tab"];
      const isDigit = e.key >= "0" && e.key <= "9";
      if (!isDigit && !allowed.includes(e.key)) {
        e.preventDefault();
      }
    });

    input.addEventListener("paste", async (e) => {
      e.preventDefault();
      const pasted = (e.clipboardData || window.clipboardData).getData("text");
      let raw = pasted.replace(/\D/g, "");
      let rawValue = parseInt(raw, 10);
      if (rawValue > MAX_VALUE) rawValue = MAX_VALUE;

      input.value = formatNumberWithCommas(String(rawValue));
      updateInputWidth(input);
      updateActiveButton(rawValue);
      updateWrapperSuccess(rawValue);
      await updateBuySumDisplay(rawValue);
      await updateGiftSumDisplay(rawValue);
    });
  });

  helpButtons.forEach((button) => {
    button.addEventListener("click", async () => {
      const raw = button.textContent.replace(/\D/g, "");
      const value = Math.min(parseInt(raw, 10), MAX_VALUE);

      inputs.forEach((input) => {
        input.value = formatNumberWithCommas(String(value));
        updateInputWidth(input);
      });
      checkBuyInput();
      checkGiftInput();
      updateActiveButton(value);
      updateWrapperSuccess(value);
      await updateBuySumDisplay(value);
      await updateGiftSumDisplay(value);
    });
  });
});

document.addEventListener("DOMContentLoaded", () => {
  const cardsContainer = document.querySelector(".buy__bottom-cards");
  const payButton = document.getElementById("payButton");
  const blur = document.querySelector(".blur");
  if (!cardsContainer || !payButton) return;

  const cards = cardsContainer.querySelectorAll(".card");

  cards.forEach((card) => {
    card.addEventListener("click", () => {
      cards.forEach((c) => c.classList.remove("active"));
      card.classList.add("active");
      payButton.removeAttribute("disabled");
      blur.className = "blur blur__blue";
    });
  });
});

document.addEventListener("DOMContentLoaded", () => {
  const wrappers = document.querySelectorAll(".history__wrapper");
  if (!wrappers.length) return;

  const getStatusLabel = (status) => {
    switch (status) {
      case "success":
        return "Успешно";
      case "processing":
        return "В обработке";
      case "error":
        return "Ошибка";
      default:
        return status;
    }
  };

  const renderHistory = async () => {
    const history = await API.getPurchaseHistory();
    const currency = await API.getCurrentCurrency();
    const rate = (await API.getRates())[currency];

    wrappers.forEach((wrapper) => {
      const historyBlock = wrapper.querySelector(".history");
      const emptyBlock = wrapper.querySelector(".history__empty");
      const inners = wrapper.querySelectorAll(".history__inner");

      if (!historyBlock || !emptyBlock || !inners.length) return;

      if (!history.length) {
        wrapper.classList.add("empty");
        return;
      }

      wrapper.classList.remove("empty");
      inners.forEach((inner) => (inner.innerHTML = ""));

      history.forEach((entry) => {
        const cost = Math.round(entry.stars * rate).toLocaleString("ru-RU");

        const block = document.createElement("div");
        block.classList.add("block");

        const badgeClass =
          {
            success: "success",
            processing: "warn",
            error: "error",
          }[entry.status] || "warn";

        block.innerHTML = `
          <div class="block__top">
            <div class="username">@${entry.login}</div>
            <div class="amount">
              <div class="amount__star">
                <span>${entry.stars}</span>
                <svg><use xlink:href="assets/img/icon.svg#star_mini"></use></svg>
              </div>
              <div class="amount__currency">(<span>${cost}</span> ${currency === "usd" ? "$" : "₽"})</div>
            </div>
          </div>
          <div class="block__bottom">
            <div class="badge ${badgeClass}">${getStatusLabel(entry.status)}</div>
            <div class="time">${entry.time}</div>
          </div>
        `;

        inners.forEach((inner) => inner.appendChild(block.cloneNode(true)));
      });

      const endBlock = document.createElement("div");
      endBlock.classList.add("block");
      endBlock.innerHTML = `<div class="block__text">Все транзакции на данный момент.</div>`;

      inners.forEach((inner) => inner.appendChild(endBlock.cloneNode(true)));
    });
  };

  renderHistory();

  document.addEventListener("click", (e) => {
    const isCurrencyBtn = e.target.closest(".currency button");
    if (isCurrencyBtn) {
      setTimeout(renderHistory, 0);
    }
  });
});

const API = {
  getCurrentCurrency: async () => MockAPI.getCurrentCurrency(),
  setCurrentCurrency: async (val) => MockAPI.setCurrentCurrency(val),
  getRates: async () => MockAPI.getRates(),
  getUsers: async () => MockAPI.getUsers(),
  getPurchaseHistory: async () => MockAPI.getPurchaseHistory(),
  createPurchase: async (data) => MockAPI.createPurchase(data),
};

const MockAPI = (() => {
  let currentCurrency = "ruble";
  const rates = { ton: 0.03, usd: 0.09, ruble: 4.12 };
  const users = ["healis", "durov", "test", "qwerty"];
  const statusOptions = ["success", "processing", "error"];

  const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
  const getRandomStatus = () => statusOptions[getRandomInt(0, 2)];
  const formatDate = (date) => {
    const d = new Date(date);
    const pad = (n) => (n < 10 ? "0" + n : n);
    return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  const purchaseHistory = [
    { login: "healis", stars: 100, status: "success", time: "12.06.2025 15:42" },
    { login: "durov", stars: 3000, status: "processing", time: "11.06.2025 18:15" },
    { login: "test", stars: 50, status: "error", time: "10.06.2025 09:05" },
    { login: "qwerty", stars: 500, status: "success", time: "08.06.2025 21:30" },
    { login: "durov", stars: 1000, status: "success", time: "06.06.2025 12:00" },
    { login: "healis", stars: 75, status: "processing", time: "05.06.2025 16:45" },
  ];

  return {
    getCurrentCurrency: () => currentCurrency,
    setCurrentCurrency: (val) => {
      if (["ruble", "usd"].includes(val)) currentCurrency = val;
    },
    getRates: () => ({ ...rates }),
    getUsers: () => [...users],
    getPurchaseHistory: () => [...purchaseHistory],
    createPurchase: ({ login, stars }) => {
      const record = {
        login,
        stars,
        status: getRandomStatus(),
        time: formatDate(new Date()),
      };
      purchaseHistory.unshift(record);
      return record;
    },
  };
})();

async function updateCardSums() {
  const sumElement = document.getElementById("sum");
  if (!sumElement) return;

  const numericValue = parseInt(sumElement.getAttribute("data-value") || "0", 10);
  if (!numericValue) return;

  const currency = await API.getCurrentCurrency();
  const rates = await API.getRates();

  const usdSum = (numericValue * rates.usd).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const rubSum = (numericValue * rates.ruble).toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

  const tonSum = (numericValue * rates.ton).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const cards = document.querySelectorAll(".card");

  cards.forEach((card) => {
    const bottom = card.querySelector(".card__bottom");

    if (card.innerHTML.includes("TON")) {
      bottom.textContent = `${tonSum} TON`;
    } else {
      if (currency === "usd") {
        bottom.textContent = `${usdSum} $`;
      } else {
        bottom.textContent = `${rubSum} RUB`;
      }
    }
  });
}

async function updateBuySumDisplay(rawValue) {
  const buySumElement = document.querySelector(".buySum");
  if (!buySumElement) return;

  const currency = await API.getCurrentCurrency();
  const rate = (await API.getRates())[currency];

  let price = currency === "usd" ? (rawValue * rate).toFixed(2) : Math.round(rawValue * rate);

  const formattedPrice = Number(price).toLocaleString("en-US", {
    minimumFractionDigits: currency === "usd" ? 2 : 0,
    maximumFractionDigits: currency === "usd" ? 2 : 0,
  });

  const parentText = buySumElement.closest(".buy__text");
  if (parentText) {
    buySumElement.textContent = formattedPrice;
    const buyCurrencyEl = document.getElementById("buyCurrency");
    if (buyCurrencyEl) buyCurrencyEl.textContent = currency === "usd" ? "$" : "₽";
  }
}

async function updateGiftSumDisplay(rawValue) {
  const giftSumElement = document.querySelector(".giftSum");
  if (!giftSumElement) return;

  const currency = await API.getCurrentCurrency();
  const rate = (await API.getRates())[currency];

  let price = currency === "usd" ? (rawValue * rate).toFixed(2) : Math.round(rawValue * rate);

  const formattedPrice = Number(price).toLocaleString("en-US", {
    minimumFractionDigits: currency === "usd" ? 2 : 0,
    maximumFractionDigits: currency === "usd" ? 2 : 0,
  });

  const parentText = giftSumElement.closest(".buy__text");
  if (parentText) {
    giftSumElement.textContent = formattedPrice;
    const giftCurrencyEl = document.getElementById("giftCurrency");
    if (giftCurrencyEl) giftCurrencyEl.textContent = currency === "usd" ? "$" : "₽";
  }
}

async function updateCurrencyDisplays() {
  const buyInput = document.getElementById("buyInput");
  const giftInput = document.getElementById("giftInput");

  const buyRaw = parseInt((buyInput?.value || "").replace(/\D/g, ""), 10) || 0;
  const giftRaw = parseInt((giftInput?.value || "").replace(/\D/g, ""), 10) || 0;

  await updateBuySumDisplay(buyRaw);
  await updateGiftSumDisplay(giftRaw);
}

let activePage = "home";
let pageHistory = [];
let lastVisitedPage = null;

function goTo(pageId) {
  if (pageId === "back") {
    if (pageHistory.length > 0) {
      const previous = pageHistory.pop();

      clearInput("#buyInput", "buy");
      clearInput("#giftInput", "gift");

      goTo(previous);
    }
    return;
  }

  if (pageId === "buy" || pageId === "gift") {
    updateCurrencyDisplays();
  }

  if (pageId !== activePage) {
    pageHistory.push(activePage);
    lastVisitedPage = activePage;
    activePage = pageId;
  }

  const wrappers = document.querySelectorAll(".main");
  wrappers.forEach((w) => w.classList.remove("active"));
  const targetWrapper = document.getElementById(pageId);
  if (targetWrapper) {
    targetWrapper.classList.add("active");
  }

  document.querySelectorAll("main:not(#home) .buy__wrapper.success").forEach((wrapper) => wrapper.classList.remove("success"));

  document.querySelectorAll(".card.active").forEach((card) => {
    card.classList.remove("active");
  });

  updateHeaderForPage(pageId);

  if (pageId === "purchase") {
    transferInputValueToSum();
    updateCardSums();
  }
}

function transferInputValueToSum() {
  const sumElement = document.getElementById("sum");
  const recipientBlock = document.getElementById("recipientBlock");
  const recipientSpan = document.getElementById("recipient");
  const buyText = document.querySelector("#purchase .buy__text");

  if (!sumElement) return;

  let sourceInput = null;

  if (lastVisitedPage === "buy") {
    sourceInput = document.getElementById("buyInput");

    if (recipientBlock) {
      recipientBlock.style.display = "none";
    }

    if (buyText) {
      buyText.classList.remove("visible");
    }
  } else if (lastVisitedPage === "gift") {
    sourceInput = document.getElementById("giftInput");

    const userInput = document.getElementById("userInput");
    const username = userInput?.value.trim();

    if (recipientBlock && recipientSpan && username) {
      recipientSpan.textContent = `@${username}`;
      recipientBlock.style.display = "block";
    }

    if (buyText) {
      buyText.classList.add("opacity");
    }
  }

  if (!sourceInput) return;

  const raw = sourceInput.value.replace(/\D/g, "");
  const numericValue = parseInt(raw, 10) || 0;

  const formatted = numericValue.toLocaleString("en-US");
  sumElement.textContent = formatted;
  sumElement.setAttribute("data-value", numericValue);
}

function updateHeaderForPage(pageId) {
  const currencyHeader = document.getElementById("currencyHeader");
  const backHeader = document.getElementById("backHeader");
  const pageNameElement = document.getElementById("pageName");
  const blur = document.querySelector(".blur");

  const pageTitles = {
    home: "Главная",
    buy: "Покупка",
    gift: "Подарок",
    purchase: "Выберите способ оплаты",
    purchaseSuccess: "Заказ оплачен",
    ask: "Задать вопрос",
    history: "История транзакций",
  };

  if (pageNameElement) {
    pageNameElement.innerText = pageTitles[pageId] || "";
  }

  switch (pageId) {
    case "home":
      currencyHeader.classList.add("active");
      backHeader.classList.remove("active");
      historyHeader.classList.remove("active");
      blur.className = "blur blur__blue";
      clearInput("#giftInput", "gift");
      break;
    case "buy":
      currencyHeader.classList.remove("active");
      backHeader.classList.add("active");
      historyHeader.classList.remove("active");
      blur.className = "blur blur__white";
      clearInput();
      break;
    case "gift":
      currencyHeader.classList.remove("active");
      backHeader.classList.add("active");
      historyHeader.classList.remove("active");
      blur.className = "blur blur__white";
      clearInput();
      break;
    case "purchase":
      blur.className = "blur blur__white";
      break;
    case "history":
      currencyHeader.classList.remove("active");
      backHeader.classList.remove("active");
      historyHeader.classList.add("active");
      blur.className = "blur";
      break;
    case "ask":
      currencyHeader.classList.remove("active");
      backHeader.classList.add("active");
      historyHeader.classList.remove("active");
      break;
    default:
      currencyHeader.classList.remove("active");
      backHeader.classList.add("active");
      historyHeader.classList.remove("active");
      break;
  }

  if (pageId !== "purchase") {
    const userInput = document.getElementById("userInput");
    if (userInput) {
      userInput.value = "";
    }
  }

  document.querySelectorAll(".wrapper__bottom").forEach((el) => {
    el.classList.remove("active");
  });

  const bottomIdMap = {
    buy: "buyBottom",
    gift: "giftBottom",
    purchase: "purchaseBottom",
  };

  const bottomId = bottomIdMap[pageId];
  if (bottomId) {
    const targetBottom = document.getElementById(bottomId);
    if (targetBottom) {
      targetBottom.classList.add("active");
    }
  }
}

function clearInput(selector = ".buy__input", clearType = "both") {
  const inputs = document.querySelectorAll(selector);
  inputs.forEach((input) => {
    input.value = "";
    updateInputWidth(input);
  });

  updateActiveButton(0);
  disableAllPurchaseButtons();

  if (clearType === "buy" || clearType === "both") {
    updateBuySumDisplay(0);
  }
  if (clearType === "gift" || clearType === "both") {
    updateGiftSumDisplay(0);
  }
}

function updateActiveButton(rawValue) {
  const helpButtons = document.querySelectorAll(".buy__help button");
  helpButtons.forEach((button) => {
    const buttonValue = parseInt(button.textContent.replace(/\D/g, ""), 10);
    button.classList.toggle("active", buttonValue === rawValue);
  });
}

function disableAllPurchaseButtons() {
  const buttons = document.querySelectorAll(".purchaseButton");
  buttons.forEach((btn) => {
    btn.setAttribute("disabled", "");
  });
}
