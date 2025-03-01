import { apiURL } from "@/app/components/apiURL";
import Loading from "@/app/components/Loading";
import axios from "axios";
import { useState } from "react";
import { Slide, toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { loadFromLocalStorage, saveToLocalStorage } from "@/app/utils/localStorage";
import { getCookie } from "cookies-next";

// Constants for localStorage keys
const STORAGE_KEYS = {
  RECENT_TRANSACTIONS: 'transactions_recent',
  ACCOUNT_DETAILS: 'portfolio_accountDetails'
};

export default function BuyPopup(props: any) {
  let symbol = props.symbol || "";
  const token = getCookie("token");
  
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

  const [quantity, setQuantity] = useState(0);
  const [showAddFunds, setShowAddFunds] = useState(false);
  const [fundAmount, setFundAmount] = useState(10000);
  const [fundLoading, setFundLoading] = useState(false);
  const [loading, setLoading] = useState(false);

  function updateQuantity(e: any) {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value >= 0) {
      setQuantity(value);
    } else {
      setQuantity(0);
    }
  }

  async function handleBuy(e: any) {
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
      
      // Calculate total cost
      const totalCost = quantity * props.ltp;
      
      // Check if user has enough funds
      if (accountDetails.remainingCash < totalCost) {
        notifyError("Insufficient Funds! Please add more funds to continue.");
        setLoading(false);
        return;
      }
      
      // Update account details
      accountDetails.remainingCash -= totalCost;
      accountDetails.spentCash = (parseFloat(accountDetails.spentCash) || 0) + totalCost;
      
      // Check if user already owns this stock
      const existingScripIndex = accountDetails.scrips.findIndex(
        (scrip: any) => scrip.scrip === decodeURIComponent(symbol)
      );
      
      if (existingScripIndex !== -1) {
        // Update existing holding
        const existingScrip = accountDetails.scrips[existingScripIndex];
        const newAvgPrice = ((existingScrip.buyPrice * existingScrip.quantity) + (props.ltp * quantity)) / 
                           (existingScrip.quantity + quantity);
        
        accountDetails.scrips[existingScripIndex] = {
          ...existingScrip,
          quantity: existingScrip.quantity + quantity,
          buyPrice: newAvgPrice,
          ltp: props.ltp,
          scripName: props.companyName,
          scripValue: (existingScrip.quantity + quantity) * props.ltp
        };
      } else {
        // Add new holding
        accountDetails.scrips.push({
          scrip: decodeURIComponent(symbol),
          companyName: props.companyName,
          quantity: quantity,
          buyPrice: props.ltp,
          ltp: props.ltp,
          scripName: props.companyName,
          scripValue: quantity * props.ltp
        });
      }
      
      // Add to order book
      accountDetails.orderBook.unshift({
        scrip: decodeURIComponent(symbol),
        companyName: props.companyName,
        quantity: quantity,
        price: props.ltp,
        type: "BUY",
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
        type: "BUY",
        time: new Date().toISOString()
      };
      
      // Get existing transactions or initialize empty array
      const existingTransactions = loadFromLocalStorage(STORAGE_KEYS.RECENT_TRANSACTIONS) || [];
      
      // Add new transaction to the beginning of the array
      const updatedTransactions = [transaction, ...existingTransactions].slice(0, 20); // Keep only 20 most recent
      
      // Save updated transactions
      saveToLocalStorage(STORAGE_KEYS.RECENT_TRANSACTIONS, updatedTransactions);
      
      notifySuccess(`Successfully bought ${quantity} ${props.symbol}`);
    } catch (err: any) {
      console.error("Error buying stock:", err);
      notifyError("Failed to buy the stock. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleAddFunds(e: any) {
    e.preventDefault();
    
    if (fundAmount <= 0) {
      notifyError("Please enter a valid amount");
      return;
    }

    setFundLoading(true);
    try {
      // Get current account details from localStorage
      const accountDetails = loadFromLocalStorage(STORAGE_KEYS.ACCOUNT_DETAILS) || {
        remainingCash: 0,
        spentCash: 0,
        scrips: [],
        orderBook: []
      };
      
      // Update the remaining cash
      accountDetails.remainingCash = (parseFloat(accountDetails.remainingCash) || 0) + fundAmount;
      
      // Save updated account details back to localStorage
      saveToLocalStorage(STORAGE_KEYS.ACCOUNT_DETAILS, accountDetails);

      notifySuccess(`Successfully added ₹${fundAmount.toLocaleString()} to your account`);
      setShowAddFunds(false);
      
      // Force refresh the page after a short delay to show updated balance
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error: any) {
      console.error("Error adding funds:", error);
      notifyError("Failed to add funds. Please try again.");
    } finally {
      setFundLoading(false);
    }
  }

  return (
    <div className="bg-white mx-4 my-2">
      <ToastContainer />
      <div className="flex flex-row items-end">
        <h1 className="text-3xl  green-text mr-2">BUY</h1>
        <h1 className="text-2xl">{props.companyName}</h1>
      </div>
      <div className="mt-2 text-lg">
        LTP:{" "}
        <span className="ml-1 font-semibold green-text">₹ {props.ltp}</span>
      </div>
      <div>
        <form onSubmit={handleBuy}>
          <div className="text-lg flex flex-col mt-4">
            <label className="text-xl ">Quantity</label>
            <input
              type="number"
              className="border border-[#B8B8B8] rounded-md my-2 p-2"
              value={quantity}
              onChange={updateQuantity}
              min="0"
            />
            <h1 className="green-text font-semibold">
              Total value: ₹{(quantity * props.ltp).toFixed(2)}
            </h1>
            <div className="flex justify-center items-center gap-2">
              <button 
                type="submit"
                className="mt-2 flex w-fit px-4 text-xl font-semibold p-2 bg-[#037A68] text-white rounded-md"
                disabled={loading}
              >
                {loading ? (
                  <div className="w-full h-full flex justify-center items-center">
                    <Loading /> <span className="ml-2"> Buy </span>
                  </div>
                ) : (
                  "Buy"
                )}
              </button>
              <button 
                type="button"
                onClick={() => setShowAddFunds(true)} 
                className="mt-2 flex w-fit px-4 text-xl font-semibold p-2 border border-[#037A68] text-[#037A68] rounded-md"
              >
                Add Funds
              </button>
            </div>
          </div>
        </form>
      </div>

      {showAddFunds && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold green-text">Add Funds</h2>
              <button 
                onClick={() => setShowAddFunds(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleAddFunds}>
              <div className="mb-4">
                <label htmlFor="amount" className="block text-gray-700 font-semibold mb-2">
                  Amount (₹)
                </label>
                <input
                  type="number"
                  id="amount"
                  value={fundAmount}
                  onChange={(e) => {
                    const value = parseInt(e.target.value);
                    if (!isNaN(value) && value >= 0) {
                      setFundAmount(value);
                    }
                  }}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                  min="0"
                />
              </div>
              
              <div className="flex justify-between items-center mt-6">
                <button
                  type="button"
                  onClick={() => setShowAddFunds(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#037A68] text-white rounded-md hover:bg-teal-700 disabled:bg-gray-400"
                  disabled={fundLoading}
                >
                  {fundLoading ? (
                    <div className="flex items-center justify-center">
                      <Loading /> <span className="ml-2">Processing</span>
                    </div>
                  ) : (
                    "Add Funds"
                  )}
                </button>
              </div>
            </form>
            
            <div className="mt-4 text-sm text-gray-500">
              <p>Note: This is a paper trading platform. No real money will be charged.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
