import ProductForm from '../ProductForm';

export default function NewProductPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Add New Product</h1>
        <p className="text-gray-600">Create a new product for your active campaigns</p>
      </div>

      <ProductForm />
    </div>
  );
}
