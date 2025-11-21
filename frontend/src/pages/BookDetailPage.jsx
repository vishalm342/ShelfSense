import { useParams } from 'react-router-dom';

const BookDetailPage = () => {
  const { id } = useParams();

  return (
    <div className="min-h-screen p-8">
      <h1 className="text-4xl font-bold mb-6">Book Details</h1>
      <p className="text-text-charcoal">Book ID: {id}</p>
      <p className="text-text-charcoal mt-4">Book detail page coming soon...</p>
    </div>
  );
};

export default BookDetailPage;
