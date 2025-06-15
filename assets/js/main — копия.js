document.addEventListener("DOMContentLoaded", function () {
  const switchBlock = document.querySelector(".switch");
  const currencyBlock = document.querySelector(".currency");

  if (!switchBlock || !currencyBlock) return;

  document.addEventListener("click", async function (event) {
    const isInsideSwitch = event.target.closest(".switch");
    const isCurrencyButton = event.target.closest(".currency button");

    if (isInsideSwitch) {
      if (isCurrencyButton && currencyBlock.classList.contains("active")) {
        currencyBlock.querySelectorAll("button").forEach((btn) => btn.classList.remove("active"));
        isCurrencyButton.classList.add("active");

        currencyBlock.classList.remove("ruble", "usd");

        if (isCurrencyButton.classList.contains("usd")) {
          currencyBlock.classList.add("usd");
          await API.setCurrentCurrency("usd");
        } else if (isCurrencyButton.classList.contains("ruble")) {
          currencyBlock.classList.add("ruble");
          await API.setCurrentCurrency("ruble");
        }

        currencyBlock.classList.remove("active");
      } else {
        if (!currencyBlock.classList.contains("active")) {
          currencyBlock.classList.add("active");
        }
      }

      event.stopPropagation();
    } else {
      currencyBlock.classList.remove("active");
    }
  });
});

document.addEventListener("DOMContentLoaded", () => {
  const inputs = document.querySelectorAll(".buy__input");
  const ruler = document.getElementById("buyStarsRuler");
  const helpButtons = document.querySelectorAll(".buy__help button");
  const wrappers = document.querySelectorAll(".buy__wrapper");
  const blur = document.querySelector(".blur");
  const nextButton = document.getElementById("nextButton");

  const MAX_VALUE = 1000000;
  const MIN_VALUE = 50;

  if (!ruler || !wrappers.length) return;

  function formatNumberWithCommas(value) {
    const numeric = value.replace(/\D/g, "");
    return numeric.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  async function updateBuySumDisplay(rawValue) {
    const buySumElement = document.querySelector(".buySum");
    if (!buySumElement) return;

    const currency = await API.getCurrentCurrency();
    const rate = (await API.getRates())[currency];

    let price = currency === "usd" ? (rawValue * rate).toFixed(2) : Math.round(rawValue * rate);

    const formattedPrice = Number(price).toLocaleString("ru-RU", {
      minimumFractionDigits: currency === "usd" ? 2 : 0,
      maximumFractionDigits: currency === "usd" ? 2 : 0,
    });

    const parentText = buySumElement.closest(".buy__text");
    if (parentText) {
      parentText.innerHTML = `К оплате: <span class="buySum">${formattedPrice}</span> ${currency === "usd" ? "$" : "₽"}`;
    }
  }

  function updateInputWidth(input) {
    const value = input.value || input.placeholder || "0";
    ruler.textContent = value;
    input.style.width = `${ruler.offsetWidth + 8}px`;
  }

  function updateActiveButton(rawValue) {
    helpButtons.forEach((button) => {
      const buttonValue = parseInt(button.textContent.replace(/\D/g, ""), 10);
      button.classList.toggle("active", buttonValue === rawValue);
    });
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
        return;
      }

      let rawValue = parseInt(rawString, 10);
      if (rawValue > MAX_VALUE) rawValue = MAX_VALUE;

      input.value = formatNumberWithCommas(String(rawValue));
      updateInputWidth(input);
      updateActiveButton(rawValue);
      updateWrapperSuccess(rawValue);
      await updateBuySumDisplay(rawValue);
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

      updateActiveButton(value);
      updateWrapperSuccess(value);
      await updateBuySumDisplay(value);
    });
  });

  if (nextButton) {
    nextButton.addEventListener("click", async (e) => {
      const input = inputs[0]; // Assuming first input is primary
      const rawValue = parseInt(input.value.replace(/\D/g, "") || "0", 10);
      const usernameInput = document.getElementById("userInput");
      const giftWrapper = document.querySelector(".buy__gift");
      const errorText = document.querySelector(".buy__gift-error");

      if (usernameInput && giftWrapper && errorText) {
        const username = usernameInput.value.trim().replace(/^@/, "");
        const isValidUser = (await API.getUsers()).includes(username);

        if (!isValidUser) {
          giftWrapper.classList.add("error");
          errorText.style.display = "block";
          e.preventDefault();
        } else {
          giftWrapper.classList.remove("error");
          errorText.style.display = "none";
        }
      }

      if (rawValue < MIN_VALUE) {
        nextButton.classList.add("error");
        blur.className = "blur blur__red";
        document.querySelector(".buy__bottom-text")?.classList.add("red");
        e.preventDefault();
        return;
      } else {
        nextButton.classList.remove("error");
        blur.className = "blur blur__blue";
        document.querySelector(".buy__bottom-text")?.classList.remove("red");
      }
    });
  }
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
  const wrapper = document.querySelector(".history__wrapper");
  const historyBlock = wrapper?.querySelector(".history");
  const emptyBlock = wrapper?.querySelector(".history__empty");
  const inner = wrapper?.querySelector(".history__inner");

  if (!wrapper || !historyBlock || !emptyBlock || !inner) return;

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

    if (!history.length) {
      wrapper.classList.add("empty");
      return;
    }

    wrapper.classList.remove("empty");
    inner.innerHTML = "";

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

      inner.appendChild(block);
    });

    const endBlock = document.createElement("div");
    endBlock.classList.add("block");
    endBlock.innerHTML = `<div class="block__text">Все транзакции на данный момент.</div>`;
    inner.appendChild(endBlock);
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

let activePage = "home";
let pageHistory = [];

function goTo(pageId) {
  if (pageId === "back") {
    if (pageHistory.length > 0) {
      const previous = pageHistory.pop();
      goTo(previous);
    }
    return;
  }

  if (pageId !== activePage) {
    pageHistory.push(activePage);
    activePage = pageId;
  }

  const wrappers = document.querySelectorAll(".main");
  wrappers.forEach((w) => w.classList.remove("active"));
  const targetWrapper = document.getElementById(pageId);
  if (targetWrapper) {
    targetWrapper.classList.add("active");
  }

  updateHeaderForPage(pageId);
  console.log(activePage);
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
    ask: "Вопрос",
  };

  if (pageNameElement) {
    pageNameElement.innerText = pageTitles[pageId] || "";
  }

  switch (pageId) {
    case "home":
      currencyHeader.classList.add("active");
      backHeader.classList.remove("active");
      blur.className = "blur blur__blue";
      break;
    case "buy":
      currencyHeader.classList.remove("active");
      backHeader.classList.add("active");
      blur.className = "blur blur__white";
      break;
    case "ask":
      currencyHeader.classList.remove("active");
      backHeader.classList.add("active");
      break;
    default:
      currencyHeader.classList.remove("active");
      backHeader.classList.add("active");
      break;
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
