"use client";
import TopMovers from "../components/sections/TopMovers/TopMovers";
import Navbar from "../components/navbar/Navbar";
import { useEffect, useState } from "react";
import { NavTransition } from "../components/navbar/NavTransition";
import IndicesSection from "./sections/IndicesSection";
import NewsSection from "./sections/NewsSection";
import TopMoversSection from "./sections/TopMoversSection";
import TopMarketCap from "./components/TopMarketCap";
import RouterComponent from "../components/RouterComponent";
import { loadFromLocalStorage } from "../utils/localStorage";

// Constants for localStorage keys
const STORAGE_KEYS = {
  MARKET_CAP: 'dashboard_marketCap',
  INDICES: 'dashboard_indices',
  TOP_MOVERS: 'dashboard_topMovers',
  NEWS: 'dashboard_news',
  ACCOUNT_DETAILS: 'portfolio_accountDetails'
};

// Sample data for dashboard components
const sampleMarketCapData = [
  { symbol: "RELIANCE", companyName: "Reliance Industries", marketCap: 1800000, change: 2.5 },
  { symbol: "TCS", companyName: "Tata Consultancy Services", marketCap: 1200000, change: 1.2 },
  { symbol: "HDFCBANK", companyName: "HDFC Bank", marketCap: 1000000, change: -0.8 },
  { symbol: "INFY", companyName: "Infosys", marketCap: 800000, change: 0.5 },
  { symbol: "HINDUNILVR", companyName: "Hindustan Unilever", marketCap: 600000, change: 1.7 }
];

const sampleIndicesData = {
  NIFTY50: { value: 22500, change: 1.2 },
  SENSEX: { value: 74000, change: 1.1 },
  BANKNIFTY: { value: 48500, change: 0.9 },
  FINNIFTY: { value: 21300, change: 1.3 }
};

const sampleTopMovers = [
  { symbol: "TATAMOTORS", companyName: "Tata Motors", change: 5.2, price: 850 },
  { symbol: "SUNPHARMA", companyName: "Sun Pharmaceutical", change: 4.8, price: 1250 },
  { symbol: "BAJFINANCE", companyName: "Bajaj Finance", change: -4.5, price: 6800 },
  { symbol: "TECHM", companyName: "Tech Mahindra", change: -3.9, price: 1320 },
  { symbol: "ADANIPORTS", companyName: "Adani Ports", change: 3.7, price: 1180 }
];

export default function DashboardPage() {
  const [marketCapData, setMarketCapData] = useState(sampleMarketCapData);
  const [indicesData, setIndicesData] = useState(sampleIndicesData);
  const [topMovers, setTopMovers] = useState(sampleTopMovers);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      // Check if we have cached data
      const cachedMarketCap = loadFromLocalStorage(STORAGE_KEYS.MARKET_CAP);
      const cachedIndices = loadFromLocalStorage(STORAGE_KEYS.INDICES);
      const cachedTopMovers = loadFromLocalStorage(STORAGE_KEYS.TOP_MOVERS);
      
      // Use cached data if available, otherwise use sample data
      if (cachedMarketCap) setMarketCapData(cachedMarketCap);
      if (cachedIndices) setIndicesData(cachedIndices);
      if (cachedTopMovers) setTopMovers(cachedTopMovers);
      
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex flex-col md:mx-[15%] ">
      <Navbar />
      <div className="mt-4 mb-8 mx-6 md:mx-0">
        <div>
          <RouterComponent />
        </div>
        <div className="flex flex-col md:flex-row">
          <div className="flex flex-col md:w-[70%] ">
            <div className="mt-4 text-xl font-semibold mb-2">
              Welcome to your <span className="green-text">Dashboard!</span>
            </div>

            <div className="flex flex-col ">
              {isLoading ? (
                <div className="text-center py-4">Loading dashboard data...</div>
              ) : (
                <>
                  <IndicesSection data={indicesData} />
                  <TopMoversSection data={topMovers} />
                  <TopMarketCap data={marketCapData} />
                </>
              )}
            </div>
          </div>
          <div className="ml-8">{/* <NewsSection data={news} /> */}</div>
        </div>
      </div>
    </div>
  );
}
