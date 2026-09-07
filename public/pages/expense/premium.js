const cashfree = Cashfree({
  mode: "sandbox",
});


window.isPremiumUser = false;


function syncHeaderHeight() {
  const header = document.querySelector(".tracker-header");
  if (header) {
    document.documentElement.style.setProperty(
      "--header-h",
      header.offsetHeight + "px"
    );
  }
}


function showPremiumUI(isPremium, name) {
  window.isPremiumUser = isPremium;

  const leaderboardBtn = document.getElementById("leaderboard-btn");
  if (leaderboardBtn) leaderboardBtn.disabled = isPremium !== true;

  const banner = document.getElementById("premium-banner");
  const nameEl = document.getElementById("premium-user-name");
  const btnLabel = document.getElementById("premium-btn-label");
  const btn = document.getElementById("premium-btn");

  if (banner) banner.hidden = !isPremium;
  // textContent, not innerHTML — name is user-supplied data.
  if (nameEl) nameEl.textContent = isPremium ? (name || "") : "";

  if (isPremium) {
  if (btn) {
    btn.classList.add("d-none");
  }
}

syncHeaderHeight();
}
async function checkPremiumStatus() {
  const token = localStorage.getItem("token");
  if (!token) return;

  try {
    const response = await fetch("http://localhost:3000/payment/premium-status", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) return;

    const data = await response.json();
    showPremiumUI(!!data.isPremium, data.name);
  } catch (error) {
    console.error("Failed to check premium status:", error);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  syncHeaderHeight();
  checkPremiumStatus();
});
window.addEventListener("resize", syncHeaderHeight);

document.getElementById("premium-btn").addEventListener("click", async () => {
  const token = localStorage.getItem("token");

  try {
    // 1. Create payment order from backend
    const response = await fetch("http://localhost:3000/payment/pay", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to create payment order");
    }

    const data = await response.json();

    const paymentSessionId = data.paymentSessionId;
    const orderId = data.orderId;

    if (!paymentSessionId) {
      throw new Error("Payment session ID not received");
    }

    // 2. Cashfree checkout options
    const checkoutOptions = {
      paymentSessionId: paymentSessionId,
      redirectTarget: "_modal",
    };

    // 3. Open Cashfree payment modal
    const result = await cashfree.checkout(checkoutOptions);

    // 4. Handle error
    if (result.error) {
      console.error("Payment error:", result.error);
      alert("Payment was cancelled or failed.");
      return;
    }

    // 5. Handle redirect
    if (result.redirect) {
      console.log("Customer redirected for payment completion.");
      return;
    }

    // 6. Payment submitted
    if (result.paymentDetails) {
      console.log("Payment submitted");
      console.log(result.paymentDetails);

      // 7. Check payment status from backend
      const statusResponse = await fetch(
        `http://localhost:3000/payment/status/${orderId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!statusResponse.ok) {
        throw new Error("Failed to check payment status");
      }

      const statusData = await statusResponse.json();

      console.log("Payment status:", statusData);

      // The backend reports "Success" / "Pending" / "Failure"
      if (statusData.orderStatus === "Success") {
        alert("Premium membership purchased successfully!");
        await checkPremiumStatus();
      } else {
        alert(
          "Payment status: " +
            (statusData.orderStatus || "Payment pending")
        );
      }
    }
  } catch (error) {
    console.error("Payment error:", error);
    alert("Something went wrong while processing payment.");
  }
});