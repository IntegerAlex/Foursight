import { useState } from 'react';
import { toast, Slide, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Loading from '@/app/components/Loading';
import { loadFromLocalStorage, saveToLocalStorage } from '@/app/utils/localStorage';

// Constants for localStorage keys
const STORAGE_KEYS = {
  ACCOUNT_DETAILS: 'portfolio_accountDetails',
};

export default function AddFundsButton() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [amount, setAmount] = useState(10000);
  const [loading, setLoading] = useState(false);

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

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value >= 0) {
      setAmount(value);
    }
  };

  const handleAddFunds = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (amount <= 0) {
      notifyError("Please enter a valid amount");
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
      
      // Update the remaining cash
      accountDetails.remainingCash = (parseFloat(accountDetails.remainingCash) || 0) + amount;
      
      // Save updated account details back to localStorage
      saveToLocalStorage(STORAGE_KEYS.ACCOUNT_DETAILS, accountDetails);

      notifySuccess(`Successfully added ₹${amount.toLocaleString()} to your account`);
      setIsModalOpen(false);
      
      // Force refresh the page after a short delay to show updated balance
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error: any) {
      console.error("Error adding funds:", error);
      notifyError("Failed to add funds. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="px-4 py-2 bg-[#037A68] text-white rounded-md hover:bg-teal-700 transition-colors font-semibold flex items-center"
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className="h-5 w-5 mr-2" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M12 6v6m0 0v6m0-6h6m-6 0H6" 
          />
        </svg>
        Add Funds
      </button>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold green-text">Add Funds</h2>
              <button 
                onClick={() => setIsModalOpen(false)}
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
                  value={amount}
                  onChange={handleAmountChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                  min="0"
                />
              </div>
              
              <div className="flex justify-between items-center mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#037A68] text-white rounded-md hover:bg-teal-700 disabled:bg-gray-400"
                  disabled={loading}
                >
                  {loading ? (
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
    </>
  );
} 