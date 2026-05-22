import React from 'react';
import Link from 'next/link';
import { Store, Star, ArrowLeft, ThumbsUp } from 'lucide-react';

interface SellerReviewsPageProps {
  params: Promise<{ id: string }>;
}

const REVIEWS_DATA: Record<number, {
  sellerName: string; averageRating: number; totalReviews: number;
  reviews: Array<{ id: number; customerName: string; rating: number; date: string; comment: string; productName: string }>;
}> = {
  1: {
    sellerName: 'TechWorld Store', averageRating: 4.8, totalReviews: 156,
    reviews: [
      { id: 1, customerName: 'John D.',  rating: 5, date: '2024-08-15', comment: 'Excellent products and fast shipping!',           productName: 'Wireless Headphones' },
      { id: 2, customerName: 'Sarah M.', rating: 4, date: '2024-08-10', comment: 'Good quality, but delivery was a bit slow.',      productName: 'Smart Watch' },
      { id: 3, customerName: 'Mike R.',  rating: 5, date: '2024-08-08', comment: 'Amazing customer service and product quality!',   productName: 'Wireless Headphones' },
      { id: 4, customerName: 'Lisa K.',  rating: 4, date: '2024-08-05', comment: 'Product as described, happy with purchase.',      productName: 'Smart Watch' },
    ],
  },
  2: {
    sellerName: 'Gaming Hub', averageRating: 4.6, totalReviews: 89,
    reviews: [
      { id: 5, customerName: 'Alex G.',  rating: 5, date: '2024-08-12', comment: 'Perfect gaming setup! Highly recommend.',         productName: 'Gaming Mouse' },
      { id: 6, customerName: 'Tom H.',   rating: 4, date: '2024-08-09', comment: 'Great mouse, very responsive for gaming.',        productName: 'Gaming Mouse' },
      { id: 7, customerName: 'Emma W.',  rating: 5, date: '2024-08-07', comment: "Best mechanical keyboard I've ever used!",        productName: 'Mechanical Keyboard' },
      { id: 8, customerName: 'Chris B.', rating: 3, date: '2024-08-03', comment: 'Good product but a bit overpriced.',              productName: 'Mechanical Keyboard' },
    ],
  },
  3: {
    sellerName: 'Electronics Plus', averageRating: 4.9, totalReviews: 203,
    reviews: [
      { id: 9,  customerName: 'David L.',  rating: 5, date: '2024-08-14', comment: 'Outstanding quality and value!',                productName: 'Wireless Earbuds' },
      { id: 10, customerName: 'Rachel P.', rating: 5, date: '2024-08-11', comment: 'Fast delivery and excellent customer service.', productName: 'Phone Charger' },
      { id: 11, customerName: 'Mark S.',   rating: 4, date: '2024-08-06', comment: 'Good product, works as expected.',              productName: 'Power Bank' },
      { id: 12, customerName: 'Anna T.',   rating: 5, date: '2024-08-04', comment: 'Perfect! Will definitely order again.',         productName: 'USB Cable' },
    ],
  },
  4: {
    sellerName: 'Smart Devices Co', averageRating: 4.5, totalReviews: 67,
    reviews: [
      { id: 13, customerName: 'Steve J.',  rating: 5, date: '2024-08-13', comment: 'Innovative smart home solution!',              productName: 'Smart Home Hub' },
      { id: 14, customerName: 'Kelly A.',  rating: 4, date: '2024-08-10', comment: 'Great security features, easy setup.',         productName: 'Security Camera' },
      { id: 15, customerName: 'Ryan M.',   rating: 4, date: '2024-08-08', comment: 'Smart bulbs work perfectly with my setup.',    productName: 'Smart Light Bulb' },
      { id: 16, customerName: 'Nicole F.', rating: 5, date: '2024-08-02', comment: 'Excellent door sensor, very reliable.',        productName: 'Door Sensor' },
    ],
  },
};

const Stars = ({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'lg' }) =>
  <span className={size === 'lg' ? 'text-2xl' : 'text-base'}>
    {'⭐'.repeat(rating)}{'☆'.repeat(5 - rating)}
  </span>;

