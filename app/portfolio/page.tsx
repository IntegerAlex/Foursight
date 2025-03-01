"use client";
import { useState, useEffect } from "react";
import Navbar from "../components/navbar/Navbar";
import { NavTransition } from "../components/navbar/NavTransition";
import Networth from "./sections/Networth";
import RouterComponent from "../components/RouterComponent";
import { loadFromLocalStorage } from "../utils/localStorage";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Constants for localStorage keys
const STORAGE_KEYS = {
  ACCOUNT_DETAILS: 'portfolio_accountDetails'
};

// Sample initial account data
const sampleAccountData = {
  remainingCash: 100000,
  spentCash: 0,
  scrips: [],
  orderBook: []
};

// Sample profit details
const sampleProfitDetails = {
  overallProfit: 0,
  profitArray: []
};

export default function PortfolioPage() {
  const [details, setDetails] = useState(sampleAccountData);
  const [profitDetails, setProfitDetails] = useState(sampleProfitDetails);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Load account details from localStorage
    const loadData = () => {
      const accountDetails = loadFromLocalStorage(STORAGE_KEYS.ACCOUNT_DETAILS) || sampleAccountData;
      setDetails(accountDetails);
      
      // Calculate profit details
      const calculatedProfitDetails = calculateProfitDetails(accountDetails);
      setProfitDetails(calculatedProfitDetails);
      
      setIsLoading(false);
    };
    
    loadData();
    
    // Set up an interval to refresh data
    const intervalId = setInterval(loadData, 5000);
    
    return () => clearInterval(intervalId);
  }, []);
  
  // Function to calculate profit details from account data
  const calculateProfitDetails = (accountData: any) => {
    if (!accountData || !accountData.scrips) {
      return sampleProfitDetails;
    }
    
    // Calculate profit for each stock
    const profitArray = accountData.scrips.map((scrip: any) => {
      const currentValue = scrip.quantity * scrip.ltp;
      const investedValue = scrip.quantity * scrip.avgPrice;
      const profit = currentValue - investedValue;
      const profitPercentage = (profit / investedValue) * 100;
      
      return {
        symbol: scrip.symbol,
        profit,
        profitPercentage: isNaN(profitPercentage) ? 0 : profitPercentage
      };
    });
    
    // Calculate overall profit
    const totalCurrentValue = accountData.scrips.reduce(
      (sum: number, scrip: any) => sum + (scrip.quantity * scrip.ltp), 0
    );
    
    const totalInvestedValue = accountData.scrips.reduce(
      (sum: number, scrip: any) => sum + (scrip.quantity * scrip.avgPrice), 0
    );
    
    const overallProfit = totalCurrentValue - totalInvestedValue;
    
    return {
      overallProfit,
      profitArray
    };
  };
  
  return (
    <div>
      <ToastContainer />
      <div className="md:mx-[15%]">
        <Navbar />
        <div className="flex flex-col justify-start mx-6 md:mx-0">
          <div className="my-4 ">
            <RouterComponent />
          </div>

          <div>
            {isLoading ? (
              <div className="text-center py-4">Loading portfolio data...</div>
            ) : (
              <Networth 
                data={details} 
                profitDetails={profitDetails} 
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
