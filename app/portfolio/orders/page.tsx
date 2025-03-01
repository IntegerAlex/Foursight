"use client";
import Navbar from "@/app/components/navbar/Navbar";
import { NavTransition } from "@/app/components/navbar/NavTransition";
import { useCachedFetch } from "@/app/hooks/useLocalStorage";
import { loadFromLocalStorage } from "@/app/utils/localStorage";
import { useState, useEffect } from "react";

// Constants for localStorage keys
const STORAGE_KEYS = {
  ACCOUNT_DETAILS: 'portfolio_accountDetails'
};

export default function OrderPage() {
  const [orderBook, setOrderBook] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Load order book from localStorage
    const loadData = () => {
      const accountDetails = loadFromLocalStorage(STORAGE_KEYS.ACCOUNT_DETAILS);
      if (accountDetails && accountDetails.orderBook) {
        setOrderBook(accountDetails.orderBook.reverse() || []);
      } else {
        setOrderBook([]);
      }
      setIsLoading(false);
    };
    
    loadData();
    
    // Set up an interval to refresh data
    const intervalId = setInterval(loadData, 5000);
    
    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="md:mx-[15%]">
      <Navbar />
      <div className="flex flex-col justify-start mx-6 md:mx-0">
        <div className="my-4 ">
          <NavTransition
            className="text-gray-500 font-semibold"
            href="/portfolio"
          >
            ← Back to Portfolio
          </NavTransition>
        </div>
        <div className="my-4">
          <h1 className="text-3xl font-semibold">Order Book</h1>
        </div>
        {isLoading ? (
          <div className="text-center py-4">Loading order book...</div>
        ) : orderBook.length === 0 ? (
          <div className="text-center py-4">
            No orders found. Start trading to see your order history.
          </div>
        ) : (
          <div className="w-full overflow-x-scroll">
            <table className="border-separate border-spacing-x-2 border-spacing-y-4 md:border-spacing-2 w-full text-sm text-center">
              <thead>
                <tr className=" font-semibold text-gray-500 border-separate border-spacing-5">
                  <td className="text-start ">SCRIP</td>
                  <td>QUANTITY</td>
                  <td>PRICE</td>
                  <td>TYPE</td>
                  <td>DATE</td>
                  <td>TIME</td>
                </tr>
                <tr>
                  <td colSpan={6}>
                    <hr />
                  </td>
                </tr>
              </thead>
              <tbody>
                {orderBook.map((order: any, index: number) => {
                  return (
                    <tr key={`${order.symbol}-${order.timestamp}-${index}`}>
                      <td className="text-start font-semibold">
                        <NavTransition
                          className=""
                          href={`/stocks/${encodeURIComponent(order.symbol)}`}
                        >
                          {order.symbol}{" "}
                        </NavTransition>
                      </td>
                      <td className="text-gray-600 font-semibold">
                        {order.quantity}
                      </td>
                      <td
                        className={`green-text font-semibold ${order.type === "SELL" ? "red-text" : "green-text"}`}
                      >
                        ₹{order.price.toFixed(1)}
                      </td>
                      <td
                        className={` font-semibold ${order.type === "SELL" ? "red-text" : "green-text"}`}
                      >
                        {order.type}
                      </td>{" "}
                      <td className="text-gray-600 font-semibold">
                        {new Date(order.timestamp).toLocaleDateString()}
                      </td>
                      <td className="text-gray-600 font-semibold">
                        {new Date(order.timestamp).toLocaleTimeString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