export default async function SellerReviewsPage({ params }: SellerReviewsPageProps) {
  const { id } = await params;
  const data = REVIEWS_DATA[Number(id)];

  if (!data) {
    return (
      <div className="page-wrapper flex items-center justify-center p-6">
        <div className="card p-10 max-w-sm text-center">
          <Store className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--text-muted)' }} />
          <h1 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Seller Not Found</h1>
          <Link href={`/seller/${id}`} className="btn btn-primary mt-4 inline-flex">Back to Store</Link>
        </div>
      </div>
    );
  }

  const dist = [5, 4, 3, 2, 1].map(star => ({
    star,
    count: data.reviews.filter(r => r.rating === star).length,
    pct: (data.reviews.filter(r => r.rating === star).length / data.reviews.length) * 100,
  }));

  const fiveStars  = dist[0].count;
  const fourPlus   = dist[0].count + dist[1].count;

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div className="container-app">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Link href={`/seller/${id}`} className="btn btn-icon btn-ghost">
                <ArrowLeft className="w-4 h-4" />
              </Link>
              <div>
                <h1 className="section-title">{data.sellerName}</h1>
                <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                  Customer reviews &amp; ratings
                </p>
              </div>
            </div>
            <Link href={`/seller/${id}/products`} className="btn btn-outline btn-sm self-start sm:self-auto">
              View Products
            </Link>
          </div>
        </div>
      </div>

      <div className="container-app py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sidebar */}
          <div className="space-y-4">
            {/* Rating overview */}
            <div className="card p-6">
              <h2 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Rating Overview</h2>
              <div className="text-center mb-5">
                <p className="text-4xl font-bold mb-1" style={{ color: 'var(--accent-600)' }}>
                  {data.averageRating}
                </p>
                <Stars rating={Math.round(data.averageRating)} size="lg" />
                <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
                  {data.totalReviews} total reviews
                </p>
              </div>

              <div className="space-y-2">
                {dist.map(({ star, count, pct }) => (
                  <div key={star} className="flex items-center gap-2 text-sm">
                    <span className="w-5 text-right shrink-0" style={{ color: 'var(--text-muted)' }}>{star}</span>
                    <Star className="w-3 h-3 text-yellow-400 fill-current shrink-0" />
                    <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'var(--bg-secondary)' }}>
                      <div className="h-full rounded-full" style={{ width: `${pct}%`, background: 'var(--accent-500)' }} />
                    </div>
                    <span className="w-5 text-right shrink-0 text-xs" style={{ color: 'var(--text-muted)' }}>{count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick stats */}
            <div className="card p-6">
              <h3 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Quick Stats</h3>
              <div className="space-y-3 text-sm">
                {[
                  { label: '5-Star Reviews', value: fiveStars,  color: 'var(--accent-600)' },
                  { label: '4+ Star Reviews', value: fourPlus,  color: '#3b82f6' },
                  { label: 'Recent Reviews',  value: data.reviews.length, color: '#8b5cf6' },
                ].map(({ label, value, color }) => (
                  <div key={label} className="flex justify-between items-center">
                    <span style={{ color: 'var(--text-secondary)' }}>{label}</span>
                    <span className="font-semibold" style={{ color }}>{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Reviews list */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                Customer Reviews ({data.reviews.length})
              </h2>
              <select className="input" style={{ width: 'auto', paddingTop: '0.375rem', paddingBottom: '0.375rem' }}>
                <option>Most Recent</option>
                <option>Highest Rating</option>
                <option>Lowest Rating</option>
              </select>
            </div>

            {data.reviews.map(review => (
              <div key={review.id} className="card p-5">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                        {review.customerName}
                      </span>
                      <Stars rating={review.rating} />
                    </div>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      {review.date} · {review.productName}
                    </p>
                  </div>
                  <span className="badge badge-green shrink-0">Verified Purchase</span>
                </div>

                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{review.comment}</p>

                <div className="flex items-center gap-3 mt-4 pt-3 border-t border-[var(--border)]">
                  <button className="flex items-center gap-1.5 text-xs hover:underline"
                    style={{ color: 'var(--text-muted)' }}>
                    <ThumbsUp className="w-3.5 h-3.5" /> Helpful (12)
                  </button>
                  <button className="text-xs hover:underline" style={{ color: 'var(--text-muted)' }}>
                    Reply
                  </button>
                </div>
              </div>
            ))}

            <div className="text-center pt-2">
              <button className="btn btn-outline">Load More Reviews</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
