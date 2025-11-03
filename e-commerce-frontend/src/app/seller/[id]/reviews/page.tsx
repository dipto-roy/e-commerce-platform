import React from "react";
import Link from "next/link";

interface SellerReviewsPageProps {
  params: Promise<{ id: string }>;
}

export default async function SellerReviewsPage({ params }: SellerReviewsPageProps) {
  const { id } = await params;

  // Mock reviews data
  const reviewsData = {
    1: {
      sellerName: "TechWorld Store",
      averageRating: 4.8,
      totalReviews: 156,
      reviews: [
        { id: 1, customerName: "John D.", rating: 5, date: "2024-08-15", comment: "Excellent products and fast shipping!", productName: "Wireless Headphones" },
        { id: 2, customerName: "Sarah M.", rating: 4, date: "2024-08-10", comment: "Good quality, but delivery was a bit slow.", productName: "Smart Watch" },
        { id: 3, customerName: "Mike R.", rating: 5, date: "2024-08-08", comment: "Amazing customer service and product quality!", productName: "Wireless Headphones" },
        { id: 4, customerName: "Lisa K.", rating: 4, date: "2024-08-05", comment: "Product as described, happy with purchase.", productName: "Smart Watch" },
      ]
    },
    2: {
      sellerName: "Gaming Hub",
      averageRating: 4.6,
      totalReviews: 89,
      reviews: [
        { id: 5, customerName: "Alex G.", rating: 5, date: "2024-08-12", comment: "Perfect gaming setup! Highly recommend.", productName: "Gaming Mouse" },
        { id: 6, customerName: "Tom H.", rating: 4, date: "2024-08-09", comment: "Great mouse, very responsive for gaming.", productName: "Gaming Mouse" },
        { id: 7, customerName: "Emma W.", rating: 5, date: "2024-08-07", comment: "Best mechanical keyboard I've ever used!", productName: "Mechanical Keyboard" },
        { id: 8, customerName: "Chris B.", rating: 3, date: "2024-08-03", comment: "Good product but a bit overpriced.", productName: "Mechanical Keyboard" },
      ]
    },
    3: {
      sellerName: "Electronics Plus",
      averageRating: 4.9,
      totalReviews: 203,
      reviews: [
        { id: 9, customerName: "David L.", rating: 5, date: "2024-08-14", comment: "Outstanding quality and value!", productName: "Wireless Earbuds" },
        { id: 10, customerName: "Rachel P.", rating: 5, date: "2024-08-11", comment: "Fast delivery and excellent customer service.", productName: "Phone Charger" },
        { id: 11, customerName: "Mark S.", rating: 4, date: "2024-08-06", comment: "Good product, works as expected.", productName: "Power Bank" },
        { id: 12, customerName: "Anna T.", rating: 5, date: "2024-08-04", comment: "Perfect! Will definitely order again.", productName: "USB Cable" },
      ]
    },
    4: {
      sellerName: "Smart Devices Co",
      averageRating: 4.5,
      totalReviews: 67,
      reviews: [
        { id: 13, customerName: "Steve J.", rating: 5, date: "2024-08-13", comment: "Innovative smart home solution!", productName: "Smart Home Hub" },
        { id: 14, customerName: "Kelly A.", rating: 4, date: "2024-08-10", comment: "Great security features, easy setup.", productName: "Security Camera" },
        { id: 15, customerName: "Ryan M.", rating: 4, date: "2024-08-08", comment: "Smart bulbs work perfectly with my setup.", productName: "Smart Light Bulb" },
        { id: 16, customerName: "Nicole F.", rating: 5, date: "2024-08-02", comment: "Excellent door sensor, very reliable.", productName: "Door Sensor" },
      ]
    }
  };

  const sellerReviews = reviewsData[Number(id) as keyof typeof reviewsData];

  if (!sellerReviews) {
    return (
      <div className="text-center text-white mt-20">
        <h1 className="text-3xl font-bold">Seller Not Found</h1>
        <Link href="/seller" className="text-purple-400 hover:text-purple-300 mt-4 inline-block">
          Back to Sellers
        </Link>
      </div>
    );
  }

  const getRatingStars = (rating: number) => {
    return "⭐".repeat(rating) + "☆".repeat(5 - rating);
  };

  const ratingDistribution = [5, 4, 3, 2, 1].map(star => ({
    star,
    count: sellerReviews.reviews.filter(r => r.rating === star).length,
    percentage: (sellerReviews.reviews.filter(r => r.rating === star).length / sellerReviews.reviews.length) * 100
  }));

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">{sellerReviews.sellerName} - Reviews</h1>
          <p className="text-gray-400">Customer feedback and ratings</p>
        </div>
        <Link href={`/seller/${id}`} className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition">
          Back to Store
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Reviews Summary */}
        <div className="lg:col-span-1">
          <div className="bg-gray-800 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold text-white mb-4">Rating Overview</h2>
            <div className="text-center mb-6">
              <div className="text-4xl font-bold text-purple-400 mb-2">{sellerReviews.averageRating}</div>
              <div className="text-yellow-400 text-2xl mb-2">{getRatingStars(Math.round(sellerReviews.averageRating))}</div>
              <div className="text-gray-400">{sellerReviews.totalReviews} total reviews</div>
            </div>

            {/* Rating Distribution */}
            <div className="space-y-2">
              {ratingDistribution.map(({ star, count, percentage }) => (
                <div key={star} className="flex items-center text-sm">
                  <span className="w-6 text-gray-300">{star}⭐</span>
                  <div className="flex-1 mx-2 bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-purple-500 h-2 rounded-full" 
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  <span className="w-8 text-gray-400">{count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Quick Stats</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">5-Star Reviews:</span>
                <span className="text-green-400">{ratingDistribution[0].count}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">4+ Star Reviews:</span>
                <span className="text-blue-400">{ratingDistribution[0].count + ratingDistribution[1].count}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Recent Reviews:</span>
                <span className="text-purple-400">{sellerReviews.reviews.length}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews List */}
        <div className="lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-white">Customer Reviews</h2>
            <select className="bg-gray-700 text-white px-3 py-2 rounded">
              <option>Most Recent</option>
              <option>Highest Rating</option>
              <option>Lowest Rating</option>
              <option>Most Helpful</option>
            </select>
          </div>

          <div className="space-y-4">
            {sellerReviews.reviews.map((review) => (
              <div key={review.id} className="bg-gray-800 rounded-lg p-6">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-white">{review.customerName}</span>
                      <span className="text-yellow-400">{getRatingStars(review.rating)}</span>
                    </div>
                    <div className="text-sm text-gray-400">{review.date} • {review.productName}</div>
                  </div>
                  <div className="text-sm text-purple-400">Verified Purchase</div>
                </div>
                <p className="text-gray-300">{review.comment}</p>
                <div className="mt-4 flex gap-2">
                  <button className="text-sm text-gray-400 hover:text-white">👍 Helpful (12)</button>
                  <button className="text-sm text-gray-400 hover:text-white">Reply</button>
                </div>
              </div>
            ))}
          </div>

          {/* Load More Button */}
          <div className="text-center mt-8">
            <button className="bg-purple-600 text-white px-6 py-2 rounded hover:bg-purple-700 transition">
              Load More Reviews
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
