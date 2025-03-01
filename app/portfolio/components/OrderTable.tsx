import { NavTransition } from "@/app/components/navbar/NavTransition";

export default function OrderTable(props: any) {
  const { data } = props;
  let length = data.length;
  let newArray = data.slice(length - 10, length).reverse();
  return (
    <div className="w-full overflow-x-scroll">
      <table className="border-separate border-spacing-x-2 border-spacing-y-4 md:border-spacing-2 w-full text-sm text-center">
        <thead>
          <tr className=" font-semibold text-gray-500 border-separate border-spacing-5">
            <td className="text-start ">SCRIP</td>
            <td>QUANTITY</td>
            <td>PRICE</td>
            <td>TYPE</td>
            <td>DATE</td>
          </tr>
          <tr>
            <td colSpan={5}>
              <hr />
            </td>
          </tr>
        </thead>
        <tbody>
          {data.slice(0, 10).map((order: any, index: number) => (
            <tr key={`${order.scrip}-${order.time}-${index}`}>
              <td className="py-2 px-4 border-b">{order.scrip}</td>
              <td className="py-2 px-4 border-b">{order.quantity}</td>
              <td className={`py-2 px-4 border-b ${order.type === "SELL" ? "red-text" : "green-text"}`}>
                ₹{order.price}
              </td>
              <td className={`py-2 px-4 border-b ${order.type === "SELL" ? "red-text" : "green-text"}`}>
                {order.type}
              </td>
              <td className="py-2 px-4 border-b">
                {new Date(order.time).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
