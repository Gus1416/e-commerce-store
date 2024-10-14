/**
 * This function retrieves analytics data from the database.
 * It returns an object with 4 properties: users, products, totalSales, and totalRevenue.
 * The users property is the total number of users in the database.
 * The products property is the total number of products in the database.
 * The totalSales property is the total number of sales.
 * The totalRevenue property is the total revenue from all sales.
 * The function uses MongoDB's aggregation framework to group all documents in the Order collection together and calculate the totalSales and totalRevenue.
 * If there are no documents in the Order collection, the function returns an object with totalSales and totalRevenue set to 0.
 */
import Order from "../models/order.model.js";
import User from "../models/user.model.js";
import Product from "../models/product.model.js";

export const getAnalyticsData = async () => {
    const totalUsers = await User.countDocuments();
    const totalProducts = await Product.countDocuments();

    const salesData = await Order.aggregate([
        {
            $group: {
                _id: null, // Groups all documents together
                totalSales: { $sum: 1 },
                totalRevenue: { $sum: "$totalAmount" }
            }
        }
    ]);
    
    const { totalSales, totalRevenue } = salesData[0] || { totalSales: 0, totalRevenue: 0 }; 

    return {
        users: totalUsers,
        products: totalProducts,
        totalSales,
        totalRevenue
    };
};

/**
 * This function takes a start date and an end date as parameters and returns an array of objects, each with 3 properties: date, sales, and revenue.
 * The function uses MongoDB's aggregation framework to group the Order documents by date and calculate the total sales and revenue for each date.
 * The $match stage filters the documents to only include those with a createdAt date between the start and end dates.
 * The $group stage groups the documents together by date and calculates the total sales and revenue for each date.
 * The $sort stage sorts the documents in ascending order by date.
 * The function then maps over the array of dates between the start and end dates, and for each date, it finds the corresponding document in the aggregation result and returns an object with the date, sales, and revenue.
 * If there is no document in the aggregation result for a particular date, the function sets the sales and revenue to 0.
 */
export const getDailySalesData = async (startDate, endDate) => {
    try {
        const dailySalesData = await Order.aggregate([
            {
                $match: {
                    createdAt: {
                        $gte: startDate,
                        $lte: endDate
                    }
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    sales: { $sum: 1 },
                    revenue: { $sum: "$totalAmount" }
                }
            },
            {
                $sort: { _id: 1 }
            }
        ]);
    
        const dateArray = getDatesInRange(startDate, endDate);
    
        return dateArray.map(date => {
            const foundData = dailySalesData.find(data => data._id === date);
    
            return {
                date,
                sales: foundData?.sales || 0, // This is a shortcut to set sales to 0 if foundData is undefined
                revenue: foundData?.revenue || 0
            }
        })
    } catch (error) {
        throw error;
    }
};

// Helper function to get all dates between two dates in an array
const getDatesInRange = (startDate, endDate) => {
    const dates = [];
    let currentDate = startDate;

    while (currentDate <= endDate) {
        dates.push(new Date(currentDate).toISOString().slice(0, 10));
        currentDate.setDate(currentDate.getDate() + 1);
    }

    return dates;
};