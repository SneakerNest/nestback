const processPayment = async (req, res) => {
    try {
      const card = req.body.creditCard;
  
      if (!card) {
        return res.status(400).json({ msg: "Missing credit card" });
      }
  
      const { cardNumber, expiryDate, cvv } = card;
  
      if (!cardNumber || !expiryDate || !cvv) {
        console.log("A field is missing");
        return res.status(400).json({ msg: "Invalid credit card" });
      }
  
      if (cardNumber.length !== 16 || cvv.length !== 3 || expiryDate.length !== 5) {
        console.log("Wrong length");
        return res.status(400).json({ msg: "Invalid credit card" });
      }
  
      const [month, year] = expiryDate.split('/');
      if (!month || !year || month.length !== 2 || year.length !== 2) {
        console.log("Wrong expiry date format");
        return res.status(400).json({ msg: "Invalid expiry date" });
      }
  
      if (parseInt(year) < 25) {
        console.log("Card expired");
        return res.status(400).json({ msg: "Card expired" });
      }
  
      return res.status(200).json({ msg: "Payment processed" });
  
    } catch (err) {
      console.log(err);
      return res.status(500).json({ msg: "Error processing payment" });
    }
  };
  
  export { processPayment };