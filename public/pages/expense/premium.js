const cashfree = Cashfree({
  mode: "sandbox",
});

document.getElementById("premium-btn").addEventListener("click", async () => {
  try {
    // 1. Create payment order from backend
    const response = await fetch("http://localhost:3000/payment/pay", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
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
        }
      );

      if (!statusResponse.ok) {
        throw new Error("Failed to check payment status");
      }

      const statusData = await statusResponse.json();

      console.log("Payment status:", statusData);

      if (
        statusData.orderStatus === "PAID" ||
        statusData.orderStatus === "SUCCESS"
      ) {
        alert("Premium membership purchased successfully!");

        // Change button after successful payment
        document.getElementById("premium-btn-label").textContent =
          "Premium Active";
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