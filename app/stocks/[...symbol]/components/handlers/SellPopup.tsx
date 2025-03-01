import Loading from "@/app/components/Loading";
import { useState } from "react";
import { toast, Slide, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { loadFromLocalStorage, saveToLocalStorage } from "@/app/utils/localStorage";

// Constants for localStorage keys
const STORAGE_KEYS = {
  RECENT_TRANSACTIONS: 'transactions_recent',
  ACCOUNT_DETAILS: 'portfolio_accountDetails'
};

export default function SellPopup(props: any) {
  const [quantity, setQuantity] = useState(0);
  const [loading, setLoading] = useState(false);
  let symbol = props.symbol || "";
  
  const notifySuccess = (message: string) =>
    toast.success(message, {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "light",
      transition: Slide,
    });
    
  const notifyError = (message: string) =>
    toast.error(message, {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "light",
      transition: Slide,
    });
    
  function updateQuantity(e: any) {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value >= 0) {
      setQuantity(value);
    } else {
      setQuantity(0);
    }
  }

  async function handleSell(e: any) {
    e.preventDefault();
    
    if (quantity <= 0) {
      notifyError("Please enter a valid quantity");
      return;
    }
    
    setLoading(true);
    try {
      // Get current account details from localStorage
      const accountDetails = loadFromLocalStorage(STORAGE_KEYS.ACCOUNT_DETAILS) || {
        remainingCash: 0,
        spentCash: 0,
        scrips: [],
        orderBook: []
      };
      
      // Find the stock in the user's portfolio
      const existingScripIndex = accountDetails.scrips.findIndex(
        (scrip: any) => scrip.scrip === decodeURIComponent(symbol)
      );
      
      // Check if user owns this stock
      if (existingScripIndex === -1) {
        notifyError("You don't own any shares of this stock!");
        setLoading(false);
        return;
      }
      
      const existingScrip = accountDetails.scrips[existingScripIndex];
      
      // Check if user has enough shares to sell
      if (existingScrip.quantity < quantity) {
        notifyError("Insufficient stocks! You don't have enough shares to sell.");
        setLoading(false);
        return;
      }
      
      // Calculate total sale value
      const totalSaleValue = quantity * props.ltp;
      
      // Update account details
      accountDetails.remainingCash = (parseFloat(accountDetails.remainingCash) || 0) + totalSaleValue;
      
      // Update or remove the stock from portfolio
      if (existingScrip.quantity === quantity) {
        // Remove the stock completely if selling all shares
        accountDetails.scrips.splice(existingScripIndex, 1);
      } else {
        // Update the quantity if selling partial shares
        accountDetails.scrips[existingScripIndex] = {
          ...existingScrip,
          quantity: existingScrip.quantity - quantity,
          ltp: props.ltp,
          scripValue: (existingScrip.quantity - quantity) * props.ltp
        };
      }
      
      // Add to order book
      accountDetails.orderBook.unshift({
        scrip: decodeURIComponent(symbol),
        companyName: props.companyName,
        quantity: quantity,
        price: props.ltp,
        type: "SELL",
        time: new Date().toISOString()
      });
      
      // Keep only the most recent 50 orders
      if (accountDetails.orderBook.length > 50) {
        accountDetails.orderBook = accountDetails.orderBook.slice(0, 50);
      }
      
      // Save updated account details
      saveToLocalStorage(STORAGE_KEYS.ACCOUNT_DETAILS, accountDetails);
      
      // Create transaction record
      const transaction = {
        scrip: decodeURIComponent(symbol),
        quantity: quantity,
        price: props.ltp,
        type: "SELL",
        time: new Date().toISOString()
      };
      
      // Get existing transactions or initialize empty array
      const existingTransactions = loadFromLocalStorage(STORAGE_KEYS.RECENT_TRANSACTIONS) || [];
      
      // Add new transaction to the beginning of the array
      const updatedTransactions = [transaction, ...existingTransactions].slice(0, 20); // Keep only 20 most recent
      
      // Save updated transactions
      saveToLocalStorage(STORAGE_KEYS.RECENT_TRANSACTIONS, updatedTransactions);
      
      notifySuccess(`Successfully sold ${quantity} ${props.symbol}`);
    } catch (err: any) {
      console.error("Error selling stock:", err);
      notifyError("Failed to sell the stock. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white mx-4 my-2">
      <ToastContainer />
      <div className="flex flex-row">
        <h1 className="text-3xl  red-text mr-2">SELL</h1>
        <h1 className="text-2xl">{props.companyName}</h1>
      </div>
      <div className="mt-2 text-lg">
        LTP: <span className="ml-1 font-semibold red-text">₹ {props.ltp}</span>
      </div>
      <div>
        <form onSubmit={handleSell}>
          <div className="text-lg flex flex-col mt-4">
            <label className="text-xl ">Quantity</label>
            <input
              type="number"
              className="border border-[#B8B8B8] rounded-md my-2 p-2"
              value={quantity}
              onChange={updateQuantity}
              min="0"
            />
            <h1 className="red-text font-semibold">
              Total value: ₹{(quantity * props.ltp).toFixed(2)}
            </h1>
            <div className="flex justify-center items-center">
              <button 
                type="submit"
                className="mt-2 flex w-fit px-4 text-xl font-semibold p-2 bg-[#037A68] text-white rounded-md"
                disabled={loading}
              >
                {loading ? (
                  <div className="w-full h-full flex justify-center items-center">
                    <Loading /> <span className="ml-2"> Sell </span>
                  </div>
                ) : (
                  "Sell"
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
